<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use App\Services\PesapalService;
use App\Services\StellarService;

class PaymentController extends Controller
{
    private $consumerKey;
    private $consumerSecret;
    private $businessShortCode;
    private $passkey;
    private $callbackUrl;
    private $baseUrl;
    private $stellarService;

    public function __construct(StellarService $stellarService)
    {
        $this->stellarService = $stellarService;
        $this->consumerKey = 'tDcVSvHk2KPYGpTYGfOZC4aWlwmOaSqOXDMVQDWHACAEbX8f';
        $this->consumerSecret = 'uBehSV388ZtcoUjLCoRioIAbAg9HQfZm0PgYubcyPQ0FDSGNicXMJ74fUOE1MuPP';
        $this->businessShortCode = '174379';
        $this->passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
        $this->callbackUrl = 'https://c0f38ff01648.ngrok-free.app/api/payments/mpesa/callback';
        $this->baseUrl = 'https://sandbox.safaricom.co.ke';
    }

    /**
     * Generate M-Pesa access token
     */
    public function generateAccessToken(): JsonResponse
    {
        try {
            Log::info('Starting M-Pesa access token generation', [
                'consumer_key' => substr($this->consumerKey, 0, 8) . '...',
                'base_url' => $this->baseUrl
            ]);

            // Check if we have a cached token
            $cachedToken = Cache::get('mpesa_access_token');
            if ($cachedToken) {
                Log::info('Using cached M-Pesa access token');
                return response()->json([
                    'access_token' => $cachedToken,
                    'expires_in' => '3599'
                ]);
            }

            $credentials = base64_encode($this->consumerKey . ':' . $this->consumerSecret);
            $url = $this->baseUrl . '/oauth/v1/generate?grant_type=client_credentials';

            Log::info('Making M-Pesa auth request', [
                'url' => $url,
                'credentials_length' => strlen($credentials)
            ]);

            // Use cURL directly for M-Pesa requests
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Basic ' . $credentials,
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Laravel/9.0 (Tiba Cloud Medical Platform)');

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            Log::info('M-Pesa auth response received', [
                'status' => $httpCode,
                'response' => $response,
                'curl_error' => $curlError
            ]);

            if ($httpCode === 200 && !$curlError) {
                $data = json_decode($response, true);

                if (!isset($data['access_token'])) {
                    Log::error('M-Pesa auth response missing access_token', ['response' => $data]);
                    return response()->json([
                        'error' => 'Invalid response from M-Pesa',
                        'message' => 'Access token not found in response'
                    ], 500);
                }

                // Cache the token for 50 minutes (expires in 1 hour)
                Cache::put('mpesa_access_token', $data['access_token'], now()->addMinutes(50));

                Log::info('M-Pesa access token generated and cached successfully');

                return response()->json($data);
            } else {
                Log::error('Failed to generate M-Pesa access token', [
                    'status' => $httpCode,
                    'response' => $response,
                    'curl_error' => $curlError
                ]);

                return response()->json([
                    'error' => 'Failed to generate access token',
                    'message' => 'Authentication failed with M-Pesa API: ' . ($curlError ?: 'HTTP ' . $httpCode),
                    'status' => $httpCode
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Exception while generating M-Pesa access token', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to authenticate with M-Pesa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initiate STK Push
     */
    public function initiateSTKPush(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'phoneNumber' => 'required|string|regex:/^254[0-9]{9}$/',
                'accountReference' => 'required|string|max:50',
                'transactionDesc' => 'required|string|max:100'
            ]);

            // Get access token
            $tokenResponse = $this->generateAccessToken();
            $tokenData = $tokenResponse->getData(true);

            if (!isset($tokenData['access_token'])) {
                return response()->json([
                    'error' => 'Authentication failed',
                    'message' => 'Could not obtain access token'
                ], 500);
            }

            $accessToken = $tokenData['access_token'];

            // Generate timestamp
            $timestamp = Carbon::now()->format('YmdHis');

            // Generate password
            $password = base64_encode($this->businessShortCode . $this->passkey . $timestamp);

            $payload = [
                'BusinessShortCode' => $this->businessShortCode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => intval($request->amount),
                'PartyA' => $request->phoneNumber,
                'PartyB' => $this->businessShortCode,
                'PhoneNumber' => $request->phoneNumber,
                'CallBackURL' => $this->callbackUrl,
                'AccountReference' => $request->accountReference,
                'TransactionDesc' => $request->transactionDesc
            ];

            Log::info('Initiating STK Push', [
                'payload' => $payload,
                'phone' => $request->phoneNumber,
                'amount' => $request->amount
            ]);

            // Use cURL for STK Push request
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/mpesa/stkpush/v1/processrequest');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Laravel/9.0 (Tiba Cloud Medical Platform)');

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($httpCode === 200 && !$curlError) {
                $data = json_decode($response, true);

                Log::info('STK Push initiated successfully', [
                    'response' => $data,
                    'phone' => $request->phoneNumber,
                    'amount' => $request->amount,
                    'account_reference' => $request->accountReference
                ]);

                // Store the checkout request for status checking
                Cache::put('mpesa_checkout_' . $data['CheckoutRequestID'], [
                    'phone' => $request->phoneNumber,
                    'amount' => $request->amount,
                    'account_reference' => $request->accountReference,
                    'transaction_desc' => $request->transactionDesc,
                    'initiated_at' => now()
                ], now()->addHours(1));

                return response()->json($data);
            } else {
                $errorData = json_decode($response, true);
                Log::error('Failed to initiate STK Push', [
                    'status' => $httpCode,
                    'response' => $response,
                    'curl_error' => $curlError,
                    'phone' => $request->phoneNumber,
                    'amount' => $request->amount
                ]);

                // Extract specific error message
                $errorMessage = 'Failed to initiate payment';
                if ($errorData) {
                    if (isset($errorData['errorMessage'])) {
                        $errorMessage = $errorData['errorMessage'];
                    } elseif (isset($errorData['errorCode'])) {
                        $errorMessage = $errorData['errorCode'];
                    } elseif (isset($errorData['RequestId']) && isset($errorData['ErrorMessage'])) {
                        $errorMessage = $errorData['ErrorMessage'];
                    }
                } elseif ($curlError) {
                    $errorMessage = $curlError;
                }

                return response()->json([
                    'error' => 'STK Push failed',
                    'message' => $errorMessage,
                    'details' => $errorData
                ], 400);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Exception while initiating STK Push', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to process payment request'
            ], 500);
        }
    }

    /**
     * Check STK Push payment status
     */
    public function checkPaymentStatus($checkoutRequestId): JsonResponse
    {
        try {
            // Get access token
            $tokenResponse = $this->generateAccessToken();
            $tokenData = $tokenResponse->getData(true);

            if (!isset($tokenData['access_token'])) {
                return response()->json([
                    'error' => 'Authentication failed',
                    'message' => 'Could not obtain access token'
                ], 500);
            }

            $accessToken = $tokenData['access_token'];

            // Generate timestamp
            $timestamp = Carbon::now()->format('YmdHis');

            // Generate password
            $password = base64_encode($this->businessShortCode . $this->passkey . $timestamp);

            $payload = [
                'BusinessShortCode' => $this->businessShortCode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'CheckoutRequestID' => $checkoutRequestId
            ];

            // Use cURL for status query
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/mpesa/stkpushquery/v1/query');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Laravel/9.0 (Tiba Cloud Medical Platform)');

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($httpCode === 200 && !$curlError) {
                $data = json_decode($response, true);

                Log::info('Payment status checked', [
                    'checkout_request_id' => $checkoutRequestId,
                    'response' => $data
                ]);

                return response()->json($data);
            } else {
                $errorData = json_decode($response, true);
                Log::error('Failed to check payment status', [
                    'status' => $httpCode,
                    'response' => $response,
                    'curl_error' => $curlError,
                    'checkout_request_id' => $checkoutRequestId
                ]);

                return response()->json([
                    'error' => 'Status check failed',
                    'message' => ($errorData['errorMessage'] ?? $curlError) ?: 'Failed to check payment status'
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Exception while checking payment status', [
                'message' => $e->getMessage(),
                'checkout_request_id' => $checkoutRequestId,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to check payment status'
            ], 500);
        }
    }

    /**
     * Handle M-Pesa callback
     */
    public function handleCallback(Request $request): JsonResponse
    {
        try {
            $callbackData = $request->all();

            Log::info('M-Pesa callback received', [
                'data' => $callbackData,
                'headers' => $request->headers->all(),
                'ip' => $request->ip()
            ]);

            // Extract the callback data
            $stkCallback = $callbackData['Body']['stkCallback'] ?? null;

            if (!$stkCallback) {
                Log::warning('Invalid callback data received');
                return response()->json(['message' => 'Invalid callback data'], 400);
            }

            $merchantRequestId = $stkCallback['MerchantRequestID'] ?? null;
            $checkoutRequestId = $stkCallback['CheckoutRequestID'] ?? null;
            $resultCode = $stkCallback['ResultCode'] ?? null;
            $resultDesc = $stkCallback['ResultDesc'] ?? null;

            // Get stored request data
            $storedData = Cache::get('mpesa_checkout_' . $checkoutRequestId);

            if ($resultCode == 0) {
                // Payment successful
                $callbackMetadata = $stkCallback['CallbackMetadata']['Item'] ?? [];
                $paymentData = [];

                foreach ($callbackMetadata as $item) {
                    $paymentData[$item['Name']] = $item['Value'] ?? null;
                }

            Log::info('Payment successful', [
                'checkout_request_id' => $checkoutRequestId,
                'merchant_request_id' => $merchantRequestId,
                'amount' => $paymentData['Amount'] ?? null,
                'mpesa_receipt' => $paymentData['MpesaReceiptNumber'] ?? null,
                'phone' => $paymentData['PhoneNumber'] ?? null
            ]);

                // Store successful payment data
                Cache::put('mpesa_payment_' . $checkoutRequestId, [
                    'status' => 'success',
                    'result_code' => $resultCode,
                    'result_desc' => $resultDesc,
                    'amount' => $paymentData['Amount'] ?? null,
                    'mpesa_receipt_number' => $paymentData['MpesaReceiptNumber'] ?? null,
                    'transaction_date' => $paymentData['TransactionDate'] ?? null,
                    'phone_number' => $paymentData['PhoneNumber'] ?? null,
                    'processed_at' => now()
                ], now()->addDays(7));

                // Process Stellar/Soroban integration
                $this->processStellarPayment($paymentData, $checkoutRequestId);

            } else {
            // Payment failed
            Log::warning('Payment failed', [
                'checkout_request_id' => $checkoutRequestId,
                'merchant_request_id' => $merchantRequestId,
                'result_code' => $resultCode,
                'result_desc' => $resultDesc
            ]);

                // Store failed payment data
                Cache::put('mpesa_payment_' . $checkoutRequestId, [
                    'status' => 'failed',
                    'result_code' => $resultCode,
                    'result_desc' => $resultDesc,
                    'processed_at' => now()
                ], now()->addDays(7));
            }

            return response()->json(['message' => 'Callback processed successfully']);

        } catch (\Exception $e) {
            Log::error('Exception while processing M-Pesa callback', [
                'message' => $e->getMessage(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Callback processing failed'], 500);
        }
    }

    /**
     * Process Stellar/Soroban payment after successful M-Pesa transaction
     */
    private function processStellarPayment($paymentData, $checkoutRequestId)
    {
        try {
            Log::info('Processing Stellar payment for M-Pesa transaction', [
                'checkout_request_id' => $checkoutRequestId,
                'mpesa_receipt' => $paymentData['MpesaReceiptNumber'] ?? null,
                'amount' => $paymentData['Amount'] ?? null
            ]);

            // Convert KES amount to USDC
            $kesAmount = floatval($paymentData['Amount'] ?? 0);
            $usdcAmount = $this->stellarService->convertKesToUsdc($kesAmount);

            // Prepare payment data for Soroban
            $stellarPaymentData = [
                'mpesa_receipt' => $paymentData['MpesaReceiptNumber'] ?? null,
                'amount' => $kesAmount,
                'usdc_amount' => $usdcAmount,
                'phone_number' => $paymentData['PhoneNumber'] ?? null,
                'timestamp' => now()->toISOString(),
                'checkout_request_id' => $checkoutRequestId
            ];

            // Record payment on Soroban smart contract
            $sorobanResult = $this->stellarService->recordPaymentOnSoroban($stellarPaymentData);

            if ($sorobanResult['success']) {
                Log::info('Payment successfully recorded on Soroban', [
                    'transaction_hash' => $sorobanResult['transaction_hash'] ?? null,
                    'checkout_request_id' => $checkoutRequestId
                ]);

                // Store Stellar transaction data
                Cache::put('stellar_payment_' . $checkoutRequestId, [
                    'status' => 'success',
                    'transaction_hash' => $sorobanResult['transaction_hash'] ?? null,
                    'usdc_amount' => $usdcAmount,
                    'kes_amount' => $kesAmount,
                    'processed_at' => now()
                ], now()->addDays(30));

                // Optional: Create actual USDC payment to destination wallet
                $destinationWallet = config('stellar.TIBA_STELLAR_DESTINATION_WALLET');
                if ($destinationWallet && $usdcAmount > 0) {
                    $memo = config('stellar.TIBA_PAYMENT_MEMO_PREFIX', 'TibaCloud-') . $checkoutRequestId;

                    $paymentResult = $this->stellarService->createPayment(
                        $destinationWallet,
                        $usdcAmount,
                        'USDC',
                        $memo
                    );

                    if ($paymentResult['success']) {
                        Log::info('USDC payment sent successfully', [
                            'transaction_hash' => $paymentResult['transaction_hash'],
                            'amount' => $usdcAmount,
                            'destination' => $destinationWallet
                        ]);

                        // Update cache with payment transaction hash
                        $stellarCache = Cache::get('stellar_payment_' . $checkoutRequestId, []);
                        $stellarCache['usdc_payment_hash'] = $paymentResult['transaction_hash'];
                        Cache::put('stellar_payment_' . $checkoutRequestId, $stellarCache, now()->addDays(30));
                    }
                }

            } else {
                Log::error('Failed to record payment on Soroban', [
                    'error' => $sorobanResult['error'] ?? 'Unknown error',
                    'checkout_request_id' => $checkoutRequestId
                ]);

                // Store failed Stellar transaction
                Cache::put('stellar_payment_' . $checkoutRequestId, [
                    'status' => 'failed',
                    'error' => $sorobanResult['error'] ?? 'Unknown error',
                    'processed_at' => now()
                ], now()->addDays(7));
            }

        } catch (\Exception $e) {
            Log::error('Exception while processing Stellar payment', [
                'error' => $e->getMessage(),
                'checkout_request_id' => $checkoutRequestId,
                'trace' => $e->getTraceAsString()
            ]);

            // Store exception in cache
            Cache::put('stellar_payment_' . $checkoutRequestId, [
                'status' => 'exception',
                'error' => $e->getMessage(),
                'processed_at' => now()
            ], now()->addDays(7));
        }
    }

    /**
     * Get payment result - first check cache, then query M-Pesa API if needed
     */
    public function getPaymentResult($checkoutRequestId): JsonResponse
    {
        try {
            // First check if we have a cached result (from callback)
            $paymentData = Cache::get('mpesa_payment_' . $checkoutRequestId);

            if ($paymentData) {
                Log::info('Found cached payment result', [
                    'checkout_request_id' => $checkoutRequestId,
                    'status' => $paymentData['status']
                ]);

                return response()->json([
                    'ResultCode' => $paymentData['status'] === 'success' ? '0' : $paymentData['result_code'],
                    'ResultDesc' => $paymentData['result_desc'],
                    'CheckoutRequestID' => $checkoutRequestId,
                    'MerchantRequestID' => str_replace('checkout', 'merchant', $checkoutRequestId),
                    'Amount' => $paymentData['amount'] ?? null,
                    'MpesaReceiptNumber' => $paymentData['mpesa_receipt_number'] ?? null,
                    'TransactionDate' => $paymentData['transaction_date'] ?? null,
                    'PhoneNumber' => $paymentData['phone_number'] ?? null
                ]);
            }

            // If no cached result, query M-Pesa API directly
            Log::info('No cached result found, querying M-Pesa API', [
                'checkout_request_id' => $checkoutRequestId
            ]);

            // Get access token
            $tokenResponse = $this->generateAccessToken();
            $tokenData = $tokenResponse->getData(true);

            if (!isset($tokenData['access_token'])) {
                return response()->json([
                    'ResultCode' => '1037',
                    'ResultDesc' => 'Authentication failed - STK Request in progress',
                    'CheckoutRequestID' => $checkoutRequestId
                ]);
            }

            $accessToken = $tokenData['access_token'];

            // Generate timestamp and password for status query
            $timestamp = Carbon::now()->format('YmdHis');
            $password = base64_encode($this->businessShortCode . $this->passkey . $timestamp);

            $payload = [
                'BusinessShortCode' => $this->businessShortCode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'CheckoutRequestID' => $checkoutRequestId
            ];

            // Use cURL for status query
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/mpesa/stkpushquery/v1/query');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Laravel/9.0 (Tiba Cloud Medical Platform)');

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($httpCode === 200 && !$curlError) {
                $statusData = json_decode($response, true);

                Log::info('M-Pesa status query successful', [
                    'checkout_request_id' => $checkoutRequestId,
                    'response' => $statusData
                ]);

                // If payment is complete (success or failure), cache the result
                if (isset($statusData['ResultCode']) && $statusData['ResultCode'] !== '1037') {
                    $cacheData = [
                        'status' => $statusData['ResultCode'] === '0' ? 'success' : 'failed',
                        'result_code' => $statusData['ResultCode'],
                        'result_desc' => $statusData['ResultDesc'],
                        'processed_at' => now()
                    ];

                    // If successful, add payment details
                    if ($statusData['ResultCode'] === '0' && isset($statusData['CallbackMetadata'])) {
                        $metadata = $statusData['CallbackMetadata']['Item'] ?? [];
                        foreach ($metadata as $item) {
                            if ($item['Name'] === 'Amount') {
                                $cacheData['amount'] = $item['Value'];
                            } elseif ($item['Name'] === 'MpesaReceiptNumber') {
                                $cacheData['mpesa_receipt_number'] = $item['Value'];
                            } elseif ($item['Name'] === 'TransactionDate') {
                                $cacheData['transaction_date'] = $item['Value'];
                            } elseif ($item['Name'] === 'PhoneNumber') {
                                $cacheData['phone_number'] = $item['Value'];
                            }
                        }
                    }

                    Cache::put('mpesa_payment_' . $checkoutRequestId, $cacheData, now()->addDays(7));
                }

                return response()->json($statusData);
            } else {
                // Check if the error response contains "processing" message
                $errorData = json_decode($response, true);
                $errorMessage = $errorData['errorMessage'] ?? $response ?? 'Unknown error';

                if (stripos($errorMessage, 'still under processing') !== false ||
                    stripos($errorMessage, 'transaction is processing') !== false) {
                    Log::info('M-Pesa transaction still processing', [
                        'checkout_request_id' => $checkoutRequestId,
                        'message' => $errorMessage
                    ]);

                    // Return processing status instead of error
                    return response()->json([
                        'ResultCode' => '1037',
                        'ResultDesc' => 'Transaction is still under processing',
                        'CheckoutRequestID' => $checkoutRequestId
                    ]);
                }

                Log::warning('M-Pesa status query failed', [
                    'checkout_request_id' => $checkoutRequestId,
                    'status' => $httpCode,
                    'response' => $response,
                    'curl_error' => $curlError
                ]);

                // Return "in progress" status if query fails
                return response()->json([
                    'ResultCode' => '1037',
                    'ResultDesc' => 'STK Request in progress',
                    'CheckoutRequestID' => $checkoutRequestId
                ]);
            }

        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();

            // Check if the exception message indicates processing status
            if (stripos($errorMessage, 'still under processing') !== false ||
                stripos($errorMessage, 'transaction is processing') !== false) {
                Log::info('M-Pesa transaction still processing (from exception)', [
                    'checkout_request_id' => $checkoutRequestId,
                    'message' => $errorMessage
                ]);

                return response()->json([
                    'ResultCode' => '1037',
                    'ResultDesc' => 'Transaction is still under processing',
                    'CheckoutRequestID' => $checkoutRequestId
                ]);
            }

            Log::error('Exception while getting payment result', [
                'message' => $errorMessage,
                'checkout_request_id' => $checkoutRequestId,
                'trace' => $e->getTraceAsString()
            ]);

            // Return "in progress" status if there's an exception
            return response()->json([
                'ResultCode' => '1037',
                'ResultDesc' => 'STK Request in progress',
                'CheckoutRequestID' => $checkoutRequestId
            ]);
        }
    }

    /**
     * Test endpoint to verify M-Pesa controller is working
     */
    public function testConnection(): JsonResponse
    {
        try {
            // Test basic configuration
            $config = [
                'consumer_key' => substr($this->consumerKey, 0, 8) . '...',
                'business_short_code' => $this->businessShortCode,
                'base_url' => $this->baseUrl,
                'callback_url' => $this->callbackUrl,
                'credentials_set' => !empty($this->consumerKey) && !empty($this->consumerSecret),
                'passkey_set' => !empty($this->passkey)
            ];

            // Test access token generation
            try {
                $tokenResponse = $this->generateAccessToken();
                $tokenData = $tokenResponse->getData(true);

                if (isset($tokenData['access_token'])) {
                    $config['token_test'] = 'success';
                    $config['token_preview'] = substr($tokenData['access_token'], 0, 10) . '...';
                } else {
                    $config['token_test'] = 'failed';
                    $config['token_error'] = $tokenData['message'] ?? 'Unknown error';
                }
            } catch (\Exception $e) {
                $config['token_test'] = 'exception';
                $config['token_error'] = $e->getMessage();
            }

            return response()->json([
                'status' => 'success',
                'message' => 'M-Pesa Payment Controller test completed',
                'timestamp' => now(),
                'configuration' => $config,
                'next_steps' => [
                    'If token_test is failed, check your M-Pesa credentials',
                    'If token_test is success, try initiating a payment',
                    'Check Laravel logs for detailed error information'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in test connection', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Controller test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initiate Pesapal payment
     */
    public function initiatePesapalPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'email' => 'required|email',
                'phone_number' => 'required|string',
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'description' => 'required|string',
                'lab_provider_id' => 'required|integer',
                'patient_id' => 'required|integer'
            ]);

            $pesapalService = new PesapalService();

            // Generate merchant reference
            $merchantReference = $pesapalService->generateMerchantReference(
                $request->lab_provider_id,
                $request->patient_id
            );

            // Step 1: Get access token (already done in submitOrder method)
            // Step 2: Register fresh IPN ID
            Log::info('Registering fresh IPN for payment');
            $ipnId = $pesapalService->getIPNId();
            Log::info('IPN registered', ['ipn_id' => $ipnId]);

            // Validate that we have a valid IPN ID before proceeding
            if (!$ipnId) {
                Log::error('Failed to get or register IPN ID');
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment service configuration error. Please try again later.'
                ], 500);
            }

            $orderData = [
                'merchant_reference' => $merchantReference,
                'amount' => $request->amount,
                'description' => $request->description,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'address' => $request->address ?? '',
                'city' => $request->city ?? 'Nairobi',
                'state' => $request->state ?? 'Nairobi',
                'postal_code' => $request->postal_code ?? '00100',
                'zip_code' => $request->zip_code ?? '00100',
                'notification_id' => $ipnId
            ];

            // Step 3: Submit order and get redirect URL
            Log::info('Submitting order to Pesapal', ['merchant_reference' => $merchantReference]);
            $response = $pesapalService->submitOrder($orderData);

            Log::info('Pesapal order response', ['response' => $response]);

            if (isset($response['order_tracking_id']) && isset($response['redirect_url'])) {
                // Store payment data for tracking
                Cache::put('pesapal_payment_' . $merchantReference, [
                    'order_tracking_id' => $response['order_tracking_id'],
                    'merchant_reference' => $merchantReference,
                    'amount' => $request->amount,
                    'lab_provider_id' => $request->lab_provider_id,
                    'patient_id' => $request->patient_id,
                    'description' => $request->description,
                    'initiated_at' => now()
                ], now()->addHours(24));

                Log::info('Pesapal payment initiated successfully', [
                    'merchant_reference' => $merchantReference,
                    'order_tracking_id' => $response['order_tracking_id'],
                    'amount' => $request->amount
                ]);

                return response()->json([
                    'status' => 'success',
                    'merchant_reference' => $merchantReference,
                    'order_tracking_id' => $response['order_tracking_id'],
                    'redirect_url' => $response['redirect_url']
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to initiate payment'
            ], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Pesapal payment initiation failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Payment initiation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Pesapal IPN callback
     */
    public function handlePesapalIPN(Request $request): JsonResponse
    {
        try {
            $orderTrackingId = $request->get('OrderTrackingId');
            $orderMerchantReference = $request->get('OrderMerchantReference');

            Log::info('Pesapal IPN received', [
                'order_tracking_id' => $orderTrackingId,
                'merchant_reference' => $orderMerchantReference,
                'all_params' => $request->all()
            ]);

            if (!$orderTrackingId || !$orderMerchantReference) {
                Log::warning('Invalid Pesapal IPN data received');
                return response()->json(['message' => 'Invalid IPN data'], 400);
            }

            $pesapalService = new PesapalService();
            $transactionStatus = $pesapalService->getTransactionStatus($orderTrackingId);

            // Update payment status in cache
            $paymentData = Cache::get('pesapal_payment_' . $orderMerchantReference);
            if ($paymentData) {
                $paymentData['status'] = $transactionStatus['payment_status_description'] ?? 'UNKNOWN';
                $paymentData['payment_method'] = $transactionStatus['payment_method'] ?? null;
                $paymentData['confirmation_code'] = $transactionStatus['confirmation_code'] ?? null;
                $paymentData['updated_at'] = now();

                Cache::put('pesapal_payment_' . $orderMerchantReference, $paymentData, now()->addDays(7));

                Log::info('Pesapal payment status updated', [
                    'merchant_reference' => $orderMerchantReference,
                    'status' => $paymentData['status'],
                    'payment_method' => $paymentData['payment_method']
                ]);
            }

            return response()->json(['message' => 'IPN processed successfully']);

        } catch (\Exception $e) {
            Log::error('Pesapal IPN processing failed', [
                'message' => $e->getMessage(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'IPN processing failed'], 500);
        }
    }

    /**
     * Get Pesapal payment status
     */
    public function getPesapalPaymentStatus($merchantReference): JsonResponse
    {
        try {
            // First check cached payment data
            $paymentData = Cache::get('pesapal_payment_' . $merchantReference);

            if (!$paymentData) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment not found'
                ], 404);
            }

            // If we have an order tracking ID, get fresh status from Pesapal
            if (isset($paymentData['order_tracking_id'])) {
                try {
                    $pesapalService = new PesapalService();
                    $transactionStatus = $pesapalService->getTransactionStatus($paymentData['order_tracking_id']);

                    $currentStatus = $transactionStatus['payment_status_description'] ?? 'UNKNOWN';

                    // Update cached data with fresh status
                    $paymentData['status'] = $currentStatus;
                    $paymentData['payment_method'] = $transactionStatus['payment_method'] ?? null;
                    $paymentData['confirmation_code'] = $transactionStatus['confirmation_code'] ?? null;
                    $paymentData['updated_at'] = now();

                    Cache::put('pesapal_payment_' . $merchantReference, $paymentData, now()->addDays(7));

                    Log::info('Pesapal payment status retrieved', [
                        'merchant_reference' => $merchantReference,
                        'status' => $currentStatus,
                        'order_tracking_id' => $paymentData['order_tracking_id']
                    ]);

                } catch (\Exception $e) {
                    Log::warning('Failed to get fresh status from Pesapal, using cached data', [
                        'merchant_reference' => $merchantReference,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return response()->json([
                'status' => 'success',
                'payment_status' => $paymentData['status'] ?? 'PENDING',
                'merchant_reference' => $merchantReference,
                'order_tracking_id' => $paymentData['order_tracking_id'] ?? null,
                'amount' => $paymentData['amount'] ?? null,
                'payment_method' => $paymentData['payment_method'] ?? null,
                'confirmation_code' => $paymentData['confirmation_code'] ?? null
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get Pesapal payment status', [
                'merchant_reference' => $merchantReference,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get payment status'
            ], 500);
        }
    }

    /**
     * Register IPN with Pesapal (Step 2)
     */
    public function registerPesapalIPN(): JsonResponse
    {
        try {
            $pesapalService = new PesapalService();

            Log::info('Registering IPN with Pesapal');

            $result = $pesapalService->registerIPN();

            return response()->json([
                'status' => 'success',
                'message' => 'IPN registered successfully',
                'ipn_id' => $result['ipn_id'] ?? null,
                'url' => $result['url'] ?? null
            ]);

        } catch (\Exception $e) {
            Log::error('Pesapal IPN registration failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'IPN registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Auth Token (Step 1)
     */
    public function getPesapalAuthToken(): JsonResponse
    {
        try {
            $pesapalService = new PesapalService();

            Log::info('Getting Pesapal auth token');

            $token = $pesapalService->getAccessToken();

            return response()->json([
                'status' => 'success',
                'message' => 'Token retrieved successfully',
                'token_preview' => substr($token, 0, 20) . '...'
            ]);

        } catch (\Exception $e) {
            Log::error('Pesapal auth token failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Auth token failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test Pesapal connection
     */
    public function testPesapalConnection(): JsonResponse
    {
        try {
            $pesapalService = new PesapalService();
            $result = $pesapalService->testConnection();

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Pesapal connection test failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Connection test failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Stellar payment status for a checkout request
     */
    public function getStellarPaymentStatus($checkoutRequestId): JsonResponse
    {
        try {
            Log::info('Checking Stellar payment status', [
                'checkout_request_id' => $checkoutRequestId
            ]);

            // Get Stellar payment data from cache
            $stellarPayment = Cache::get('stellar_payment_' . $checkoutRequestId);

            if (!$stellarPayment) {
                return response()->json([
                    'status' => 'not_found',
                    'message' => 'No Stellar payment record found',
                    'checkout_request_id' => $checkoutRequestId
                ]);
            }

            // Get M-Pesa payment data for comparison
            $mpesaPayment = Cache::get('mpesa_payment_' . $checkoutRequestId);

            $response = [
                'status' => $stellarPayment['status'],
                'checkout_request_id' => $checkoutRequestId,
                'stellar_data' => $stellarPayment,
                'mpesa_data' => $mpesaPayment,
                'timestamp' => now()->toISOString()
            ];

            // Verify transaction on Stellar network if we have a hash
            if (isset($stellarPayment['transaction_hash'])) {
                $verification = $this->stellarService->verifyTransaction($stellarPayment['transaction_hash']);
                $response['stellar_verification'] = $verification;
            }

            if (isset($stellarPayment['usdc_payment_hash'])) {
                $usdcVerification = $this->stellarService->verifyTransaction($stellarPayment['usdc_payment_hash']);
                $response['usdc_verification'] = $usdcVerification;
            }

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Exception while checking Stellar payment status', [
                'error' => $e->getMessage(),
                'checkout_request_id' => $checkoutRequestId,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to check Stellar payment status',
                'checkout_request_id' => $checkoutRequestId
            ], 500);
        }
    }


}

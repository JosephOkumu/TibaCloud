<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class PesapalService
{
    private $consumerKey;
    private $consumerSecret;
    private $baseUrl;
    private $ipnUrl;
    private $callbackUrl;
    private $cancellationUrl;
    private $currency;

    public function __construct()
    {
        $this->consumerKey = config('pesapal.consumer_key');
        $this->consumerSecret = config('pesapal.consumer_secret');
        $this->baseUrl = config('pesapal.base_url');
        $this->ipnUrl = config('pesapal.ipn_url');
        $this->callbackUrl = config('pesapal.callback_url');
        $this->cancellationUrl = config('pesapal.cancellation_url');
        $this->currency = config('pesapal.currency');
    }

    /**
     * Get Pesapal access token
     */
    public function getAccessToken()
    {
        try {
            Log::info('Generating fresh Pesapal access token', [
                'consumer_key' => substr($this->consumerKey, 0, 10) . '...',
                'base_url' => $this->baseUrl
            ]);

            $payload = json_encode([
                'consumer_key' => $this->consumerKey,
                'consumer_secret' => $this->consumerSecret
            ]);

            $url = $this->baseUrl . '/api/Auth/RequestToken';

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Laravel/9.0 (Tiba Cloud Medical Platform)');

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            Log::info('Pesapal auth response', [
                'status' => $httpCode,
                'response' => $response,
                'curl_error' => $curlError
            ]);

            if ($httpCode === 200 && !$curlError) {
                $data = json_decode($response, true);

                if (isset($data['token'])) {
                    Log::info('Pesapal access token generated successfully', [
                        'token_length' => strlen($data['token']),
                        'token_preview' => substr($data['token'], 0, 20) . '...'
                    ]);
                    return $data['token'];
                }

                throw new \Exception('Token not found in response. Response: ' . json_encode($data));
            }

            throw new \Exception('Failed to get access token. Status: ' . $httpCode . '. Body: ' . $response);
        } catch (\Exception $e) {
            Log::error('Pesapal authentication failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Submit payment order to Pesapal
     */
    public function submitOrder($orderData)
    {
        try {
            $token = $this->getAccessToken();

            $payload = [
                'id' => $orderData['merchant_reference'],
                'currency' => $this->currency,
                'amount' => floatval($orderData['amount']),
                'description' => $orderData['description'],
                'redirect_mode' => 'PARENT_WINDOW',
                'callback_url' => $orderData['callback_url'] ?? $this->callbackUrl,
                'notification_id' => $orderData['notification_id'] ?? null,
                'billing_address' => [
                    'email_address' => $orderData['email'] ?? '',
                    'phone_number' => $orderData['phone_number'] ?? '',
                    'country_code' => 'KE',
                    'first_name' => $orderData['first_name'] ?? '',
                    'middle_name' => '',
                    'last_name' => $orderData['last_name'] ?? '',
                    'line_1' => $orderData['address'] ?? '',
                    'line_2' => '',
                    'city' => $orderData['city'] ?? 'Nairobi',
                    'state' => $orderData['state'] ?? 'Nairobi',
                    'postal_code' => $orderData['postal_code'] ?? '00100',
                    'zip_code' => $orderData['zip_code'] ?? '00100'
                ]
            ];

            Log::info('Pesapal order payload created', [
                'merchant_reference' => $orderData['merchant_reference'] ?? 'unknown',
                'payload' => $payload
            ]);

            $payloadJson = json_encode($payload);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Failed to encode payload to JSON: ' . json_last_error_msg());
            }
            $url = $this->baseUrl . '/api/Transactions/SubmitOrderRequest';

            Log::info('Preparing Pesapal order submission', [
                'url' => $url,
                'token_preview' => substr($token, 0, 20) . '...',
                'payload_size' => strlen($payloadJson)
            ]);

            $headers = [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json',
                'Accept: application/json'
            ];

            Log::info('Pesapal HTTP request details', [
                'url' => $url,
                'method' => 'POST',
                'headers' => array_map(function($header) use ($token) {
                    if (strpos($header, 'Authorization:') === 0) {
                        return 'Authorization: Bearer ' . substr($token, 0, 20) . '...';
                    }
                    return $header;
                }, $headers),
                'payload_preview' => substr($payloadJson, 0, 200) . '...'
            ]);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payloadJson);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Laravel/9.0 (Tiba Cloud Medical Platform)');
            curl_setopt($ch, CURLOPT_VERBOSE, true);
            curl_setopt($ch, CURLOPT_STDERR, fopen('php://temp', 'rw+'));

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            $curlInfo = curl_getinfo($ch);
            curl_close($ch);

            Log::info('Pesapal order submission response', [
                'http_code' => $httpCode,
                'curl_error' => $curlError,
                'curl_info' => [
                    'total_time' => $curlInfo['total_time'] ?? null,
                    'namelookup_time' => $curlInfo['namelookup_time'] ?? null,
                    'connect_time' => $curlInfo['connect_time'] ?? null,
                    'pretransfer_time' => $curlInfo['pretransfer_time'] ?? null,
                    'starttransfer_time' => $curlInfo['starttransfer_time'] ?? null,
                    'redirect_time' => $curlInfo['redirect_time'] ?? null,
                    'content_type' => $curlInfo['content_type'] ?? null
                ],
                'response_preview' => substr($response, 0, 500),
                'response_full' => $response,
                'merchant_reference' => $orderData['merchant_reference'] ?? 'unknown'
            ]);

            if ($httpCode === 200 && !$curlError) {
                $data = json_decode($response, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Failed to decode response JSON: ' . json_last_error_msg());
                }

                Log::info('Pesapal order submitted successfully', [
                    'merchant_reference' => $orderData['merchant_reference'] ?? 'unknown',
                    'order_tracking_id' => $data['order_tracking_id'] ?? null,
                    'redirect_url' => $data['redirect_url'] ?? null
                ]);

                return $data;
            }

            $errorData = json_decode($response, true);
            Log::error('Pesapal order submission failed', [
                'status' => $httpCode,
                'response' => $errorData,
                'merchant_reference' => $orderData['merchant_reference'] ?? 'unknown'
            ]);

            $errorMessage = 'Failed to submit order';
            if (is_array($errorData) && isset($errorData['error'])) {
                if (is_array($errorData['error'])) {
                    $errorMessage .= ': ' . ($errorData['error']['message'] ?? json_encode($errorData['error']));
                } else {
                    $errorMessage .= ': ' . $errorData['error'];
                }
            } else {
                $errorMessage .= ': ' . $response;
            }
            throw new \Exception($errorMessage);
        } catch (\Exception $e) {
            Log::error('Exception while submitting Pesapal order', [
                'message' => $e->getMessage(),
                'merchant_reference' => $orderData['merchant_reference'] ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get transaction status from Pesapal
     */
    public function getTransactionStatus($orderTrackingId)
    {
        try {
            $token = $this->getAccessToken();

            $response = Http::timeout(60)
                ->withoutVerifying()
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])->get($this->baseUrl . '/api/Transactions/GetTransactionStatus', [
                    'orderTrackingId' => $orderTrackingId
                ]);

            if ($response->successful()) {
                $data = $response->json();

                Log::info('Pesapal transaction status retrieved', [
                    'order_tracking_id' => $orderTrackingId,
                    'status' => $data['payment_status_description'] ?? null,
                    'payment_method' => $data['payment_method'] ?? null
                ]);

                return $data;
            }

            $errorData = $response->json();
            Log::error('Failed to get Pesapal transaction status', [
                'status' => $response->status(),
                'response' => $errorData,
                'order_tracking_id' => $orderTrackingId
            ]);

            throw new \Exception('Failed to get transaction status: ' . ($errorData['error'] ?? $response->body()));
        } catch (\Exception $e) {
            Log::error('Exception while getting Pesapal transaction status', [
                'message' => $e->getMessage(),
                'order_tracking_id' => $orderTrackingId,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Register IPN URL with Pesapal
     */
    public function registerIPN()
    {
        try {
            $token = $this->getAccessToken();

            $payload = json_encode([
                'url' => $this->ipnUrl,
                'ipn_notification_type' => 'POST'
            ]);

            $url = $this->baseUrl . '/api/URLSetup/RegisterIPN';

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
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

                Log::info('Pesapal IPN registered successfully', [
                    'ipn_id' => $data['ipn_id'] ?? null,
                    'url' => $this->ipnUrl
                ]);

                return $data;
            }

            $errorData = json_decode($response, true);
            Log::error('Failed to register Pesapal IPN', [
                'status' => $httpCode,
                'response' => $errorData,
                'url' => $this->ipnUrl
            ]);

            throw new \Exception('Failed to register IPN: ' . ($errorData['error'] ?? $response));
        } catch (\Exception $e) {
            Log::error('Exception while registering Pesapal IPN', [
                'message' => $e->getMessage(),
                'url' => $this->ipnUrl,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get IPN ID by registering fresh IPN
     */
    public function getIPNId()
    {
        // Always register fresh IPN instead of using cache
        $ipnResponse = $this->registerIPN();
        return $ipnResponse['ipn_id'] ?? null;
    }

    /**
     * Generate merchant reference for lab appointment
     */
    public function generateMerchantReference($labProviderId, $patientId)
    {
        return 'LAB-' . $labProviderId . '-' . $patientId . '-' . time();
    }

    /**
     * Validate payment status
     */
    public function isPaymentSuccessful($paymentStatus)
    {
        return in_array(strtoupper($paymentStatus), ['COMPLETED', 'SUCCESS']);
    }

    /**
     * Validate payment failed
     */
    public function isPaymentFailed($paymentStatus)
    {
        return in_array(strtoupper($paymentStatus), ['FAILED', 'INVALID', 'CANCELLED']);
    }

    /**
     * Test Pesapal connection
     */
    public function testConnection()
    {
        try {
            $token = $this->getAccessToken();

            return [
                'status' => 'success',
                'message' => 'Pesapal connection successful',
                'token_preview' => substr($token, 0, 10) . '...',
                'base_url' => $this->baseUrl,
                'ipn_url' => $this->ipnUrl,
                'callback_url' => $this->callbackUrl
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Pesapal connection failed: ' . $e->getMessage(),
                'base_url' => $this->baseUrl
            ];
        }
    }
}

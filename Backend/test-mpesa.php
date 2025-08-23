<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

/**
 * M-Pesa Credentials Test Script
 *
 * This script tests your M-Pesa sandbox credentials to ensure they work
 * before integrating with the main application.
 */

// M-Pesa Sandbox Credentials
$consumerKey = 'tRcVSvHk2KPYGpTYGfOZC4aWlwmOaSqOXDMVQDWHACaEbX8f';
$consumerSecret = 'uBehSV388ZtcoUjLCoRioIAbAg9HQfZm0PgYubcyPQ0FDSGNicXMJ74fUOE1MuPP';
$businessShortCode = '174379';
$passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
$baseUrl = 'https://sandbox.safaricom.co.ke';

// Test phone number (replace with your actual test number)
$testPhoneNumber = '254708374149'; // Replace with your phone number

echo "=== M-Pesa Sandbox Test Script ===\n\n";

/**
 * Step 1: Test Access Token Generation
 */
echo "1. Testing Access Token Generation...\n";

try {
    $credentials = base64_encode($consumerKey . ':' . $consumerSecret);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/oauth/v1/generate?grant_type=client_credentials');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Basic ' . $credentials,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $tokenData = json_decode($response, true);
        $accessToken = $tokenData['access_token'];
        echo "   ✓ Access token generated successfully\n";
        echo "   Token: " . substr($accessToken, 0, 20) . "...\n";
        echo "   Expires in: " . $tokenData['expires_in'] . " seconds\n\n";
    } else {
        echo "   ✗ Failed to generate access token\n";
        echo "   HTTP Code: " . $httpCode . "\n";
        echo "   Response: " . $response . "\n\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "   ✗ Exception: " . $e->getMessage() . "\n\n";
    exit(1);
}

/**
 * Step 2: Test STK Push
 */
echo "2. Testing STK Push to phone: " . $testPhoneNumber . "\n";

try {
    $timestamp = date('YmdHis');
    $password = base64_encode($businessShortCode . $passkey . $timestamp);

    $stkPushData = [
        'BusinessShortCode' => $businessShortCode,
        'Password' => $password,
        'Timestamp' => $timestamp,
        'TransactionType' => 'CustomerPayBillOnline',
        'Amount' => 1, // Test with 1 KES
        'PartyA' => $testPhoneNumber,
        'PartyB' => $businessShortCode,
        'PhoneNumber' => $testPhoneNumber,
        'CallBackURL' => 'https://webhook.site/unique-id', // Replace with your callback URL
        'AccountReference' => 'TEST-' . time(),
        'TransactionDesc' => 'Test payment from Tiba Cloud'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/mpesa/stkpush/v1/processrequest');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($stkPushData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $stkResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "   HTTP Code: " . $httpCode . "\n";
    echo "   Response: " . $stkResponse . "\n";

    if ($httpCode === 200) {
        $stkData = json_decode($stkResponse, true);

        if (isset($stkData['ResponseCode']) && $stkData['ResponseCode'] === '0') {
            echo "   ✓ STK Push initiated successfully!\n";
            echo "   Check your phone for the M-Pesa prompt\n";
            echo "   CheckoutRequestID: " . $stkData['CheckoutRequestID'] . "\n";

            $checkoutRequestId = $stkData['CheckoutRequestID'];

            // Wait a bit before checking status
            echo "\n   Waiting 10 seconds before checking payment status...\n";
            sleep(10);

            /**
             * Step 3: Test Status Query
             */
            echo "\n3. Testing Payment Status Query...\n";

            $statusTimestamp = date('YmdHis');
            $statusPassword = base64_encode($businessShortCode . $passkey . $statusTimestamp);

            $statusData = [
                'BusinessShortCode' => $businessShortCode,
                'Password' => $statusPassword,
                'Timestamp' => $statusTimestamp,
                'CheckoutRequestID' => $checkoutRequestId
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $baseUrl . '/mpesa/stkpushquery/v1/query');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($statusData));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $statusResponse = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            echo "   Status Query HTTP Code: " . $httpCode . "\n";
            echo "   Status Response: " . $statusResponse . "\n";

            if ($httpCode === 200) {
                $statusResult = json_decode($statusResponse, true);

                if (isset($statusResult['ResultCode'])) {
                    switch ($statusResult['ResultCode']) {
                        case '0':
                            echo "   ✓ Payment completed successfully!\n";
                            break;
                        case '1037':
                            echo "   ⏳ Payment is still in progress\n";
                            echo "   You can check again later or complete the payment on your phone\n";
                            break;
                        case '1032':
                            echo "   ✗ Payment was cancelled by user\n";
                            break;
                        default:
                            echo "   ✗ Payment failed with code: " . $statusResult['ResultCode'] . "\n";
                            echo "   Description: " . ($statusResult['ResultDesc'] ?? 'Unknown error') . "\n";
                    }
                }
            } else {
                echo "   ✗ Failed to query payment status\n";
            }

        } else {
            echo "   ✗ STK Push failed\n";
            echo "   Error: " . ($stkData['errorMessage'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "   ✗ STK Push request failed\n";
    }

} catch (Exception $e) {
    echo "   ✗ Exception during STK Push: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
echo "\nNotes:\n";
echo "- Make sure your test phone number is registered with Safaricom\n";
echo "- You should receive an STK push on your phone if the test is successful\n";
echo "- Complete the payment with your M-Pesa PIN to test the full flow\n";
echo "- Check the callback URL for payment confirmation (if configured)\n";
echo "- Use the CheckoutRequestID to track payment status\n";

?>

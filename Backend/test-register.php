<?php

// Simple test for just the registration API

// Function to make API requests
function makeRequest($url, $method = 'GET', $data = [], $headers = [])
{
    $curl = curl_init();
    
    $defaultHeaders = [
        'Accept: application/json',
        'Content-Type: application/json',
    ];
    
    $headers = array_merge($defaultHeaders, $headers);
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_VERBOSE => true, // Enable verbose output
    ]);
    
    if (!empty($data) && ($method === 'POST' || $method === 'PUT')) {
        $jsonData = json_encode($data);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $jsonData);
        echo "Sending data: " . $jsonData . "\n\n";
    }
    
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    
    curl_close($curl);
    
    if ($error) {
        return [
            'success' => false,
            'error' => $error,
            'code' => $httpCode
        ];
    }
    
    return [
        'success' => true,
        'data' => json_decode($response, true),
        'raw_response' => $response,
        'code' => $httpCode
    ];
}

// Base URL for API
$baseUrl = 'http://localhost:8000/api';

// Test Registration
echo "=== Testing Registration API ===\n";
$registrationData = [
    'name' => 'Test User',
    'email' => 'testuser' . rand(1000, 9999) . '@example.com', // Random email to avoid duplicates
    'password' => 'password123',
    'password_confirmation' => 'password123',
    'phone_number' => '+254700123456',
    'user_type' => 'patient',
];

echo "Registering user with email: {$registrationData['email']}\n";
$registerResult = makeRequest($baseUrl . '/register', 'POST', $registrationData);

echo "Registration Response Code: {$registerResult['code']}\n";
echo "Raw Response: \n" . $registerResult['raw_response'] . "\n\n";

if (isset($registerResult['data'])) {
    echo "Parsed Response Data: \n";
    print_r($registerResult['data']);
}

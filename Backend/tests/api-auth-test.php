<?php

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
    ]);
    
    if (!empty($data) && ($method === 'POST' || $method === 'PUT')) {
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
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
    
    // Save the raw response text too
    return [
        'success' => true,
        'data' => json_decode($response, true),
        'raw_response' => $response,
        'code' => $httpCode
    ];
}

// Base URL for API
$baseUrl = 'http://localhost:8000/api';

// 1. Test Registration
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
if ($registerResult['success']) {
    if (isset($registerResult['data']['access_token'])) {
        echo "Registration successful! User registered with token.\n";
        $accessToken = $registerResult['data']['access_token'];
        echo "Access Token: " . substr($accessToken, 0, 20) . "...\n";
        
        // Store the email for login test
        $testEmail = $registrationData['email'];
        $testPassword = $registrationData['password'];
    } else {
        echo "Registration API returned success but no token:\n";
        echo "Raw response: " . substr($registerResult['raw_response'], 0, 500) . "\n";
        if (isset($registerResult['data']['message'])) {
            echo "Error message: " . $registerResult['data']['message'] . "\n";
        }
        if (isset($registerResult['data']['errors'])) {
            echo "Validation errors:\n";
            print_r($registerResult['data']['errors']);
        }
    }
} else {
    echo "Registration failed:\n";
    print_r($registerResult);
}

echo "\n";

// 2. Test Login (using the email we just registered, or fallback to a test user)
echo "=== Testing Login API ===\n";
$loginData = [
    'email' => $testEmail ?? 'testuser@example.com',
    'password' => $testPassword ?? 'password123',
];

echo "Logging in with email: {$loginData['email']}\n";
$loginResult = makeRequest($baseUrl . '/login', 'POST', $loginData);

echo "Login Response Code: {$loginResult['code']}\n";
if ($loginResult['success']) {
    if (isset($loginResult['data']['access_token'])) {
        echo "Login successful!\n";
        $accessToken = $loginResult['data']['access_token'];
        echo "Access Token: " . substr($accessToken, 0, 20) . "...\n";
        
        // 3. Test User Profile retrieval (using the token we got from login)
        echo "\n=== Testing User Profile API ===\n";
        $userResult = makeRequest($baseUrl . '/user', 'GET', [], ['Authorization: Bearer ' . $accessToken]);
        
        echo "User API Response Code: {$userResult['code']}\n";
        if ($userResult['success'] && isset($userResult['data']['user'])) {
            echo "User profile retrieved successfully:\n";
            echo "Name: " . $userResult['data']['user']['name'] . "\n";
            echo "Email: " . $userResult['data']['user']['email'] . "\n";
            echo "User Type: " . $userResult['data']['user']['user_type'] . "\n";
        } else {
            echo "Failed to retrieve user profile:\n";
            print_r($userResult);
        }
        
        // 4. Test Logout
        echo "\n=== Testing Logout API ===\n";
        $logoutResult = makeRequest($baseUrl . '/logout', 'POST', [], ['Authorization: Bearer ' . $accessToken]);
        
        echo "Logout Response Code: {$logoutResult['code']}\n";
        if ($logoutResult['success']) {
            echo "Logout successful:\n";
            if (isset($logoutResult['data']['message'])) {
                echo $logoutResult['data']['message'] . "\n";
            }
        } else {
            echo "Logout failed:\n";
            print_r($logoutResult);
        }
    } else {
        echo "Login API returned success but no token:\n";
        print_r($loginResult['data']);
    }
} else {
    echo "Login failed:\n";
    print_r($loginResult);
}

echo "\n=== API Testing Complete ===\n";

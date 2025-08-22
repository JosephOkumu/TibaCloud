<?php
// Simple test script to check if the Laravel application is responding

echo "Starting HTTP request test...\n";

// Test basic HTTP request to the root URL
$rootUrl = 'http://127.0.0.1:8000/';
echo "Testing root URL: $rootUrl\n";

$ch = curl_init($rootUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Root URL Status Code: $statusCode\n\n";

// Now test the API URL structure
$apiUrl = 'http://127.0.0.1:8000/api';
echo "Testing API base URL: $apiUrl\n";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "API base URL Status Code: $statusCode\n\n";

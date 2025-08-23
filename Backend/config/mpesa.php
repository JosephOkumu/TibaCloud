<?php

return [

    /*
    |--------------------------------------------------------------------------
    | M-Pesa Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for M-Pesa Daraja API integration.
    | You can switch between sandbox and production environments.
    |
    */

    'environment' => env('MPESA_ENVIRONMENT', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | M-Pesa API Credentials
    |--------------------------------------------------------------------------
    |
    | Your M-Pesa Daraja API credentials for authentication.
    | Keep your consumer secret secure and never commit it to version control.
    |
    */

    'consumer_key' => env('MPESA_CONSUMER_KEY', 'tDcVSvHk2KPYGpTYGfOZC4aWlwmOaSqOXDMVQDWHACAEbX8f'),
    'consumer_secret' => env('MPESA_CONSUMER_SECRET', 'uBehSV388ZtcoUjLCoRioIAbAg9HQfZm0PgYubcyPQ0FDSGNicXMJ74fUOE1MuPP'),

    /*
    |--------------------------------------------------------------------------
    | M-Pesa Business Configuration
    |--------------------------------------------------------------------------
    |
    | Your business short code and passkey for M-Pesa transactions.
    |
    */

    'business_short_code' => env('MPESA_BUSINESS_SHORT_CODE', '174379'),
    'passkey' => env('MPESA_PASSKEY', 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'),

    /*
    |--------------------------------------------------------------------------
    | M-Pesa API URLs
    |--------------------------------------------------------------------------
    |
    | Base URLs for M-Pesa Daraja API endpoints.
    |
    */

    'base_urls' => [
        'sandbox' => 'https://sandbox.safaricom.co.ke',
        'production' => 'https://api.safaricom.co.ke',
    ],

    /*
    |--------------------------------------------------------------------------
    | Callback URLs
    |--------------------------------------------------------------------------
    |
    | URLs where M-Pesa will send transaction callbacks.
    |
    */

    'callback_url' => env('MPESA_CALLBACK_URL', env('APP_URL', 'http://localhost:8000') . '/api/payments/mpesa/callback'),
    'result_url' => env('MPESA_RESULT_URL', env('APP_URL', 'http://localhost:8000') . '/api/payments/mpesa/result'),
    'timeout_url' => env('MPESA_TIMEOUT_URL', env('APP_URL', 'http://localhost:8000') . '/api/payments/mpesa/timeout'),

    /*
    |--------------------------------------------------------------------------
    | Transaction Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for M-Pesa transactions.
    |
    */

    'transaction_type' => env('MPESA_TRANSACTION_TYPE', 'CustomerPayBillOnline'),
    'timeout_seconds' => env('MPESA_TIMEOUT', 60),

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | Cache configuration for M-Pesa access tokens and payment data.
    |
    */

    'cache' => [
        'access_token_minutes' => env('MPESA_TOKEN_CACHE_MINUTES', 50),
        'payment_data_days' => env('MPESA_PAYMENT_CACHE_DAYS', 7),
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging
    |--------------------------------------------------------------------------
    |
    | Enable or disable detailed logging for M-Pesa operations.
    |
    */

    'enable_logging' => env('MPESA_LOGGING', true),
    'log_level' => env('MPESA_LOG_LEVEL', 'info'),

    /*
    |--------------------------------------------------------------------------
    | Validation Rules
    |--------------------------------------------------------------------------
    |
    | Validation settings for M-Pesa transactions.
    |
    */

    'validation' => [
        'min_amount' => env('MPESA_MIN_AMOUNT', 1),
        'max_amount' => env('MPESA_MAX_AMOUNT', 70000),
        'phone_regex' => env('MPESA_PHONE_REGEX', '/^254[0-9]{9}$/'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Development Settings
    |--------------------------------------------------------------------------
    |
    | Settings specific to development and testing.
    |
    */

    'sandbox' => [
        'test_phone' => env('MPESA_TEST_PHONE', '254708374149'),
        'test_msisdn' => env('MPESA_TEST_MSISDN', '254708374149'),
    ],

];

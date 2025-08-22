<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Pesapal Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for Pesapal payment gateway
    | using API 3.0 specifications.
    |
    */

    'consumer_key' => env('PESAPAL_CONSUMER_KEY'),
    'consumer_secret' => env('PESAPAL_CONSUMER_SECRET'),
    'base_url' => env('PESAPAL_BASE_URL', 'https://pay.pesapal.com/v3'),
    'ipn_url' => env('PESAPAL_IPN_URL', env('APP_URL') . '/api/payments/pesapal/ipn'),
    'callback_url' => env('PESAPAL_CALLBACK_URL', env('APP_URL') . '/payment-success'),
    'cancellation_url' => env('PESAPAL_CANCELLATION_URL', env('APP_URL') . '/payment-cancelled'),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | The currency code for payments (ISO 4217)
    |
    */
    'currency' => env('PESAPAL_CURRENCY', 'KES'),

    /*
    |--------------------------------------------------------------------------
    | Environment
    |--------------------------------------------------------------------------
    |
    | Set to 'sandbox' for testing or 'live' for production
    |
    */
    'environment' => env('PESAPAL_ENVIRONMENT', 'live'),

    /*
    |--------------------------------------------------------------------------
    | HTTP Client Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for HTTP client timeout and SSL settings
    |
    */
    'timeout' => env('PESAPAL_TIMEOUT', 60),
    'verify_ssl' => env('PESAPAL_VERIFY_SSL', false),
];

<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stellar Network Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for Stellar/Soroban integration.
    | You can switch between testnet and mainnet environments.
    |
    */

    'network' => env('STELLAR_NETWORK', 'testnet'),

    /*
    |--------------------------------------------------------------------------
    | Stellar Account Credentials
    |--------------------------------------------------------------------------
    |
    | Your Stellar account credentials for sending transactions.
    | Keep your secret key secure and never commit it to version control.
    |
    */

    'public_key' => env('STELLAR_PUBLIC_KEY'),
    'secret_key' => env('STELLAR_SECRET_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Horizon API URLs
    |--------------------------------------------------------------------------
    |
    | Horizon is Stellar's REST API for interacting with the network.
    |
    */

    'horizon' => [
        'testnet' => 'https://horizon-testnet.stellar.org',
        'mainnet' => 'https://horizon.stellar.org',
    ],

    /*
    |--------------------------------------------------------------------------
    | Soroban RPC URLs
    |--------------------------------------------------------------------------
    |
    | Soroban RPC endpoints for smart contract interactions.
    |
    */

    'soroban_rpc' => [
        'testnet' => 'https://soroban-testnet.stellar.org',
        'mainnet' => 'https://soroban-mainnet.stellar.org',
    ],

    /*
    |--------------------------------------------------------------------------
    | Asset Issuers
    |--------------------------------------------------------------------------
    |
    | Public keys of asset issuers on the Stellar network.
    |
    */

    'USDC_issuer' => env('STELLAR_USDC_ISSUER', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'),
    'USDT_issuer' => env('STELLAR_USDT_ISSUER', 'GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V'),

    /*
    |--------------------------------------------------------------------------
    | Soroban Smart Contract Addresses
    |--------------------------------------------------------------------------
    |
    | Contract addresses for your deployed Soroban smart contracts.
    |
    */

    'contract_address' => env('STELLAR_CONTRACT_ADDRESS'),
    'payment_contract' => env('STELLAR_PAYMENT_CONTRACT'),

    /*
    |--------------------------------------------------------------------------
    | Transaction Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for Stellar transactions.
    |
    */

    'base_fee' => env('STELLAR_BASE_FEE', 100),
    'timeout' => env('STELLAR_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | Currency Conversion
    |--------------------------------------------------------------------------
    |
    | Default exchange rates and conversion settings.
    |
    */

    'default_kes_to_usd_rate' => env('STELLAR_DEFAULT_KES_USD_RATE', 0.0077), // 1 KES = 0.0077 USD (approx)
    'exchange_rate_api' => env('STELLAR_EXCHANGE_API', 'https://api.exchangerate-api.com/v4/latest/KES'),

    /*
    |--------------------------------------------------------------------------
    | Logging
    |--------------------------------------------------------------------------
    |
    | Enable or disable detailed logging for Stellar operations.
    |
    */

    'enable_logging' => env('STELLAR_LOGGING', true),
    'log_level' => env('STELLAR_LOG_LEVEL', 'info'),

];

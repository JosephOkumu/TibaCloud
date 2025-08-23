# Tiba Cloud - Stellar/Soroban Integration Guide

This guide walks you through integrating Stellar/Soroban blockchain payments with your existing M-Pesa system.

## Overview

The integration works by:
1. User makes payment via M-Pesa (existing flow)
2. M-Pesa callback confirms payment success
3. Backend automatically creates corresponding Soroban transaction
4. Payment is recorded on Stellar blockchain for transparency and immutability

## Prerequisites

- PHP 8.2+
- Laravel 12.0+
- Composer
- Node.js and npm (for frontend)
- Rust and Cargo (for Soroban contracts)
- Stellar account with testnet funding

## Step 1: Environment Setup

### 1.1 Install Required Dependencies

```bash
# Backend dependencies
cd Backend
composer require guzzlehttp/guzzle phpseclib/phpseclib

# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Soroban CLI
cargo install --locked soroban-cli

# Add WebAssembly target
rustup target add wasm32-unknown-unknown
```

### 1.2 Configure Environment Variables

Add these variables to your `.env` file:

```bash
# Stellar/Soroban Configuration
STELLAR_NETWORK=testnet
STELLAR_PUBLIC_KEY=GBYQZJFO6ECYUDG4UX2FWSZ47UGDCYZ3INDXLX4GQXHJ3A6WKSPT7CYS
STELLAR_SECRET_KEY=your_secret_key_here

# Contract addresses (will be filled after deployment)
STELLAR_CONTRACT_ADDRESS=
STELLAR_PAYMENT_CONTRACT=

# Asset issuers (testnet values)
STELLAR_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3A6WKSPT7CYS
STELLAR_USDT_ISSUER=GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V

# Transaction settings
STELLAR_BASE_FEE=100
STELLAR_TIMEOUT=30

# Logging
STELLAR_LOGGING=true
STELLAR_LOG_LEVEL=info

# Tiba Cloud specific
TIBA_STELLAR_DESTINATION_WALLET=GBYQZJFO6ECYUDG4UX2FWSZ47UGDCYZ3INDXLX4GQXHJ3A6WKSPT7CYS
TIBA_PAYMENT_MEMO_PREFIX="TibaCloud-Payment-"
```

**Important**: Never commit your actual secret key to version control!

## Step 2: Deploy Soroban Smart Contract

### 2.1 Fund Your Testnet Account

Visit [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) and fund your account with testnet XLM.

### 2.2 Deploy the Contract

```bash
cd Backend
export STELLAR_SECRET_KEY="your_secret_key_here"
export STELLAR_PUBLIC_KEY="GBYQZJFO6ECYUDG4UX2FWSZ47UGDCYZ3INDXLX4GQXHJ3A6WKSPT7CYS"

# Deploy the contract
./scripts/deploy-soroban.sh deploy
```

This script will:
- Build the Rust smart contract
- Deploy it to Stellar testnet
- Initialize the contract
- Save the contract address to `contract_address.env`

### 2.3 Update Environment

After successful deployment, copy the contract address from `contract_address.env` to your `.env` file.

## Step 3: Test the Integration

### 3.1 Test M-Pesa to Stellar Flow

1. **Initiate M-Pesa Payment**:
```bash
curl -X POST http://your-domain/api/payments/mpesa/stk-push \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "accountReference": "TEST123",
    "transactionDesc": "Test payment"
  }'
```

2. **Check Payment Status**:
```bash
curl -X GET http://your-domain/api/payments/mpesa/status/ws_CO_123456789 \
  -H "Authorization: Bearer your_token"
```

3. **Check Stellar Integration**:
```bash
curl -X GET http://your-domain/api/payments/stellar/status/ws_CO_123456789 \
  -H "Authorization: Bearer your_token"
```

### 3.2 Verify on Stellar Network

You can verify transactions on:
- **Testnet**: https://stellar.expert/explorer/testnet
- **Mainnet**: https://stellar.expert/explorer/public

## Step 4: Production Deployment

### 4.1 Switch to Mainnet

Update your `.env`:
```bash
STELLAR_NETWORK=mainnet
# Update issuer addresses for mainnet USDC/USDT
STELLAR_USDC_ISSUER=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
STELLAR_USDT_ISSUER=GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V
```

### 4.2 Deploy to Mainnet

```bash
export STELLAR_NETWORK=mainnet
./scripts/deploy-soroban.sh deploy
```

**Warning**: Mainnet transactions cost real XLM. Ensure your account is funded.

## API Endpoints

### M-Pesa Endpoints (Existing)
- `POST /api/payments/mpesa/stk-push` - Initiate payment
- `GET /api/payments/mpesa/status/{checkoutRequestId}` - Check M-Pesa status
- `POST /api/payments/mpesa/callback` - M-Pesa callback (webhook)

### Stellar Endpoints (New)
- `GET /api/payments/stellar/status/{checkoutRequestId}` - Check Stellar integration status

## Data Flow

```
1. User initiates M-Pesa payment
   ↓
2. M-Pesa STK push sent to user's phone
   ↓
3. User completes payment on phone
   ↓
4. Safaricom sends callback to your backend
   ↓
5. Backend processes M-Pesa callback
   ↓
6. If payment successful:
   a. Convert KES to USDC equivalent
   b. Record payment on Soroban smart contract
   c. Optionally send USDC to destination wallet
   ↓
7. Payment recorded on Stellar blockchain
```

## Smart Contract Functions

The deployed contract provides these functions:

- `record_payment()` - Records M-Pesa payment details
- `get_payment()` - Retrieves payment by checkout request ID
- `update_payment_status()` - Updates payment status
- `get_payment_count()` - Gets total payments recorded
- `verify_payment_exists()` - Checks if payment exists

## Monitoring and Logging

### Log Files
- Laravel logs: `storage/logs/laravel.log`
- Stellar operations are logged with prefix `[STELLAR]`

### Key Metrics to Monitor
- M-Pesa callback success rate
- Stellar transaction success rate
- Currency conversion accuracy
- Smart contract invocation success

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Ensure testnet account is funded
   - Check network connectivity
   - Verify Soroban CLI installation

2. **M-Pesa callbacks not triggering Stellar**
   - Check Laravel logs for exceptions
   - Verify environment variables
   - Ensure StellarService is properly injected

3. **Currency conversion issues**
   - Check exchange rate API connectivity
   - Verify fallback rate configuration
   - Monitor conversion logs

4. **Smart contract invocation fails**
   - Check contract address configuration
   - Verify account has sufficient XLM for fees
   - Review Soroban network status

### Debug Commands

```bash
# Test Stellar service
php artisan tinker
>>> $stellar = app(\App\Services\StellarService::class);
>>> $result = $stellar->convertKesToUsdc(1000);
>>> var_dump($result);

# Check contract deployment
soroban contract invoke --id YOUR_CONTRACT_ADDRESS --network testnet -- get_contract_info

# View recent transactions
curl "https://horizon-testnet.stellar.org/accounts/YOUR_PUBLIC_KEY/transactions?order=desc&limit=10"
```

## Security Considerations

1. **Never commit secret keys** to version control
2. **Use environment variables** for all sensitive data
3. **Validate all inputs** before sending to blockchain
4. **Monitor transaction costs** on mainnet
5. **Set up proper logging** and alerting
6. **Test thoroughly** on testnet before mainnet deployment

## Support

For issues related to:
- **M-Pesa Integration**: Check Safaricom Daraja API documentation
- **Stellar/Soroban**: Visit [Stellar Developers](https://developers.stellar.org/)
- **Laravel Issues**: Check Laravel documentation

## Next Steps

1. **Deploy to staging** environment first
2. **Test with small amounts** initially
3. **Set up monitoring** and alerts
4. **Create backup procedures** for contract data
5. **Plan for mainnet migration** when ready

---

**Note**: This integration maintains your existing M-Pesa flow while adding blockchain transparency and immutability. Users continue to pay via M-Pesa as before, but payments are now also recorded on the Stellar blockchain for enhanced trust and auditability.
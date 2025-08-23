# Pesapal Payment Integration Documentation

This document provides comprehensive documentation for the Pesapal payment integration in the Tiba Cloud lab booking system.

## Overview

The Pesapal integration allows patients to pay for lab tests using credit/debit cards through Pesapal's secure payment gateway. The system uses Pesapal API v3 with live environment integration.

## Architecture

### Backend Components

1. **PesapalService** (`app/Services/PesapalService.php`)
   - Handles all Pesapal API interactions
   - Manages token generation and IPN registration
   - Processes payment submissions and status checks

2. **PaymentController** (`app/Http/Controllers/PaymentController.php`)
   - Provides REST API endpoints for frontend
   - Handles payment initiation and status retrieval
   - Manages IPN callback processing

3. **Configuration** (`config/pesapal.php`)
   - Centralizes Pesapal settings
   - Environment-specific configurations

### Frontend Components

1. **PesapalService** (`Frontend/src/services/pesapalService.ts`)
   - TypeScript service for payment operations
   - Handles API communication with backend
   - Provides payment validation and formatting utilities

## Current Implementation Flow

### 1. Payment Initiation Flow

```
Frontend → Backend → Pesapal → Backend → Frontend → Pesapal Payment Page
```

**Detailed Steps:**

1. **User Action:** Patient selects "Pay with Credit Card" option
2. **Frontend Validation:** Validates payment data (amount, email, phone, etc.)
3. **API Call:** POST to `/api/payments/pesapal/initiate`
4. **Backend Processing:**
   - Generates fresh Pesapal access token (no caching)
   - Registers fresh IPN URL for payment notifications
   - Creates merchant reference: `LAB-{provider_id}-{patient_id}-{timestamp}`
   - Builds comprehensive order payload
   - Submits order to Pesapal API
5. **Pesapal Response:** Returns order tracking ID and redirect URL
6. **Frontend Redirect:** Redirects user to Pesapal payment page
7. **Payment Processing:** User completes payment on Pesapal

### 2. Payment Callback Flow

```
Pesapal → Backend IPN → Status Update → Frontend Notification
```

**Detailed Steps:**

1. **IPN Notification:** Pesapal sends POST to `/api/payments/pesapal/ipn`
2. **Status Retrieval:** Backend fetches payment status using order tracking ID
3. **Data Storage:** Updates payment status in cache/database
4. **Response:** Returns success response to Pesapal

### 3. Payment Status Check Flow

```
Frontend → Backend → Pesapal → Backend → Frontend
```

**Detailed Steps:**

1. **Status Request:** GET `/api/payments/pesapal/status/{merchantReference}`
2. **Cache Check:** Looks for cached payment data
3. **Fresh Status:** Fetches current status from Pesapal if available
4. **Response:** Returns current payment status to frontend

## Environment Configuration

### Required Environment Variables

```env
# Pesapal Live Environment Credentials
PESAPAL_CONSUMER_KEY=KEiTybrOppadueemQJMnz4nEs1f8NmXB
PESAPAL_CONSUMER_SECRET=ke9OHtleqdZex5XiIDQuXnNknrw=

# Pesapal API Configuration
PESAPAL_BASE_URL=https://pay.pesapal.com/v3
PESAPAL_ENVIRONMENT=live
PESAPAL_CURRENCY=KES

# Webhook and Callback URLs
PESAPAL_IPN_URL=https://b674c9bd5633.ngrok-free.app/api/payments/pesapal/ipn
PESAPAL_CALLBACK_URL=http://localhost:8080/payment-success
PESAPAL_CANCELLATION_URL=http://localhost:8080/payment-cancelled

# Optional Settings
PESAPAL_TIMEOUT=60
PESAPAL_VERIFY_SSL=false
```

### Production URL Configuration

For production deployment:

```env
PESAPAL_IPN_URL=https://yourdomain.com/api/payments/pesapal/ipn
PESAPAL_CALLBACK_URL=https://yourdomain.com/payment-success
PESAPAL_CANCELLATION_URL=https://yourdomain.com/payment-cancelled
```

## API Endpoints

### Authentication Required Endpoints

#### Initiate Payment
```http
POST /api/payments/pesapal/initiate
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "amount": 150.00,
  "email": "patient@example.com",
  "phone_number": "254722549387",
  "first_name": "John",
  "last_name": "Doe",
  "description": "Lab Test Payment",
  "lab_provider_id": 1,
  "patient_id": 7,
  "address": "123 Main St",
  "city": "Nairobi",
  "state": "Nairobi",
  "postal_code": "00100"
}
```

**Response:**
```json
{
  "status": "success",
  "merchant_reference": "LAB-1-7-1755640024",
  "order_tracking_id": "0bcfb9a5-0e4b-4b3d-a65f-db6e3b88d661",
  "redirect_url": "https://pay.pesapal.com/iframe/PesapalIframe3/Index?OrderTrackingId=..."
}
```

#### Check Payment Status
```http
GET /api/payments/pesapal/status/{merchantReference}
Authorization: Bearer {user_token}
```

**Response:**
```json
{
  "status": "success",
  "payment_status": "COMPLETED",
  "merchant_reference": "LAB-1-7-1755640024",
  "order_tracking_id": "0bcfb9a5-0e4b-4b3d-a65f-db6e3b88d661",
  "amount": 150,
  "payment_method": "Card",
  "confirmation_code": "ABC123XYZ"
}
```

### Public Endpoints

#### IPN Callback Handler
```http
POST /api/payments/pesapal/ipn

{
  "OrderTrackingId": "0bcfb9a5-0e4b-4b3d-a65f-db6e3b88d661",
  "OrderMerchantReference": "LAB-1-7-1755640024"
}
```

#### Test Connection
```http
GET /api/payments/pesapal/test
```

#### Get Auth Token (for testing)
```http
GET /api/payments/pesapal/auth-token
```

#### Register IPN (for testing)
```http
POST /api/payments/pesapal/register-ipn
```

## Data Structures

### Payment Request Payload (to Pesapal)

```json
{
  "id": "LAB-1-7-1755640024",
  "currency": "KES",
  "amount": 150.0,
  "description": "Lab Test Payment",
  "redirect_mode": "PARENT_WINDOW",
  "callback_url": "http://localhost:8080/payment-success",
  "notification_id": "9a08491f-6f9d-48c2-b12b-db6ed3f8e007",
  "billing_address": {
    "email_address": "patient@example.com",
    "phone_number": "254722549387",
    "country_code": "KE",
    "first_name": "John",
    "middle_name": "",
    "last_name": "Doe",
    "line_1": "123 Main St",
    "line_2": "",
    "city": "Nairobi",
    "state": "Nairobi",
    "postal_code": "00100",
    "zip_code": "00100"
  }
}
```

### Payment Status Values

- **PENDING**: Payment initiated but not completed
- **COMPLETED**: Payment successful
- **FAILED**: Payment failed
- **CANCELLED**: Payment cancelled by user
- **INVALID**: Payment data invalid
- **PROCESSING**: Payment being processed

## Key Implementation Details

### No Token Caching Strategy

The current implementation generates fresh tokens for each request instead of caching them. This approach:

**Advantages:**
- ✅ Eliminates token expiry issues
- ✅ Prevents "works once, fails second time" problems
- ✅ More reliable for production use
- ✅ Handles concurrent requests better

**Trade-offs:**
- ⚠️ Slightly slower (extra API call for each payment)
- ⚠️ More API calls to Pesapal

### Fresh IPN Registration

Each payment request registers a fresh IPN URL:

**Benefits:**
- ✅ Ensures IPN is always active
- ✅ Prevents stale IPN ID issues
- ✅ Better reliability for payment notifications

### Comprehensive Error Handling

The system includes robust error handling for:
- Array to string conversion errors
- Invalid access tokens
- Missing IPN IDs
- Network timeouts
- Invalid payment data

## Testing Guide

### 1. Test Connection

```bash
curl -X GET http://localhost:8000/api/payments/pesapal/test
```

Expected response:
```json
{
  "status": "success",
  "message": "Pesapal connection successful",
  "token_preview": "eyJhbGciOi...",
  "base_url": "https://pay.pesapal.com/v3",
  "ipn_url": "https://b674c9bd5633.ngrok-free.app/api/payments/pesapal/ipn",
  "callback_url": "http://localhost:8080/payment-success"
}
```

### 2. Test Payment Initiation

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 100,
    "email": "test@example.com",
    "phone_number": "254722549387",
    "first_name": "Test",
    "last_name": "User",
    "description": "Test Payment",
    "lab_provider_id": 1,
    "patient_id": 7
  }' \
  "http://localhost:8000/api/payments/pesapal/initiate"
```

### 3. Test Multiple Consecutive Payments

Run the above payment test multiple times in succession to ensure no token caching issues.

### 4. Monitor Logs

```bash
tail -f Backend/storage/logs/laravel.log | grep -i pesapal
```

Look for:
- Fresh token generation
- IPN registration
- Order submission
- Payment status updates

## Security Considerations

### 1. Environment Variables
- Never commit credentials to version control
- Use different credentials for development/production
- Rotate credentials periodically

### 2. IPN Validation
- Verify IPN requests originate from Pesapal
- Validate order tracking IDs and merchant references
- Implement duplicate notification handling

### 3. HTTPS Requirements
- All production URLs must use HTTPS
- Especially important for IPN and callback URLs
- SSL certificate must be valid

### 4. Rate Limiting
- Implement rate limiting on payment endpoints
- Prevent abuse and DoS attacks
- Monitor for unusual payment patterns

### 5. Data Protection
- Encrypt sensitive payment data
- Comply with PCI DSS requirements
- Implement proper audit logging

## Troubleshooting

### Common Issues

#### 1. "Array to string conversion" Error
**Cause:** Error response handling issue
**Solution:** Already fixed in current implementation

#### 2. "Invalid Access Token" Error
**Cause:** Token caching or expiry issues
**Solution:** Fresh token generation implemented (no caching)

#### 3. "Invalid IPN URL ID" Error
**Cause:** Stale or missing IPN registration
**Solution:** Fresh IPN registration for each payment

#### 4. Payment Works Once, Fails Second Time
**Cause:** Token caching issues
**Solution:** Removed token caching, fresh tokens for each request

### Debug Steps

1. **Check Environment Variables:**
   ```bash
   php artisan config:show pesapal
   ```

2. **Clear Cache:**
   ```bash
   php artisan cache:clear
   ```

3. **Test Connection:**
   ```bash
   curl http://localhost:8000/api/payments/pesapal/test
   ```

4. **Monitor Logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

5. **Verify IPN URL Accessibility:**
   - Ensure ngrok tunnel is active
   - Test IPN URL responds to POST requests
   - Check firewall settings

### Error Codes and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 - Invalid Access Token | Token expired/invalid | Clear cache, regenerate token |
| 400 - Invalid IPN URL ID | IPN not registered | Register fresh IPN |
| 422 - Validation Error | Invalid request data | Check payload format |
| 500 - Server Error | Backend processing error | Check logs for details |

## Monitoring and Logging

### Important Log Messages

- `Generating fresh Pesapal access token` - Token creation
- `Pesapal IPN registered successfully` - IPN setup
- `Pesapal order submitted successfully` - Payment initiated
- `Pesapal payment status updated` - Status change

### Performance Metrics

Monitor these metrics:
- Payment initiation success rate
- Average payment processing time
- IPN callback response time
- Token generation frequency

## Production Deployment Checklist

- [ ] Update environment variables with production URLs
- [ ] Configure proper HTTPS certificates
- [ ] Set up monitoring and alerting
- [ ] Implement rate limiting
- [ ] Configure backup IPN URLs
- [ ] Test payment flow end-to-end
- [ ] Set up log aggregation
- [ ] Verify security settings
- [ ] Test failure scenarios
- [ ] Document rollback procedures

## Support and Resources

- **Pesapal Developer Portal:** https://developer.pesapal.com/
- **API Documentation:** https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-overview
- **Support:** https://support.pesapal.com/
- **Status Page:** https://status.pesapal.com/

## Version History

- **v2.0** (Current) - Removed token caching, fresh IPN registration, improved error handling
- **v1.0** - Initial implementation with token caching (deprecated due to reliability issues)
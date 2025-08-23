import api from "./api";

export interface MpesaAuthResponse {
  access_token: string;
  expires_in: string;
}

export interface StkPushRequest {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface PaymentStatusResponse {
  ResultCode: string;
  ResultDesc: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  Amount?: number;
  MpesaReceiptNumber?: string;
  TransactionDate?: string;
  PhoneNumber?: string;
}

class MpesaService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  // Generate M-Pesa access token
  private async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token
      if (
        this.accessToken &&
        this.tokenExpiry &&
        Date.now() < this.tokenExpiry
      ) {
        return this.accessToken;
      }

      const response = await api.post("/payments/mpesa/auth");
      const data: MpesaAuthResponse = response.data;

      this.accessToken = data.access_token;
      // Set expiry to 1 hour minus 5 minutes for safety
      this.tokenExpiry = Date.now() + (parseInt(data.expires_in) - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error("Error getting M-Pesa access token:", error);
      throw new Error("Failed to authenticate with M-Pesa");
    }
  }

  // Format phone number to required format (254XXXXXXXXX)
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces, dashes, or other characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // If it starts with 0, replace with 254
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    }

    // If it doesn't start with 254, add it
    if (!cleaned.startsWith("254")) {
      cleaned = "254" + cleaned;
    }

    return cleaned;
  }

  // Initiate STK Push
  async initiatePayment(request: StkPushRequest): Promise<StkPushResponse> {
    try {
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber);

      // Validate phone number
      if (formattedPhone.length !== 12) {
        throw new Error("Invalid phone number format");
      }

      // Validate and ensure amount is a valid number
      const numericAmount = Number(request.amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error("Invalid payment amount: must be a positive number");
      }

      const payload = {
        amount: Math.round(numericAmount), // Ensure amount is an integer
        phoneNumber: formattedPhone,
        accountReference: request.accountReference,
        transactionDesc: request.transactionDesc,
      };

      console.log("M-Pesa STK Push payload:", payload);

      const response = await api.post("/payments/mpesa/stk-push", payload);
      console.log("M-Pesa STK Push response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error initiating M-Pesa payment:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; error?: string };
            status?: number;
          };
        };
        console.error("M-Pesa API Error Response:", axiosError.response);

        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }

        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }

        if (axiosError.response?.status === 401) {
          throw new Error("Authentication failed with M-Pesa API");
        }

        if (axiosError.response?.status === 400) {
          throw new Error("Invalid request data sent to M-Pesa API");
        }
      }

      if (error && typeof error === "object" && "message" in error) {
        throw new Error((error as Error).message);
      }

      throw new Error(
        "Failed to initiate M-Pesa payment - please check your network connection",
      );
    }
  }

  // Check payment status
  async checkPaymentStatus(
    checkoutRequestId: string,
  ): Promise<PaymentStatusResponse> {
    try {
      const response = await api.get(
        `/payments/mpesa/status/${checkoutRequestId}`,
      );
      console.log("M-Pesa status check response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error checking payment status:", error);
      throw error;
    }
  }

  // Get payment result from backend cache (checks real M-Pesa status)
  async getPaymentResult(
    checkoutRequestId: string,
  ): Promise<PaymentStatusResponse> {
    try {
      console.log("Getting payment result for:", checkoutRequestId);

      const response = await api.get(
        `/payments/mpesa/status/${checkoutRequestId}`,
      );
      console.log("Payment result response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error getting payment result:", error);
      throw error;
    }
  }

  // Validate M-Pesa phone number
  validatePhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return formatted.length === 12 && formatted.startsWith("254");
  }

  // Format amount for display
  formatAmount(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }
}

export default new MpesaService();

import api from "./api";

export interface PesapalPaymentRequest {
  amount: number;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  description: string;
  lab_provider_id: number;
  patient_id: number;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  zip_code?: string;
}

export interface PesapalPaymentResponse {
  status: string;
  merchant_reference: string;
  order_tracking_id: string;
  redirect_url: string;
}

export interface PesapalPaymentStatus {
  status: string;
  payment_status: string;
  merchant_reference: string;
  order_tracking_id?: string;
  amount?: number;
  payment_method?: string;
  confirmation_code?: string;
}

class PesapalService {
  /**
   * Initiate payment with Pesapal
   */
  async initiatePayment(request: PesapalPaymentRequest): Promise<PesapalPaymentResponse> {
    try {
      console.log("Initiating Pesapal payment:", request);

      // Validate required fields
      const requiredFields = ['amount', 'email', 'phone_number', 'first_name', 'last_name', 'description', 'lab_provider_id', 'patient_id'];
      for (const field of requiredFields) {
        if (!request[field as keyof PesapalPaymentRequest]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate amount
      const numericAmount = Number(request.amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error("Invalid payment amount: must be a positive number");
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.email)) {
        throw new Error("Invalid email address");
      }

      const payload = {
        ...request,
        amount: numericAmount
      };

      const response = await api.post("/payments/pesapal/initiate", payload);
      console.log("Pesapal payment response:", response.data);

      if (response.data.status === 'success') {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to initiate payment");
      }
    } catch (error: unknown) {
      console.error("Error initiating Pesapal payment:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; error?: string; errors?: any };
            status?: number;
          };
        };

        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }

        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }

        if (axiosError.response?.data?.errors) {
          const errors = axiosError.response.data.errors;
          const firstError = Object.values(errors)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        if (axiosError.response?.status === 401) {
          throw new Error("Authentication failed");
        }

        if (axiosError.response?.status === 422) {
          throw new Error("Invalid request data");
        }
      }

      if (error && typeof error === "object" && "message" in error) {
        throw new Error((error as Error).message);
      }

      throw new Error("Failed to initiate payment - please check your network connection");
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(merchantReference: string): Promise<PesapalPaymentStatus> {
    try {
      console.log("Getting Pesapal payment status for:", merchantReference);

      const response = await api.get(`/payments/pesapal/status/${merchantReference}`);
      console.log("Pesapal status response:", response.data);

      if (response.data.status === 'success') {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to get payment status");
      }
    } catch (error: unknown) {
      console.error("Error getting Pesapal payment status:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; error?: string };
            status?: number;
          };
        };

        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }

        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }

        if (axiosError.response?.status === 404) {
          throw new Error("Payment not found");
        }
      }

      throw new Error("Failed to get payment status");
    }
  }

  /**
   * Test Pesapal connection
   */
  async testConnection(): Promise<any> {
    try {
      const response = await api.get("/payments/pesapal/test");
      return response.data;
    } catch (error) {
      console.error("Pesapal connection test failed:", error);
      throw error;
    }
  }

  /**
   * Redirect to Pesapal payment page
   */
  redirectToPayment(redirectUrl: string): void {
    console.log("Redirecting to Pesapal payment page:", redirectUrl);
    window.location.href = redirectUrl;
  }

  /**
   * Check if payment is successful
   */
  isPaymentSuccessful(paymentStatus: string): boolean {
    return ['COMPLETED', 'SUCCESS'].includes(paymentStatus?.toUpperCase());
  }

  /**
   * Check if payment failed
   */
  isPaymentFailed(paymentStatus: string): boolean {
    return ['FAILED', 'INVALID', 'CANCELLED'].includes(paymentStatus?.toUpperCase());
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(paymentStatus: string): boolean {
    return ['PENDING', 'PROCESSING', 'INITIATED'].includes(paymentStatus?.toUpperCase()) || !paymentStatus;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Remove any spaces, dashes, or other characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Check if it's a valid Kenyan phone number
    return cleaned.length >= 9 && cleaned.length <= 12;
  }

  /**
   * Format phone number to required format
   */
  formatPhoneNumber(phoneNumber: string): string {
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
}

export default new PesapalService();

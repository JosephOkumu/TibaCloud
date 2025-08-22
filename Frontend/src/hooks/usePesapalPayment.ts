import { useState, useCallback } from "react";
import pesapalService, {
  PesapalPaymentRequest,
  PesapalPaymentResponse,
  PesapalPaymentStatus,
} from "@/services/pesapalService";
import { useToast } from "@/hooks/use-toast";

export interface PesapalPaymentResult {
  success: boolean;
  merchantReference?: string;
  confirmationCode?: string;
  error?: string;
}

export interface UsePesapalPaymentProps {
  onSuccess?: (result: PesapalPaymentResult) => void;
  onError?: (error: string) => void;
  onStatusUpdate?: (status: string) => void;
}

export interface UsePesapalPaymentReturn {
  initiatePayment: (
    request: PesapalPaymentRequest,
  ) => Promise<PesapalPaymentResult>;
  checkPaymentStatus: (
    merchantReference: string,
  ) => Promise<PesapalPaymentStatus>;
  isProcessing: boolean;
  paymentStatus: string;
  merchantReference: string | null;
  resetPayment: () => void;
}

export const usePesapalPayment = ({
  onSuccess,
  onError,
  onStatusUpdate,
}: UsePesapalPaymentProps = {}): UsePesapalPaymentReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [merchantReference, setMerchantReference] = useState<string | null>(
    null,
  );
  const { toast } = useToast();

  const updateStatus = useCallback(
    (status: string) => {
      setPaymentStatus(status);
      onStatusUpdate?.(status);
    },
    [onStatusUpdate],
  );

  const checkPaymentStatus = useCallback(
    async (merchantRef: string): Promise<PesapalPaymentStatus> => {
      try {
        const statusResponse =
          await pesapalService.getPaymentStatus(merchantRef);

        console.log("Payment status check result:", statusResponse);

        updateStatus(statusResponse.payment_status || "UNKNOWN");

        return statusResponse;
      } catch (error) {
        console.error("Error checking payment status:", error);
        throw error;
      }
    },
    [updateStatus],
  );

  const initiatePayment = useCallback(
    async (request: PesapalPaymentRequest): Promise<PesapalPaymentResult> => {
      setIsProcessing(true);
      setMerchantReference(null);
      updateStatus("Initiating payment...");

      try {
        console.log(
          "Starting Pesapal payment initiation with request:",
          request,
        );

        // Debug the request data
        console.log("Pesapal payment request data:", {
          amount: request.amount,
          email: request.email,
          phone_number: request.phone_number,
          first_name: request.first_name,
          last_name: request.last_name,
          description: request.description,
          lab_provider_id: request.lab_provider_id,
          patient_id: request.patient_id,
        });

        console.log("=== PESAPAL 3-STEP PROCESS ===");
        console.log("Step 1: Getting auth token...");
        console.log("Step 2: Registering IPN (if needed)...");
        console.log("Step 3: Submitting order and getting redirect URL...");

        // Validate required fields
        const missingFields = [];
        if (!request.amount) missingFields.push("amount");
        if (!request.email) missingFields.push("email");
        if (!request.phone_number) missingFields.push("phone_number");
        if (!request.first_name) missingFields.push("first_name");
        if (!request.last_name) missingFields.push("last_name");
        if (!request.description) missingFields.push("description");
        if (!request.lab_provider_id) missingFields.push("lab_provider_id");
        if (!request.patient_id) missingFields.push("patient_id");

        if (missingFields.length > 0) {
          console.error("Missing required fields:", missingFields);
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`,
          );
        }

        // Validate and ensure amount is a number
        const numericAmount = Number(request.amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          throw new Error("Invalid payment amount: must be a positive number");
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(request.email)) {
          throw new Error("Please enter a valid email address");
        }

        // Validate phone number
        if (!pesapalService.validatePhoneNumber(request.phone_number)) {
          throw new Error("Please enter a valid phone number");
        }

        console.log("Validation passed, initiating payment...");
        updateStatus("Preparing payment...");

        // Create validated request with numeric amount
        const validatedRequest = {
          ...request,
          amount: numericAmount,
          phone_number: pesapalService.formatPhoneNumber(request.phone_number),
        };

        console.log("Initiating Pesapal payment");
        const paymentResponse: PesapalPaymentResponse =
          await pesapalService.initiatePayment(validatedRequest);

        console.log("Pesapal Payment Response:", paymentResponse);

        if (paymentResponse.status !== "success") {
          throw new Error("Failed to initiate payment");
        }

        setMerchantReference(paymentResponse.merchant_reference);
        updateStatus("Redirecting to payment page...");

        toast({
          title: "Payment Initiated",
          description: "Redirecting you to the payment page...",
          variant: "default",
        });

        // Redirect to Pesapal payment page
        console.log(
          "Redirecting to Pesapal payment page:",
          paymentResponse.redirect_url,
        );
        pesapalService.redirectToPayment(paymentResponse.redirect_url);

        // Return success result - the actual payment completion will be handled by callback
        const result: PesapalPaymentResult = {
          success: true,
          merchantReference: paymentResponse.merchant_reference,
        };

        onSuccess?.(result);
        return result;
      } catch (error: unknown) {
        console.error("Payment initiation error:", error);
        const errorMessage =
          (error as Error).message || "Payment initiation failed";

        updateStatus("Payment failed");
        onError?.(errorMessage);

        toast({
          title: "Payment Error",
          description: errorMessage,
          variant: "destructive",
        });

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [updateStatus, onSuccess, onError, toast],
  );

  const resetPayment = useCallback(() => {
    setIsProcessing(false);
    setPaymentStatus("");
    setMerchantReference(null);
  }, []);

  return {
    initiatePayment,
    checkPaymentStatus,
    isProcessing,
    paymentStatus,
    merchantReference,
    resetPayment,
  };
};

export default usePesapalPayment;

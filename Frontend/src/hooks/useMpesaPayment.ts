import { useState, useCallback } from "react";
import mpesaService, {
  StkPushRequest,
  StkPushResponse,
  PaymentStatusResponse,
} from "@/services/mpesaService";
import { useToast } from "@/hooks/use-toast";

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface UseMpesaPaymentProps {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
  onStatusUpdate?: (status: string) => void;
}

export interface UseMpesaPaymentReturn {
  initiatePayment: (request: StkPushRequest) => Promise<PaymentResult>;
  isProcessing: boolean;
  paymentStatus: string;
  checkoutRequestId: string | null;
  resetPayment: () => void;
}

export const useMpesaPayment = ({
  onSuccess,
  onError,
  onStatusUpdate,
}: UseMpesaPaymentProps = {}): UseMpesaPaymentReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(
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

  const pollPaymentStatus = useCallback(
    async (
      checkoutRequestId: string,
      isDevelopment: boolean,
      maxAttempts: number = 60,
      interval: number = 5000,
    ): Promise<PaymentResult> => {
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          // Wait before checking (except for first attempt)
          if (attempts > 0) {
            await new Promise((resolve) => setTimeout(resolve, interval));
          }

          // Always use real M-Pesa API for status checking
          const statusResponse =
            await mpesaService.getPaymentResult(checkoutRequestId);

          console.log(`Payment status check ${attempts + 1}:`, statusResponse);

          // Define M-Pesa status codes
          const SUCCESS_CODE = "0";
          const PROCESSING_CODES = ["1037", "4999", "1032", "1001"];
          const FAILURE_CODES = [
            "1",
            "2",
            "3",
            "4",
            "5",
            "17",
            "26",
            "1025",
            "1026",
            "1027",
          ];

          if (statusResponse.ResultCode === SUCCESS_CODE) {
            // Payment successful
            console.log("Payment confirmed as successful");
            return {
              success: true,
              transactionId: statusResponse.MpesaReceiptNumber,
            };
          } else if (
            PROCESSING_CODES.includes(statusResponse.ResultCode || "")
          ) {
            // Still processing - continue polling
            console.log(
              `Payment still processing with code: ${statusResponse.ResultCode}`,
            );
          } else if (
            FAILURE_CODES.includes(statusResponse.ResultCode || "") ||
            (statusResponse.ResultCode &&
              !PROCESSING_CODES.includes(statusResponse.ResultCode))
          ) {
            // Payment failed
            console.log("Payment failed with code:", statusResponse.ResultCode);
            return {
              success: false,
              error: statusResponse.ResultDesc || "Payment failed",
            };
          }

          // Continue polling for processing status
          attempts++;
          const timeRemaining = Math.ceil(
            ((maxAttempts - attempts) * interval) / 1000 / 60,
          );
          updateStatus(
            `Waiting for payment confirmation... Please check your phone and enter your M-Pesa PIN. (${attempts}/${maxAttempts}) - ${timeRemaining} min remaining`,
          );
        } catch (error) {
          console.log(
            `Payment status check attempt ${attempts + 1}: Still processing...`,
          );

          // All errors during polling are treated as "still processing"
          // This is normal M-Pesa behavior while waiting for user to pay
          attempts++;
          const timeRemaining = Math.ceil(
            ((maxAttempts - attempts) * interval) / 1000 / 60,
          );
          updateStatus(
            `Payment processing... Please complete payment on your phone. (${attempts}/${maxAttempts}) - ${timeRemaining} min remaining`,
          );

          if (attempts >= maxAttempts) {
            return {
              success: false,
              error:
                "Payment confirmation timed out - please contact support if money was deducted",
            };
          }
          // Wait before next check
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      }

      // If we reach here, it means we've exhausted all attempts
      // Check if the last known status was still processing
      console.log("Polling completed - checking final status");
      return {
        success: false,
        error:
          "Payment confirmation timed out - please contact support if money was deducted",
      };
    },
    [updateStatus],
  );

  const initiatePayment = useCallback(
    async (request: StkPushRequest): Promise<PaymentResult> => {
      setIsProcessing(true);
      setCheckoutRequestId(null);
      updateStatus("Initiating payment...");

      try {
        console.log("Starting payment initiation with request:", request);

        // Validate and ensure amount is a number
        const numericAmount = Number(request.amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          throw new Error("Invalid payment amount: must be a positive number");
        }

        // Validate phone number
        if (!mpesaService.validatePhoneNumber(request.phoneNumber)) {
          throw new Error(
            "Please enter a valid phone number (e.g., 0712345678)",
          );
        }

        console.log(
          "Validation passed, amount:",
          numericAmount,
          "phone:",
          request.phoneNumber,
        );

        updateStatus("Sending STK push to your phone...");

        // Always use real M-Pesa sandbox for STK push
        console.log("Using real M-Pesa sandbox for STK push");

        // Create validated request with numeric amount
        const validatedRequest = {
          ...request,
          amount: numericAmount,
        };

        console.log("Initiating real M-Pesa STK push");
        const stkResponse =
          await mpesaService.initiatePayment(validatedRequest);

        console.log("STK Push Response:", stkResponse);

        if (stkResponse.ResponseCode !== "0") {
          throw new Error(
            stkResponse.ResponseDescription || "Failed to initiate payment",
          );
        }

        setCheckoutRequestId(stkResponse.CheckoutRequestID);
        updateStatus("Please enter your M-Pesa PIN on your phone...");

        toast({
          title: "STK Push Sent",
          description:
            "Check your phone and enter your M-Pesa PIN to complete the payment.",
          variant: "default",
        });

        // Poll for payment status
        console.log(
          "Starting payment status polling for:",
          stkResponse.CheckoutRequestID,
        );
        const result = await pollPaymentStatus(
          stkResponse.CheckoutRequestID,
          false, // Always use real API for status checking
        );

        console.log("Payment polling result:", result);

        if (result.success) {
          updateStatus("Payment completed successfully");
          onSuccess?.(result);

          toast({
            title: "Payment Successful",
            description: `Payment of ${mpesaService.formatAmount(numericAmount)} completed successfully.`,
            variant: "default",
          });
        } else {
          updateStatus("Payment failed");
          onError?.(result.error || "Payment failed");

          toast({
            title: "Payment Failed",
            description: result.error || "Payment was not completed",
            variant: "destructive",
          });
        }

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
    [updateStatus, onSuccess, onError, toast, pollPaymentStatus],
  );

  const resetPayment = useCallback(() => {
    setIsProcessing(false);
    setPaymentStatus("");
    setCheckoutRequestId(null);
  }, []);

  return {
    initiatePayment,
    isProcessing,
    paymentStatus,
    checkoutRequestId,
    resetPayment,
  };
};

export default useMpesaPayment;

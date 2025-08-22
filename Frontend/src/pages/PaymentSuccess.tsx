import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import pesapalService from "@/services/pesapalService";
import appointmentService from "@/services/appointmentService";
import { useAuth } from "@/contexts/AuthContext";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const merchantReference = searchParams.get("merchant_reference");
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const pesapalTransactionId = searchParams.get("PesapalTransactionId");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!merchantReference) {
        setError("Payment reference not found");
        setLoading(false);
        return;
      }

      try {
        console.log("Verifying payment with merchant reference:", merchantReference);

        // Check payment status from backend
        const statusResponse = await pesapalService.getPaymentStatus(merchantReference);

        console.log("Payment status response:", statusResponse);

        setPaymentDetails(statusResponse);
        setPaymentStatus(statusResponse.payment_status);

        if (pesapalService.isPaymentSuccessful(statusResponse.payment_status)) {
          // Payment successful - create lab appointment if not already created
          try {
            // Get payment data from cache to create appointment
            const paymentData = localStorage.getItem(`lab_booking_${merchantReference}`);
            if (paymentData) {
              const bookingData = JSON.parse(paymentData);

              await appointmentService.createLabAppointment({
                patient_id: bookingData.patient_id,
                lab_provider_id: bookingData.lab_provider_id,
                appointment_datetime: bookingData.appointment_datetime,
                test_ids: bookingData.test_ids,
                total_amount: statusResponse.amount || bookingData.total_amount,
                payment_reference: merchantReference,
                notes: `Lab tests booked via Pesapal payment - ${statusResponse.confirmation_code || ''}`,
              });

              // Clean up temporary booking data
              localStorage.removeItem(`lab_booking_${merchantReference}`);

              console.log("Lab appointment created successfully");
            }
          } catch (appointmentError) {
            console.error("Error creating lab appointment:", appointmentError);
            // Don't show error to user since payment was successful
          }

          toast({
            title: "Payment Successful",
            description: "Your lab appointment has been confirmed.",
            variant: "default",
          });
        } else if (pesapalService.isPaymentFailed(statusResponse.payment_status)) {
          setError("Payment was not successful. Please try again.");
          toast({
            title: "Payment Failed",
            description: "Your payment could not be processed. Please try again.",
            variant: "destructive",
          });
        } else {
          // Payment still pending
          setTimeout(verifyPayment, 3000); // Check again in 3 seconds
          return;
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setError("Unable to verify payment status. Please contact support.");
        toast({
          title: "Verification Error",
          description: "Unable to verify your payment. Please contact support if money was deducted.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [merchantReference, toast]);

  const handleContinue = () => {
    if (user) {
      navigate("/patient-dashboard/lab-appointments");
    } else {
      navigate("/");
    }
  };

  const handleRetry = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
            {merchantReference && (
              <p className="text-xs text-gray-500 mt-4">
                Reference: {merchantReference}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col space-y-3">
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleContinue}>
                Continue to Dashboard
              </Button>
            </div>
            {merchantReference && (
              <p className="text-xs text-gray-500 mt-4">
                Reference: {merchantReference}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess = paymentStatus && pesapalService.isPaymentSuccessful(paymentStatus);
  const isFailed = paymentStatus && pesapalService.isPaymentFailed(paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {isSuccess ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your lab appointment has been confirmed. You will receive a confirmation email shortly.
              </p>

              {paymentDetails && (
                <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
                  <h3 className="font-medium text-green-800 mb-2">Payment Details</h3>
                  <div className="space-y-1 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>{pesapalService.formatAmount(paymentDetails.amount || 0)}</span>
                    </div>
                    {paymentDetails.payment_method && (
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span>{paymentDetails.payment_method}</span>
                      </div>
                    )}
                    {paymentDetails.confirmation_code && (
                      <div className="flex justify-between">
                        <span>Confirmation:</span>
                        <span>{paymentDetails.confirmation_code}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="break-all">{merchantReference}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleContinue} className="w-full">
                View My Appointments
              </Button>
            </>
          ) : isFailed ? (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-6">
                Your payment could not be processed. Please try booking again.
              </p>

              {paymentDetails && (
                <div className="bg-red-50 p-4 rounded-lg mb-6 text-left">
                  <h3 className="font-medium text-red-800 mb-2">Payment Status</h3>
                  <div className="space-y-1 text-sm text-red-700">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span>{paymentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="break-all">{merchantReference}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <Button onClick={handleRetry} variant="outline">
                  Try Again
                </Button>
                <Button onClick={handleContinue}>
                  Back to Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
              <p className="text-gray-600">
                Your payment is still being processed. Please wait...
              </p>
              {merchantReference && (
                <p className="text-xs text-gray-500 mt-4">
                  Reference: {merchantReference}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;

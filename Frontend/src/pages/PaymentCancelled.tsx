import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const merchantReference = searchParams.get("merchant_reference");
  const orderTrackingId = searchParams.get("OrderTrackingId");

  useEffect(() => {
    // Clean up any temporary booking data
    if (merchantReference) {
      localStorage.removeItem(`lab_booking_${merchantReference}`);
    }

    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled. No charges were made.",
      variant: "default",
    });
  }, [merchantReference, toast]);

  const handleRetry = () => {
    navigate(-1); // Go back to previous page
  };

  const handleGoHome = () => {
    if (user) {
      navigate("/patient-dashboard");
    } else {
      navigate("/");
    }
  };

  const handleBrowseLabs = () => {
    navigate("/patient-dashboard/lab-provider");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <XCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Payment Cancelled
          </h2>
          <p className="text-gray-600 mb-6">
            You cancelled the payment process. Your booking was not completed and no charges were made to your account.
          </p>

          {merchantReference && (
            <div className="bg-orange-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-medium text-orange-800 mb-2">Transaction Details</h3>
              <div className="space-y-1 text-sm text-orange-700">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span>Cancelled</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="break-all">{merchantReference}</span>
                </div>
                {orderTrackingId && (
                  <div className="flex justify-between">
                    <span>Tracking ID:</span>
                    <span className="break-all">{orderTrackingId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full" variant="default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button onClick={handleBrowseLabs} className="w-full" variant="outline">
              Browse Other Labs
            </Button>

            <Button onClick={handleGoHome} className="w-full" variant="ghost">
              Go to Dashboard
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Need help? Contact our support team for assistance with your booking.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelled;

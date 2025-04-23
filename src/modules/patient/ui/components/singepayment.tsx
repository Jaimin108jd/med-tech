"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/app/trpc/client";
import { useRazorpay } from "@/hooks/use-razorpay";
import { usePaymentModal } from "../../hooks/payment-modal";

export function SinglePayment({
  onPaymentSuccess,
  onPaymentFailure,
}: {
  onPaymentSuccess: () => void
  onPaymentFailure: () => void
}) {
  const router = useRouter();
  const { loadRazorpay } = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);
  const { setOpen: setIsPaymentModalOpen } = usePaymentModal();
  const createSinglePaymentOrder = trpc.payment.createSinglePaymentOrder.useMutation();
  const verifyPayment = trpc.payment.verifyPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment successful! You can now book appointments.");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Payment verification failed: ${error.message}`);
    },
  });

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      // Load Razorpay script
      const Razorpay = await loadRazorpay()
      if (!Razorpay) {
        toast.error("Failed to load payment gateway. Please try again.")
        setIsProcessing(false)
        return
      }
     

      // Fixed amount for single payment (e.g., ₹499)
      const amount = 499

      // Create order
      const order = await createSinglePaymentOrder.mutateAsync({
        amount,
        notes: "Single appointment payment",
      })

      // Initialize Razorpay options
      const options = {
        key: "rzp_test_6nImbIPGGzTOFe",
        amount: order.amount,
        currency: order.currency,
        name: "Healthcare App",
        description: "Single Appointment Payment",
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            await verifyPayment.mutateAsync({
              paymentId: order.paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            })
            onPaymentSuccess() // Call the success callback
          } catch (error) {
            console.error("Payment verification error:", error)
            onPaymentFailure() // Call the failure callback
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#6366F1",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            onPaymentFailure() // Call the failure callback
          },
        },
      }

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open();
      setIsPaymentModalOpen(false); // Close the payment modal if open
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Failed to process payment. Please try again.")
      setIsProcessing(false)
      onPaymentFailure() // Call the failure callback
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <Card className="max-w-md mx-auto">
        <CardHeader>
          {/* <CardTitle>Single Appointment Payment</CardTitle> */}
          <CardDescription className="text-center">Make a one-time payment to book an appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">₹499</p>
            <p className="text-muted-foreground">One-time payment</p>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span>Book a single appointment with any doctor</span>
            </div>
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span>Access to medical records</span>
            </div>
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span>24/7 customer support</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              "Pay Now"
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
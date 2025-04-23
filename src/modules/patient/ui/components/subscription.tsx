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

export function SubscriptionPlans({ onPaymentSuccess,
  onPaymentFailure, }: {
    onPaymentSuccess: () => void
    onPaymentFailure: () => void
  }) {
  const router = useRouter();
  const { loadRazorpay } = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { data: plans, isLoading } = trpc.payment.getSubscriptionPlans.useQuery();
  const { data: activeSubscription } = trpc.payment.getUserSubscription.useQuery();
  const createSubscriptionOrder = trpc.payment.createSubscriptionOrder.useMutation();
  const verifyPayment = trpc.payment.verifyPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment successful! Your subscription is now active.");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Payment verification failed: ${error.message}`);
    },
  });

  const handleSubscribe = async (planId: string) => {
    try {
        setIsProcessing(true)
        setSelectedPlanId(planId)

        // Load Razorpay script
        const Razorpay = await loadRazorpay()
        if (!Razorpay) {
            toast.error("Failed to load payment gateway. Please try again.")
            setIsProcessing(false)
            return
        }

        // Create order
        const order = await createSubscriptionOrder.mutateAsync({ planId })

        // Initialize Razorpay options
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "Healthcare App",
            description: `Subscription to ${order.planName}`,
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
                    setSelectedPlanId(null)
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
                    setSelectedPlanId(null)
                    onPaymentFailure() // Call the failure callback
                },
            },
        }

        // Open Razorpay checkout
        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
    } catch (error) {
        console.error("Subscription error:", error)
        toast.error("Failed to process subscription. Please try again.")
        setIsProcessing(false)
        setSelectedPlanId(null)
        onPaymentFailure() // Call the failure callback
    }
}

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {plans?.map((plan) => {
        const isActive = activeSubscription?.subscription.planId === plan.id;
        const isSelected = selectedPlanId === plan.id;
        const features = JSON.parse(plan.features);
        const durationText = getDurationText(plan.durationDays);

        return (
          <motion.div key={plan.id} variants={itemVariants}>
            <Card className={`h-full flex flex-col ${isActive ? "border-primary border-2" : ""}`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {plan.name}
                  {isActive && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{durationText}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">₹{(plan.price / 100).toFixed(2)}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={isProcessing || isActive}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isProcessing && isSelected ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : isActive ? (
                    "Current Plan"
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function getDurationText(days: number): string {
  if (days === 7) return "7 Days";
  if (days === 30) return "1 Month";
  if (days === 90) return "3 Months";
  if (days === 180) return "6 Months";
  return `${days} Days`;
}
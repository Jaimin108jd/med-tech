import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionPlans } from "../ui/components/subscription"
import { SinglePayment } from "../ui/components/singepayment"


export function PaymentView({
    onPaymentSuccess,
    onPaymentFailure,
}: {
    onPaymentSuccess: () => void
    onPaymentFailure: () => void
}) {
    return (
        <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight">Choose Your Payment Plan</h1>
                    <p className="text-muted-foreground mt-2">
                        Select a payment option that works best for you
                    </p>
                </div>
{/* 
                <Tabs defaultValue="subscription" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="subscription">Subscription Plans</TabsTrigger>
                        <TabsTrigger value="single">Single Payment</TabsTrigger>
                    </TabsList>
                    <TabsContent value="subscription">
                        <SubscriptionPlans
                            onPaymentSuccess={onPaymentSuccess}
                            onPaymentFailure={onPaymentFailure}
                        />
                    </TabsContent>
                    <TabsContent value="single">
                    </TabsContent>
                </Tabs> */}
                        <SinglePayment
                            onPaymentSuccess={onPaymentSuccess}
                            onPaymentFailure={onPaymentFailure}
                        />
            </div>
        </div>
    )
}
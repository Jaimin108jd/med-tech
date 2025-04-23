import { Separator } from "@/components/ui/separator";
import { PaymentHistoryView } from "@/modules/patient/views/payment-history-view";

export default function PaymentHistoryPage() {
  return (
    <div className="container">
      <div className="title px-4 py-4">
        <h2 className="text-2xl font-semibold">Payment History</h2>
        <p className="text-sm text-gray-500">View your payment history</p>
        <Separator />
      </div>
      <div className="content px-4">
        <PaymentHistoryView />
      </div>
    </div>
  );
}

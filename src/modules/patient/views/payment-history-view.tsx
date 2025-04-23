"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/app/trpc/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function PaymentHistoryView() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: payments, isLoading } =
    trpc.patient.getPaymentHistory.useQuery();

  const filteredPayments = payments?.filter(
    (payment) =>
      payment.razorpayOrderId
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.razorpayPaymentId
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.paymentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount / 100);
  };

  return (
    <Card className="border-none shadow-none bg-transparent ">
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by order ID, payment ID, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={tableVariants}
          className="rounded-md border"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading payment history...
                  </TableCell>
                </TableRow>
              ) : filteredPayments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No payment records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments?.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    variants={rowVariants}
                    className="group hover:bg-muted/50 cursor-pointer"
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      {format(
                        new Date(payment.createdAt!),
                        "MMM d, yyyy HH:mm"
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.razorpayOrderId}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.razorpayPaymentId || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.paymentType}</Badge>
                    </TableCell>
                    <TableCell>{formatAmount(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          getStatusColor(payment.status),
                          "hover:bg-opacity-70 cursor-pointer capitalize"
                        )}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      </CardContent>
    </Card>
  );
}

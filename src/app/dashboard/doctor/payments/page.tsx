"use client";

import { useState } from "react";
import { trpc } from "@/app/trpc/client";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import { Loader2, DollarSign, Calendar, TrendingUp, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

const DoctorPaymentsPage = () => {
  const { data, isLoading } = trpc.doctor.getPayments.useQuery();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.payments || data.payments.length === 0) {
    return <div className="text-center py-10">No payment data available.</div>;
  }

  // Calculate financial metrics
  const totalRevenue =
    data.payments.reduce((sum, payment) => sum + payment.amount, 0) / 100; // Convert to dollars
  const averagePayment = totalRevenue / data.payments.length;

  // Prepare data for revenue chart - Group by month
  const getRevenueData = () => {
    if (!data.payments.length) return [];

    // Get date range for the last 6 months
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);

    // Create array of month boundaries
    const monthsArray = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfMonth(today),
    });

    // Initialize revenue data with all months
    const monthlyRevenue = monthsArray.map((date) => ({
      month: format(date, "MMM"),
      revenue: 0,
      date: date,
    }));

    // Populate with actual revenue data
    data.payments.forEach((payment) => {
      const paymentDate = new Date(payment.createdAt ?? "");
      const monthIndex = monthlyRevenue.findIndex(
        (item) =>
          format(item.date, "MMM yyyy") === format(paymentDate, "MMM yyyy")
      );

      if (monthIndex !== -1) {
        monthlyRevenue[monthIndex].revenue += payment.amount / 100;
      }
    });

    // Return the last 6 months of data
    return monthlyRevenue.slice(-6);
  };

  // Prepare data for payment methods chart
  const getPaymentMethodData = () => {
    if (!data.payments.length) return [];

    const methodCounts: { [key: string]: number } = {};
    data.payments.forEach((payment) => {
      methodCounts[payment.paymentMethod] =
        (methodCounts[payment.paymentMethod] || 0) + 1;
    });

    return Object.entries(methodCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const revenueData = getRevenueData();
  const paymentMethodData = getPaymentMethodData();

  // Calculate month-over-month growth for revenue
  const calculateGrowth = () => {
    if (revenueData.length < 2) return 0;

    const currentMonth = revenueData[revenueData.length - 1].revenue;
    const previousMonth = revenueData[revenueData.length - 2].revenue;

    if (previousMonth === 0) return 100; // To avoid division by zero

    return (((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1);
  };

  const revenueGrowth = calculateGrowth();

  // Calculate appointment growth
  const appointmentGrowth = 0; // This would need historical appointment data

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Payment Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(revenueGrowth as number) > 0 ? "+" : ""}
                {revenueGrowth}% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.appointments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {appointmentGrowth}% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Payment
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{averagePayment.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 rounded-lg shadow"
        >
          <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 rounded-lg shadow"
        >
          <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} payments`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Recent Payments</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.payments.map((payment) => (
              <TableRow
                key={payment.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedPayment(payment)}
              >
                <TableCell>
                  {format(new Date(payment.createdAt ?? ""), "MMM d, yyyy")}
                </TableCell>
                <TableCell>₹{(payment.amount / 100).toFixed(2)}</TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === "completed" ? "outline" : "default"
                    }
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>{payment.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {selectedPayment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
            <p>
              <strong>ID:</strong> {selectedPayment.id}
            </p>
            <p>
              <strong>Amount:</strong> ₹
              {(selectedPayment.amount / 100).toFixed(2)}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {format(new Date(selectedPayment.createdAt), "PPP")}
            </p>
            <p>
              <strong>Method:</strong> {selectedPayment.paymentMethod}
            </p>
            <p>
              <strong>Status:</strong> {selectedPayment.status}
            </p>
            <p>
              <strong>Notes:</strong> {selectedPayment.notes}
            </p>
            {selectedPayment.razorpayPaymentId && (
              <p>
                <strong>Razorpay Payment ID:</strong>{" "}
                {selectedPayment.razorpayPaymentId}
              </p>
            )}
            {selectedPayment.paymentType && (
              <p>
                <strong>Payment Type:</strong> {selectedPayment.paymentType}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DoctorPaymentsPage;

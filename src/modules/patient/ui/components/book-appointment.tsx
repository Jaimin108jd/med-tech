"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/app/trpc/client";
import { BookAppointmentSheet } from "./book-appointment-sheet";
import { PaymentView } from "../../views/payment-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedList } from "@/components/ui/animated-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SplitText from "@/components/ui/split-text";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { TextAnimate } from "@/components/ui/text-animate";
import AppointmentCard from "./appointment-card";
import { BlurFade } from "@/components/ui/blur-fade";
import { usePaymentModal } from "../../hooks/payment-modal";

export default function BookAppointmentPage() {
  const router = useRouter();
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { isOpen: isPaymentModalOpen, setOpen: setIsPaymentModalOpen } = usePaymentModal();

  const {
    data: appointmentStatus,
    isLoading,
    error,
    refetch,
  } = trpc.payment.canBookAppointment.useQuery();
  const { data: appointmentsData, refetch: refetchAppointments } =
    trpc.patient.getAppointments.useQuery({ limit: 20, upcoming: true });
  const { data: previousAppointmentsData } =
    trpc.patient.getAppointments.useQuery({ limit: 20, upcoming: false });

  useEffect(() => {
    if (!isLoading && appointmentStatus) {
      setIsPaymentRequired(!appointmentStatus.canBook);
    }
  }, [appointmentStatus, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        toast.error("Failed to check payment status");
        setIsCheckingPayment(false);
      } else if (appointmentStatus) {
        setIsCheckingPayment(false);
      }
    }
  }, [appointmentStatus, isLoading, error]);

  const handlePaymentSuccess = () => {
    toast.success("Payment successful! You can now book your appointment.");
    refetch();
    setIsPaymentRequired(false);
    setIsPaymentModalOpen(false);
    // Open the appointment sheet after successful payment
    setIsSheetOpen(true);
  };

  const handlePaymentFailure = () => {
    toast.error("Payment failed. Please try again.");
    refetch();
  };

  const handleBookAppointmentClick = () => {
    if (isPaymentRequired) {
      // If payment is required, show payment modal first
      setIsPaymentModalOpen(true);
    } else {
      // If no payment required, directly open appointment sheet
      setIsSheetOpen(true);
    }
  };

  const handleAppointmentSelect = (item: string, index: number) => {
    console.log("Selected appointment:", item, index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (isCheckingPayment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking payment status...</p>
        </div>
      </div>
    );
  }

  // Map appointments to the format expected by AnimatedList
  const appointmentItems =
    appointmentsData?.map((appointment) => ({
      title: appointment?.title ?? "Unknown Title",
      doctor: appointment.doctorName ?? "Unknown Doctor",
      date: format(new Date(appointment.date), "PPP"),
      notes: appointment.notes ?? "No notes available",
      servity: appointment.severity,
      status: appointment.status,
      id: appointment.id,
      doctorId: appointment.doctorId,
      Date: appointment.date,
      specialization: appointment.specializationId,
      refetchAppointments,
    })) || [];
  const previousAppointmentItems =
    previousAppointmentsData?.map((appointment) => ({
      title: appointment?.title ?? "Unknown Title",
      doctor: appointment.doctorName ?? "Unknown Doctor",
      date: format(new Date(appointment.date), "PPP"),
      notes: appointment.notes ?? "No notes available",
      servity: appointment.severity,
      status: appointment.status,
      id: appointment.id,
      doctorId: appointment.doctorId,
      Date: appointment.date,
      specialization: appointment.specializationId,
      refetchAppointments,
    })) || [];
  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className=" mx-auto px-4 py-2"
    >
      <Card className="mb-1 bg-transparent shadow-none border-none py-0">
        <CardHeader className="py-2 px-2">
          <CardTitle className="flex items-center justify-between gap-2 ">
            <h1 className="text-2xl font-semibold">Appointments</h1>
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full max-w-md"
              >
                {isPaymentRequired ? (
                  <Button onClick={handleBookAppointmentClick} className="mt-4">
                    Pay For Appointment
                  </Button>
                ) : (
                  <BookAppointmentSheet />
                )}
              </motion.div>
            </div>
          </CardTitle>
        </CardHeader>
        {isPaymentRequired && (
          <CardContent className="space-y-4">
            <Alert
              variant="destructive"
              className="bg-amber-50 border-amber-200"
            >
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle>Payment Required</AlertTitle>
              <AlertDescription>
                A payment is required before booking an appointment.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>
      <Separator />
      <div className="w-full flex flex-col gap-2">
        <BlurFade direction="left" inView className="text-3xl font-semibold">
          Upcomming Appointments:
        </BlurFade>
        {appointmentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointmentItems.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0, // Initial state before animation
                }}
              >
                <AppointmentCard
                  title={item.title}
                  status={item.status ?? "scheduled"}
                  dateTime={item.date}
                  timeRemaining={formatTimestamp(item.Date)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 opacity-30 mb-3" />
            <p className="text-muted-foreground">No appointments found.</p>
            {isPaymentRequired ? (
              <Button onClick={handleBookAppointmentClick} className="mt-4">
                Pay For Appointment
              </Button>
            ) : (
              <BookAppointmentSheet />
            )}
          </div>
        )}
      </div>
      <div className="w-full flex flex-col gap-2 my-8">
        <BlurFade direction="left" inView className="text-3xl font-semibold">
          Previous Appointments:
        </BlurFade>
        {previousAppointmentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previousAppointmentItems.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0, // Initial state before animation
                }}
              >
                <AppointmentCard
                  title={item.title}
                  status={item.status ?? "scheduled"}
                  dateTime={item.date}
                  timeRemaining={formatTimestamp(item.Date)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 opacity-30 mb-3" />
            <p className="text-muted-foreground">No appointments found.</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Please complete the payment to continue booking your appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 px-4">
            <PaymentView
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Booking Sheet */}
    </motion.div>
  );
}

const ListItem = ({
  item,
  index,
  onClick,
}: {
  item: {
    title: string;
    doctor: string;
    date: string;
    notes: string;
    servity: string;
    status: string;
    id: string;
    doctorId: string;
    Date: Date;
    specialization: any;
    refetchAppointments: () => void;
  };
  index: number;
  onClick: () => void;
}) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-full cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[101%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        {/* <div
                    className="flex size-10 items-center justify-center rounded-2xl"
                    style={{
                        backgroundColor: "#F3F4F6",
                    }}
                >
                    <span className="text-lg">{icon}</span>
                </div> */}
        <div className="flex flex-col overflow-hidden w-full">
          <figcaption className="flex flex-row w-full justify-between items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span>
              <span className="text-sm sm:text-lg">Doctor: {item.doctor}</span>
              <span className="mx-1">·</span>
              <span className="text-xs text-gray-500">
                Scheduled from now to {item.date}
              </span>
            </span>
            <BookAppointmentSheet
              defaultValues={{
                title: item.title,
                date: item.Date,
                doctorId: item.doctorId,
                notes: item.notes,
                severity: item.servity as
                  | "low"
                  | "medium"
                  | "high"
                  | "critical",
                id: item.id,
                specializationId: item.specialization,
              }}
              refetchAppointments={item.refetchAppointments}
            />
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60 line-clamp-1">
            <span className="text-sm text-gray-500">Notes:</span> {item.notes}
          </p>
        </div>
      </div>
    </figure>
  );
};

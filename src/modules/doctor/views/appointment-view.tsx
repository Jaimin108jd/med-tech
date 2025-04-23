"use client";
import { trpc } from "@/app/trpc/client";
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Loader2,
  Pencil,
  Eye,
  CalendarIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const DoctorAppointmentView = () => {
  // Fetch appointments using tRPC
  const { data: appointments, isPending } =
    trpc.doctor.getUpcomingAppointments.useQuery({
      limit: 10,
    });
  const { data: a } = trpc.doctor.getPayments.useQuery();
  console.log(a);

  const utils = trpc.useContext();

  // Update notes mutation
  const updateNotesMutation = trpc.doctor.updateAppointmentNotes.useMutation({
    onSuccess: () => {
      utils.doctor.getUpcomingAppointments.invalidate();
      toast.success("Notes updated successfully.");
      setViewSheetOpen(false);
      setEditSheetOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update notes. Please try again.");
    },
  });

  // Reschedule appointment mutation
  const rescheduleAppointmentMutation =
    trpc.doctor.rescheduleAppointment.useMutation({
      onSuccess: () => {
        utils.doctor.getUpcomingAppointments.invalidate();
        toast.success("Appointment rescheduled successfully");
        setEditSheetOpen(false);
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to reschedule appointment. Please try again."
        );
      },
    });

  // Update appointment status mutation
  const updateStatusMutation = trpc.doctor.updateAppointmentStatus.useMutation({
    onSuccess: () => {
      utils.doctor.getUpcomingAppointments.invalidate();
      toast.success("Appointment status updated successfully");
      setEditSheetOpen(false);
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to update appointment status. Please try again."
      );
    },
  });

  // State for sheets
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    patientName: string;
    date: string;
    status: string;
    severity: string;
    notes: string;
  } | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [doctorNotesValue, setDoctorNotesValue] = useState("");
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [timeValue, setTimeValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [completedAppointments, setCompletedAppointments] = useState<any>([]);

  // Open view notes sheet
  const handleOpenViewSheet = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNotesValue(appointment.notes || "");
    setViewSheetOpen(true);
  };

  // Open edit sheet
  const handleOpenEditSheet = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNotesValue(appointment.doctorNotes || "");
    setDateValue(appointment.date ? new Date(appointment.date) : new Date());
    setTimeValue(
      appointment.date ? format(new Date(appointment.date), "HH:mm") : "09:00"
    );
    setStatusValue(appointment.status || "scheduled");
    setEditSheetOpen(true);
  };

  // Save notes
  const handleSaveNotes = () => {
    if (!selectedAppointment) return;

    updateNotesMutation.mutate({
      appointmentId: selectedAppointment.id,
      notes: notesValue,
    });
  };

  // Reschedule appointment
  const handleReschedule = () => {
    if (!selectedAppointment || !dateValue) return;

    // Combine date and time
    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDate = new Date(dateValue);
    newDate.setHours(hours, minutes, 0, 0);

    rescheduleAppointmentMutation.mutate({
      appointmentId: selectedAppointment.id,
      date: newDate,
    });
  };

  // Update status
  const handleUpdateStatus = (status: any) => {
    if (!selectedAppointment) return;

    updateStatusMutation.mutate({
      appointmentId: selectedAppointment.id,
      status: status,
    });

    if (status === "completed") {
      setCompletedAppointments([
        ...completedAppointments,
        selectedAppointment.id,
      ]);

      // Remove from completed list after animation completes
      setTimeout(() => {
        setCompletedAppointments(
          completedAppointments.filter(
            (id: any) => id !== selectedAppointment.id
          )
        );
      }, 1000);
    }
  };

  // Loading state
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Empty state
  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No appointments found.
      </div>
    );
  }

  // Time options for select
  const timeOptions = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return (
    <>
      <Table className="w-full border-collapse border border-gray-200">
        <TableHeader className="bg-gray-100">
          <TableRow className="hover:bg-gray-100">
            <TableHead className="p-3 text-left">Patient Name</TableHead>
            <TableHead className="p-3 text-left">Date</TableHead>
            <TableHead className="p-3 text-left">Status</TableHead>
            <TableHead className="p-3 text-left">Severity</TableHead>
            <TableHead className="p-3 text-left">Notes</TableHead>
            <TableHead className="p-3 text-left">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <motion.tr
              key={appointment.id}
              className={cn(
                "hover:bg-gray-50",
                completedAppointments.includes(appointment.id) && "bg-green-50"
              )}
              animate={
                completedAppointments.includes(appointment.id)
                  ? {
                      backgroundColor: ["#f0fdf4", "#ffffff"],
                      transition: { duration: 1 },
                    }
                  : {}
              }
              layout
            >
              <TableCell className="p-3">
                {appointment.patientName || "Unknown Patient"}
              </TableCell>
              <TableCell className="p-3">
                {new Date(appointment.date).toLocaleString()}
              </TableCell>
              <TableCell className="p-3">
                <Badge
                  variant="outline"
                  className={cn(
                    // Stat us badge color
                    appointment.status === "completed" &&
                      "bg-green-200 text-green-800",
                    appointment.status === "scheduled" &&
                      "bg-blue-200 text-blue-800",
                    appointment.status === "canceled" &&
                      "bg-red-200 text-red-800",
                    appointment.status === "rescheduled" &&
                      "bg-yellow-200 text-yellow-800",
                    appointment.status === "in-progress" &&
                      "bg-amber-200 text-amber-800",
                    "px-2 py-1 rounded-sm hover:opacity-80 cursor-pointer capitalize"
                  )}
                >
                  {appointment.status}
                </Badge>
              </TableCell>
              <TableCell className="p-3">
                <Badge
                  variant="outline"
                  className={cn(
                    // Severity badge color
                    appointment.severity === "low" &&
                      "bg-green-200 text-green-800",
                    appointment.severity === "medium" &&
                      "bg-yellow-200 text-yellow-800",
                    appointment.severity === "high" &&
                      "bg-red-200 text-red-800",
                    "px-2 py-1 rounded-sm hover:opacity-80 cursor-pointer capitalize"
                  )}
                >
                  {appointment.severity}
                </Badge>
              </TableCell>
              <TableCell className="p-3 max-w-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal underline"
                  onClick={() => handleOpenViewSheet(appointment)}
                >
                  {appointment.notes
                    ? appointment.notes.length > 30
                      ? appointment.notes.substring(0, 30) + "..."
                      : appointment.notes
                    : "No notes available"}
                </Button>
              </TableCell>
              <TableCell className="p-3">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenViewSheet(appointment)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditSheet(appointment)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>

      {/* View Notes Sheet */}
      <Sheet open={viewSheetOpen} onOpenChange={setViewSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {selectedAppointment ? (
                <>Notes from {selectedAppointment.patientName || "Patient"}</>
              ) : (
                "Appointment Notes"
              )}
            </SheetTitle>
            <SheetDescription>
              {selectedAppointment && selectedAppointment.date ? (
                <>
                  Appointment on{" "}
                  {format(new Date(selectedAppointment.date), "PPP 'at' p")}
                </>
              ) : (
                "View appointment details"
              )}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Doctor's Notes</h3>
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap min-h-[200px]">
                {notesValue || "No notes available for this appointment."}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Appointment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      selectedAppointment?.status === "completed"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {selectedAppointment?.status || "scheduled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity:</span>
                  <Badge
                    className={cn(
                      selectedAppointment?.severity === "low" && "bg-green-400",
                      selectedAppointment?.severity === "medium" &&
                        "bg-yellow-400",
                      selectedAppointment?.severity === "high" && "bg-red-400",
                      "px-2 py-1 rounded-sm capitalize hover:opacity-80 cursor-pointer"
                    )}
                  >
                    {selectedAppointment?.severity || "low"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedAppointment ? (
                <>
                  Edit Appointment for{" "}
                  {selectedAppointment.patientName || "Patient"}
                </>
              ) : (
                "Edit Appointment"
              )}
            </SheetTitle>
            <SheetDescription>
              Update notes, reschedule, or change appointment status
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Notes Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Doctor's Notes</h3>
              <Textarea
                placeholder="Enter doctor's notes here..."
                className="min-h-[150px]"
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
              />
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={updateNotesMutation.isPending}
                className="mt-2"
              >
                {updateNotesMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notes"
                )}
              </Button>
            </div>

            {/* Reschedule Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Reschedule Appointment</h3>

              <div className="grid gap-2">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="date" className="text-sm font-medium">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateValue && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateValue ? format(dateValue, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateValue || new Date()}
                        onSelect={setDateValue as any}
                        initialFocus
                        disabled={(date) =>
                          date < new Date() || // max 2 months in future
                          date > new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="time" className="text-sm font-medium">
                    Time
                  </label>
                  <Select value={timeValue} onValueChange={setTimeValue}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleReschedule}
                disabled={rescheduleAppointmentMutation.isPending || !dateValue}
                className="mt-2"
              >
                {rescheduleAppointmentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Reschedule
                  </>
                )}
              </Button>
            </div>

            {/* Status Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Update Status</h3>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusValue === "scheduled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleUpdateStatus("scheduled")}
                  disabled={updateStatusMutation.isPending}
                >
                  Scheduled
                </Button>
                <Button
                  variant="outline"
                  className="bg-amber-500 hover:bg-amber-700 text-white hover:text-white"
                  size="sm"
                  onClick={() => handleUpdateStatus("in-progress")}
                  disabled={updateStatusMutation.isPending}
                >
                  In Progress
                </Button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("completed")}
                    disabled={updateStatusMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white hover:text-white"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </Button>
                </motion.div>
                <Button
                  variant="outline"
                  className="bg-red-600 hover:bg-red-700 text-white hover:text-white"
                  size="sm"
                  onClick={() => handleUpdateStatus("cancelled")}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancelled
                </Button>
              </div>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditSheetOpen(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default DoctorAppointmentView;

import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookAppointmentSheet } from "@/modules/patient/ui/components/book-appointment-sheet";

interface MedicalRecord {
  id: string;
  diagnosis: string;
  severity: "low" | "medium" | "high" | "critical";
  recordDate: Date;
  appointment?: {
    id: string;
    date: Date;
    status: string;
  } | null;
}

interface Props {
  records?: MedicalRecord[];
}

export function AppointmentsView({ records }: Props) {
  const filteredRecords = records?.filter((record) => record.appointment);

  if (!filteredRecords?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No Appointments</h3>
        <p className="text-gray-500 mb-4">Schedule your next appointment.</p>
        <BookAppointmentSheet />
      </div>
    );
  }

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filteredRecords.map((record, index) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                <Badge className={statusColors[record.appointment?.status as keyof typeof statusColors]}>
                  {record.appointment?.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(record.appointment?.date ?? record.recordDate), "MMMM d, yyyy")}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                {format(new Date(record.appointment?.date ?? record.recordDate), "h:mm a")}
              </div>
              <div className="flex justify-end">
                <BookAppointmentSheet />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

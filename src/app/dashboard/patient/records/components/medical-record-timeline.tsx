import { format } from "date-fns";
import { motion } from "framer-motion";
import { Activity, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MedicalRecord {
  id: string;
  diagnosis: string;
  treatment: string;
  notes?: string | null;
  severity: "low" | "medium" | "high" | "critical";
  recordDate: Date;
  doctor: {
    firstName: string;
    lastName: string;
  };
}

interface Props {
  records?: MedicalRecord[];
  isLoading?: boolean;
}

export function MedicalRecordTimeline({ records, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!records?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No Medical Records</h3>
        <p className="text-gray-500">Your medical history will appear here.</p>
      </div>
    );
  }

  const severityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-8">
      {records.map((record, index) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative flex gap-4"
        >
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
              record.severity === "critical" && "bg-red-50 border-red-200",
              record.severity === "high" && "bg-orange-50 border-orange-200",
              record.severity === "medium" && "bg-yellow-50 border-yellow-200",
              record.severity === "low" && "bg-green-50 border-green-200"
            )}
          >
            <AlertCircle
              className={cn(
                "h-4 w-4",
                record.severity === "critical" && "text-red-600",
                record.severity === "high" && "text-orange-600",
                record.severity === "medium" && "text-yellow-600",
                record.severity === "low" && "text-green-600"
              )}
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{record.diagnosis}</div>
              <Badge className={severityColors[record.severity]}>
                {record.severity}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">{record.treatment}</div>
            {record.notes && (
              <div className="text-sm text-gray-500">{record.notes}</div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>
                Dr. {record.doctor.firstName} {record.doctor.lastName}
              </span>
              <span>•</span>
              <span>{format(new Date(record.recordDate), "MMM d, yyyy")}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

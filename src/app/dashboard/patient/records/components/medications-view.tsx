import { motion } from "framer-motion";
import { PillIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface MedicalRecord {
  id: string;
  diagnosis: string;
  treatment: string;
  prescription?: string | null;
  recordDate: Date;
}

interface Props {
  records?: MedicalRecord[];
}

export function MedicationsView({ records }: Props) {
  const filteredRecords = records?.filter((record) => record.prescription);

  if (!filteredRecords?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <PillIcon className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No Active Medications</h3>
        <p className="text-gray-500">Your prescribed medications will appear here.</p>
      </div>
    );
  }

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
              <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600">{record.prescription}</div>
              <div className="text-sm text-gray-500">
                Prescribed on: {format(new Date(record.recordDate), "MMM d, yyyy")}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Request Refill
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LabResult {
  id: string;
  labResults?: string | null;
  recordDate: Date;
  diagnosis: string;
}

interface Props {
  records?: LabResult[];
}

export function LabResultsView({ records }: Props) {
  const filteredRecords = records?.filter((record) => record.labResults);

  if (!filteredRecords?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No Lab Results</h3>
        <p className="text-gray-500">Your lab results will appear here.</p>
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
              <p className="text-sm text-gray-600">{record.labResults}</p>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

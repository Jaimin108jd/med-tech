// DoctorMedicalRecordsTable.tsx
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/app/trpc/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";

export const DoctorMedicalRecordsTable = () => {
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const medicalRecordsMutation = trpc.doctor.updateMedicalRecord.useMutation();
  // Fetch medical records for the doctor
  const {
    data: medicalRecords,
    isLoading,
    refetch,
  } = trpc.doctor.getMedicalRecords.useQuery();

  // Handle row click to view details
  const handleRowClick = (record: any) => {
    setSelectedRecord(record);
    setIsEditMode(false); // Reset edit mode when opening a new record
  };

  // Handle edit record
  const handleEditRecord = async (updatedData: any) => {
    try {
      await medicalRecordsMutation.mutateAsync({
        recordId: selectedRecord.id,
        ...updatedData,
      });
      toast.success("Medical record updated successfully!");
      refetch();
      setSelectedRecord(null); // Close the sheet after editing
    } catch (error) {
      console.error(error);
      toast.error("Failed to update medical record.");
    }
  };

  return (
    <div>
      {/* Medical Records Table */}
      <div className="title px-4 py-4 w-full flex flex-col justify-between items-center">
        <div className="flex w-full justify-between items-center py-1">
          <h1 className="text-lg font-bold">Medical Records</h1>
        </div>
        <Separator />
      </div>

      <div className="content px-6">
        <Table className="w-full mb-8 bg-white border border-gray-200 rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Record Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3}>Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading && !medicalRecords?.length && (
              <TableRow>
                <TableCell colSpan={3}>No medical records found.</TableCell>
              </TableRow>
            )}
            {medicalRecords?.map((record) => (
              <TableRow key={record.id} onClick={() => handleRowClick(record)}>
                <TableCell>{record.diagnosis}</TableCell>
                <TableCell>{record.treatment || "No review"}</TableCell>
                <TableCell>
                  {new Date(record.recordDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View/Edit Medical Record Sheet */}
      <Sheet
        open={!!selectedRecord}
        onOpenChange={() => setSelectedRecord(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {isEditMode ? "Edit Medical Record" : "Medical Record Details"}
            </SheetTitle>
          </SheetHeader>
          {selectedRecord && (
            <div className="space-y-4">
              {isEditMode ? (
                <EditMedicalRecordForm
                  record={selectedRecord}
                  onSave={handleEditRecord}
                  onCancel={() => setIsEditMode(false)}
                />
              ) : (
                <>
                  <p>
                    <strong>Diagnosis:</strong> {selectedRecord.diagnosis}
                  </p>
                  <p>
                    <strong>Treatment:</strong> {selectedRecord.treatment}
                  </p>
                  <p>
                    <strong>Prescription:</strong> {selectedRecord.prescription}
                  </p>
                  <p>
                    <strong>Lab Results:</strong> {selectedRecord.labResults}
                  </p>
                  <p>
                    <strong>Follow-Up Date:</strong>{" "}
                    {selectedRecord.followUpDate
                      ? new Date(
                          selectedRecord.followUpDate
                        ).toLocaleDateString()
                      : "Not set"}
                  </p>
                  <Button onClick={() => setIsEditMode(true)}>Edit</Button>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Edit Medical Record Form
const EditMedicalRecordForm = ({ record, onSave, onCancel }: any) => {
  const [treatment, setTreatment] = useState(record.treatment || "");
  const [prescription, setPrescription] = useState(record.prescription || "");
  const [labResults, setLabResults] = useState(record.labResults || "");
  const [followUpDate, setFollowUpDate] = useState(record.followUpDate || "");

  const handleSave = () => {
    onSave({
      treatment,
      prescription,
      labResults,
      followUpDate,
    });
  };

  return (
    <div className="space-y-4">
      <Input
        value={treatment}
        onChange={(e) => setTreatment(e.target.value)}
        placeholder="Treatment"
      />
      <Input
        value={prescription}
        onChange={(e) => setPrescription(e.target.value)}
        placeholder="Prescription"
      />
      <Input
        value={labResults}
        onChange={(e) => setLabResults(e.target.value)}
        placeholder="Lab Results"
      />
      <Calendar
        mode="single"
        selected={new Date(followUpDate)}
        onSelect={(date: any) => setFollowUpDate(date.toISOString())}
        initialFocus
        disabled={(date) =>
          date < new Date() || // max 2 months in future
          date > new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)
        }
      />
      <div className="flex gap-2">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DoctorMedicalRecordsTable;

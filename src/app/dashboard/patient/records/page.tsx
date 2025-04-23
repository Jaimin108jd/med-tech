"use client";
// MedicalRecordsTable.tsx
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

export const MedicalRecordsTable = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Fetch medical records
  const { data: medicalRecords, isLoading } =
    trpc.patient.getMedicalRecords.useQuery();

  // Fetch user data (e.g., blood group)
  const { data: user } = trpc.users.getUser.useQuery();

  // Handle row click to view details
  const handleRowClick = (record: any) => {
    setSelectedRecord(record);
  };

  return (
    <div>
      {/* Button to open create medical record sheet */}
      <div className="title px-4 py-4 w-full flex flex-col justify-between items-center">
        <div className="flex w-full justify-between items-center py-1">
          <h1 className="text-lg font-bold">Medical Records</h1>
          <Button onClick={() => setIsCreateSheetOpen(true)}>
            Create Medical Record
          </Button>
        </div>
        <Separator />
      </div>

      {/* Medical Records Table */}
      <div className="content px-6">
        {" "}
        <Table className="w-full mb-8 bg-white border border-gray-200 rounded-lg ">
          <TableHeader>
            <TableRow>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Record Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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

      {/* Create Medical Record Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Medical Record</SheetTitle>
          </SheetHeader>
          <CreateMedicalRecordForm
            bloodGroup={user?.bloodType}
            onClose={() => setIsCreateSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* View Medical Record Sheet */}
      <Sheet
        open={!!selectedRecord}
        onOpenChange={() => setSelectedRecord(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Medical Record Details</SheetTitle>
          </SheetHeader>
          {selectedRecord && (
            <div>
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
                <strong>Notes:</strong> {selectedRecord.notes}
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Create Medical Record Form
const CreateMedicalRecordForm = ({ bloodGroup, onClose }: any) => {
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState("low");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(
    null
  );

  const createRecordMutation = trpc.patient.createMedicalRecord.useMutation();
  const appointments = trpc.patient.getAppointments.useQuery({
    limit: 5,
    upcoming: true,
  });
  const handleSubmit = async () => {
    const appointment = appointments?.data?.find(
      (x) => x.id === selectedAppointment
    );
    if (!appointment) return toast.error("Please select a valid appointment");
    console.log(appointment);
    if (!symptoms || !severity || !appointment?.doctorId)
      return toast.error("Please fill all fields");
    await createRecordMutation.mutateAsync({
      doctorId: appointment.doctorId, // Replace with actual doctor ID
      diagnosis: symptoms, // Use symptoms as diagnosis for simplicity
      treatment: "", // Add treatment input if needed
      notes: "", // Add notes input if needed
      severity,
      bloodType: bloodGroup,
    });

    onClose();
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        placeholder="Describe your symptoms"
      />
      <Select value={severity} onValueChange={setSeverity}>
        <SelectTrigger>
          <SelectValue placeholder="Select severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      {/* // select Appointment to link */}
      <Select
        value={selectedAppointment ?? ""}
        onValueChange={setSelectedAppointment ?? ""}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Appointment" />
        </SelectTrigger>
        <SelectContent>
          {appointments.data?.map((appointment) => (
            <SelectItem key={appointment.id} value={appointment.id}>
              {new Date(appointment.date).toLocaleDateString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p>
        <strong>Blood Group:</strong> {bloodGroup}
      </p>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
};

export default MedicalRecordsTable;

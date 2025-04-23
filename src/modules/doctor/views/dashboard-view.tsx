// src/app/doctor/dashboard/page.tsx
"use client";
import { trpc } from "@/app/trpc/client";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Activity, ArrowRight } from "lucide-react";
function extractInfo(inputString: string) {
  console.log(inputString);
  // Define a regex pattern to match the fields
  const pattern =
    /name: ;START; (.*?) ;ENDLINE; probability: ;START; (.*?) ;ENDLINE; description: ;START; (.*?) ;ENDLINE; suggestedAction: (.*?) ;ENDLINE;/;

  // Use the regex to extract the fields
  const match = inputString.match(pattern);

  if (!match) {
    return null;
  }

  // Extract and return the fields
  return {
    name: match[1].trim(),
    probability: parseFloat(match[2].trim()),
    description: match[3].trim(),
    suggestedAction: match[4].trim(),
  };
}
export function DoctorDashboardView() {
  const { userId } = useAuth();

  // Fetch upcoming appointments
  const { data: appointments, isLoading: appointmentsLoading } =
    trpc.doctor.getUpcomingAppointments.useQuery({ limit: 5 });

  // Fetch patient summaries
  const { data: patientSummaries, isLoading: summariesLoading } =
    trpc.doctor.getPatientSummaries.useQuery({ limit: 5 });

  if (appointmentsLoading || summariesLoading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <Skeleton className="h-8 w-48 mb-6 bg-blue-200" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-blue-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-blue-900"
      >
        Doctor Dashboard
      </motion.h1>

      {/* Upcoming Appointments */}
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-800">
          <Calendar className="h-5 w-5 text-blue-500" /> Upcoming Appointments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments?.map((appointment) => (
            <motion.div
              key={appointment.id}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">
                    {appointment.patientName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800">
                  <p>
                    <strong>Date:</strong> {appointment.date.toLocaleString()}
                  </p>
                  <p>
                    <strong>Severity:</strong> {appointment.severity}
                  </p>
                  <p>
                    <strong>AI Summary:</strong> {(extractInfo(appointment.aiSummary || "")?.description) || "N/A"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="text-blue-500 border-blue-500"
                  >
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Patient Summaries */}
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-800">
          <Activity className="h-5 w-5 text-blue-500" /> Patient Summaries
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patientSummaries?.map((summary) => (
            <motion.div
              key={summary.id}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">
                    {summary.patientName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800">
                  <p>
                    <strong>Symptoms:</strong> {summary.symptoms}
                  </p>
                  <p>
                    <strong>Severity Score:</strong> {summary.severityScore}
                  </p>
                  <p>
                    <strong>Disease Summary:</strong> {summary.diseaseSummary}
                  </p>
                  <p>
                    <strong>Suggested Medications:</strong>{" "}
                    {summary.suggestedMedications}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="text-blue-500 border-blue-500"
                  >
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
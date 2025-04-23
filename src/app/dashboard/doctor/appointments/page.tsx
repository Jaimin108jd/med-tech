import { trpc } from "@/app/trpc/server";
import { Separator } from "@/components/ui/separator";
import DoctorAppointmentView from "@/modules/doctor/views/appointment-view";
import React from "react";

const DoctorAppointmentPage = () => {
  trpc.doctor.getUpcomingAppointments.prefetch({ limit: 10 });

  return (
    <div className="px-4 ">
      <div className="title py-4">
        <h1 className="text-2xl font-bold mb-4">All Appointments</h1>
        <Separator />
      </div>
      <DoctorAppointmentView />
    </div>
  );
};

export default DoctorAppointmentPage;

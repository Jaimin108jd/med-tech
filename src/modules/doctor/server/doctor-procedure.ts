// src/server/api/routers/doctor.ts
import { z } from "zod";
import { db } from "@/db";
import {
  appointments,
  aiAnalysis,
  users,
  payments,
  medicalRecords,
} from "@/db/schema";
import { and, eq, desc, inArray } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { TRPCError } from "@trpc/server";

export const doctorRouter = createTRPCRouter({
  // Fetch upcoming appointments for the doctor
  getUpcomingAppointments: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const clerkId = ctx.clerkUserId as string;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkId));
        const userId = user.id;
        const appointmentsData = await db
          .select({
            id: appointments.id,
            patientName: users.firstName,
            date: appointments.date,
            status: appointments.status,
            severity: appointments.severity,
            notes: appointments.notes,
            doctorNotes: appointments.doctorNotes,
            aiSummary: appointments.aiSummary,
          })
          .from(appointments)
          .leftJoin(users, eq(appointments.patientId, users.id))
          .where(
            and(
              eq(appointments.doctorId, userId) // Use doctorId from appointments
            )
          )
          .orderBy(desc(appointments.date))
          .limit(input.limit || 10);

        return appointmentsData;
      } catch (error: any) {
        console.error(`Error fetching upcoming appointments: ${error.message}`);
        return [];
      }
    }),
  updateAppointmentNotes: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        notes: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(appointments)
        .set({ doctorNotes: input.notes })
        .where(eq(appointments.id, input.appointmentId));
    }),
  rescheduleAppointment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        date: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(appointments)
        .set({ date: input.date })
        .where(eq(appointments.id, input.appointmentId));
    }),
  updateAppointmentStatus: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        status: z.enum([
          "scheduled",
          "completed",
          "canceled",
          "rescheduled",
          "in-progress",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(appointments)
        .set({ status: input.status })
        .where(eq(appointments.id, input.appointmentId));
    }),
  getPayments: protectedProcedure.query(async ({ ctx }) => {
    const clerkUserId = ctx.clerkUserId as string;

    // Fetch the user based on the clerkUserId
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId));

    const userId = user.id;

    // Select all payments for the patient
    const patientPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.status, "completed"));

    // Extract the patientIds from the payments
    const patientIds = patientPayments.map((payment) => payment.patientId);

    // Select all appointments where the doctorId matches the userId (doctor's ID)
    // and the patientId matches the patientId from the payments
    const appointmentsForPayments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, userId),
          inArray(appointments.patientId, patientIds)
        )
      );

    return {
      payments: patientPayments,
      appointments: appointmentsForPayments,
    };
  }),
  getMedicalRecords: protectedProcedure.query(async ({ ctx }) => {
    const clerkId = ctx.clerkUserId as string;
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    const userId = user.id;
    const records = await db
      .select({
        id: medicalRecords.id,
        diagnosis: medicalRecords.diagnosis,
        treatment: medicalRecords.treatment,
        prescription: medicalRecords.prescription,
        labResults: medicalRecords.labResults,
        followUpDate: medicalRecords.followUpDate,
        recordDate: medicalRecords.recordDate,
      })
      .from(medicalRecords)
      .where(eq(medicalRecords.doctorId, userId))
      .orderBy(desc(medicalRecords.recordDate));

    return records;
  }),
  // doctor-router.ts
  updateMedicalRecord: protectedProcedure
    .input(
      z.object({
        recordId: z.string(),
        treatment: z.string().optional(),
        prescription: z.string().optional(),
        labResults: z.string().optional(),
        followUpDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.clerkUserId as string;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);
      const userId = user.id;

      const updatedRecord = await db
        .update(medicalRecords)
        .set({
          treatment: input.treatment,
          prescription: input.prescription,
          labResults: input.labResults,
          followUpDate: input.followUpDate
            ? new Date(input.followUpDate)
            : null,
        })
        .where(
          and(
            eq(medicalRecords.id, input.recordId),
            eq(medicalRecords.doctorId, userId)
          )
        )
        .returning();

      if (!updatedRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Medical record not found",
        });
      }

      return updatedRecord;
    }),
  // Fetch AI analysis summaries for the doctor's patients
  getPatientSummaries: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const { clerkId: userId } = ctx.user;

      const summaries = await db
        .select({
          id: aiAnalysis.id,
          patientName: users.firstName,
          symptoms: aiAnalysis.symptoms,
          severityScore: aiAnalysis.severityScore,
          diseaseSummary: aiAnalysis.diseaseSummary,
          suggestedMedications: aiAnalysis.suggestedMedications,
          createdAt: aiAnalysis.createdAt,
        })
        .from(aiAnalysis)
        .leftJoin(users, eq(aiAnalysis.patientId, users.id))
        .leftJoin(
          appointments,
          eq(aiAnalysis.patientId, appointments.patientId)
        )
        .where(
          and(
            eq(appointments.doctorId, userId) // Use doctorId from appointments
          )
        )
        .orderBy(desc(aiAnalysis.createdAt))
        .limit(input.limit || 5);

      return summaries;
    }),
});

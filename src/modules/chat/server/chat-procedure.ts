import { z } from "zod";
import { chatRooms, chatMessages, users, appointments } from "@/db/schema";
import { and, eq, desc, or, asc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { db } from "@/db";
import { pusher } from "@/lib/pusher";
import { alias } from "drizzle-orm/pg-core";

export const chatRouter = createTRPCRouter({
  // Get chat rooms for a user (doctor or patient)
  getChatRooms: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      try {
        // Create aliases for the users table
        const doctor = alias(users, "doctor");
        const patient = alias(users, "patient");
        const appt = alias(appointments, "appointment");

        // Fetch the current user's details
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, input.userId))
          .limit(1);

        if (!user) {
          throw new Error(
            "User not found or access denied: [Chat Rooms]" + input.userId
          );
        }

        let rooms;

        if (user.role === "doctor") {
          // Fetch chat rooms for the doctor including all patients with appointments
          rooms = await db
            .select({
              room: chatRooms,
              appointment: {
                id: appt.id,
                date: appt.date,
                status: appt.status,
              },
              doctor: {
                id: doctor.id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                imageUrl: doctor.imageUrl,
              },
              patient: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                imageUrl: patient.imageUrl,
                phone: patient.phone,
                email: patient.email,
              },
            })
            .from(chatRooms)
            .leftJoin(doctor, eq(chatRooms.doctorId, doctor.id))
            .leftJoin(patient, eq(chatRooms.patientId, patient.id))
            .leftJoin(appt, eq(chatRooms.appointmentId, appt.id))
            .where(eq(chatRooms.doctorId, user.id))
            .orderBy(desc(chatRooms.updatedAt));
        } else if (user.role === "patient") {
          // Fetch chat rooms for the patient including all doctors they have appointments with
          rooms = await db
            .select({
              room: chatRooms,
              appointment: {
                id: appt.id,
                date: appt.date,
                status: appt.status,
              },
              doctor: {
                id: doctor.id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                imageUrl: doctor.imageUrl,
                specialization: doctor.specialization,
                yearsOfExperience: doctor.yearsOfExperience,
              },
              patient: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                imageUrl: patient.imageUrl,
              },
            })
            .from(chatRooms)
            .leftJoin(doctor, eq(chatRooms.doctorId, doctor.id))
            .leftJoin(patient, eq(chatRooms.patientId, patient.id))
            .leftJoin(appt, eq(chatRooms.appointmentId, appt.id))
            .where(eq(chatRooms.patientId, user.id))
            .orderBy(desc(chatRooms.updatedAt));
        } else {
          throw new Error("User role not supported for chat rooms");
        }

        // Transform the result to match the expected format
        return rooms.map(({ room, doctor, patient, appointment }) => ({
          ...room,
          doctor,
          patient,
          appointment,
          lastActive: room.updatedAt,
        }));
      } catch (error: any) {
        console.error(error);
        console.log(error.stack);
        throw new Error("Failed to get chat rooms");
      }
    }),

  // Get messages for a specific chat room
  getMessages: protectedProcedure
    .input(z.object({ chatRoomId: z.string() }))
    .query(async ({ input }) => {
      try {
        const messages = await db
          .select({
            message: chatMessages,
            sender: {
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              imageUrl: users.imageUrl,
              role: users.role,
            },
          })
          .from(chatMessages)
          .leftJoin(users, eq(chatMessages.senderId, users.id))
          .where(eq(chatMessages.chatRoomId, input.chatRoomId))
          .orderBy(asc(chatMessages.createdAt));

        // Mark chat room as updated when fetching messages
        await db
          .update(chatRooms)
          .set({ updatedAt: new Date() })
          .where(eq(chatRooms.id, input.chatRoomId));

        // Transform the result to match the expected format
        return messages.map(({ message, sender }) => ({
          ...message,
          sender,
          timestamp: message.createdAt,
        }));
      } catch (error: any) {
        console.error(error);
        console.log(error.stack);
        throw new Error("Failed to get messages");
      }
    }),

  // Send a message in a chat room
  sendMessage: protectedProcedure
    .input(
      z.object({
        chatRoomId: z.string(),
        senderId: z.string(),
        content: z.string().optional(),
        type: z.enum(["text", "image", "document", "emoji"]).default("text"),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify the chat room exists and user has access
        const chatRoom = await db
          .select()
          .from(chatRooms)
          .where(eq(chatRooms.id, input.chatRoomId))
          .limit(1);

        if (!chatRoom.length) {
          throw new Error("Chat room not found");
        }
        const [user] = await db.select().from(users).where(eq(users.clerkId, input.senderId)).limit(1);
        // Create the message
        const [message] = await db
          .insert(chatMessages)
          .values({
            chatRoomId: input.chatRoomId,
            senderId: user.id,
            content: input.content,
            type: input.type,
            fileUrl: input.fileUrl,
          })
          .returning();

        // Update the chat room's updatedAt timestamp
        await db
          .update(chatRooms)
          .set({ updatedAt: new Date() })
          .where(eq(chatRooms.id, input.chatRoomId));

        // Get sender information
        const [sender] = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            imageUrl: users.imageUrl,
            role: users.role,
          })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        // Trigger realtime update through Pusher
        await pusher.trigger(`chat-room-${input.chatRoomId}`, "new-message", {
          ...message,
          sender,
          timestamp: message.createdAt,
        });

        return {
          ...message,
          sender,
          timestamp: message.createdAt,
        };
      } catch (error: any) {
        console.error(error);
        console.log(error.stack);
        throw new Error("Failed to send message");
      }
    }),

  // Update user presence status
  updateUserPresence: protectedProcedure
    .input(
      z.object({ userId: z.string(), status: z.enum(["online", "offline"]) })
    )
    .mutation(async ({ input }) => {
      try {
        // Get user details
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, input.userId))
          .limit(1);

        if (!user) {
          throw new Error("User not found");
        }

        // Broadcast presence update to relevant channels
        await pusher.trigger(`presence-${input.userId}`, "user-status", {
          userId: input.userId,
          status: input.status,
          timestamp: new Date(),
        });
        console.log(`User presence updated: ${user.firstName} - ${input.status}`);

        return { success: true };
      } catch (error: any) {
        console.error(error);
        console.log(error.stack);
        throw new Error("Failed to update user presence");
      }
    }),
});

import { z } from "zod"
import { eq } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "../init";
import { specializations, users } from "@/db/schema";
import { db } from "@/db";

export const userRouter = createTRPCRouter({
    getUser: protectedProcedure.query(async ({ ctx }) => {
        const user = await db.select().from(users).where(eq(users.id, ctx.user.uid as string));

        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            })
        }

        return user ? user[0] : null;
    }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                role: z.enum(["admin", "patient", "doctor", "unlisted"]),
                dob: z.date(),
                gender: z.enum(["male", "female", "other"]),
                specialization: z.string().optional(), // Make specialization optional
            }),
        )
        .mutation(async ({ ctx, input }) => {
            console.log("Updating user profile", ctx.user.uid, input)
            try {
                if (input.specialization && !isValidUUID(input.specialization)) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Invalid specialization ID",
                    });
                }
                await db
                    .update(users)
                    .set({
                        role: input.role,
                        dob: input.dob,
                        gender: input.gender,
                        specialization: input.specialization?.length ? input.specialization : undefined, // Handle optional specialization
                    })
                    .where(eq(users.id, ctx.user.uid)) // Remove the 'as string' cast if ctx.user.uid is already a string
            } catch (error: any) {
                console.error("Error updating user profile", error.stack)
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error updating user profile",
                })
            }

            return { success: true }
        }),
})

function isValidUUID(specialization: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(specialization);
}


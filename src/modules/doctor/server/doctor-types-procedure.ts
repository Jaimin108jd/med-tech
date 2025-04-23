import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { db } from "@/db";
import { specializations, users } from "@/db/schema";
import { add } from "date-fns";
import { eq } from "drizzle-orm";
import { z } from "zod";
export const doctorType = createTRPCRouter({
    getDoctorTypes: baseProcedure.query(async ({ }) => {
        const doctorTypes = await db.select().from(specializations);
        return doctorTypes;
    }),
    addDoctorType: protectedProcedure.input(z.object({
        name: z.string(),
        description: z.string(),
    })).mutation(async ({ input }) => {
        try {
            await db.insert(specializations).values(input);
            return { success: true };
        } catch (error: any) {
            console.error(`Error adding doctor type: ${error}\n${error.stack}`);
            return { success: false, error: "Something went wrong" };
        }
    }),
});
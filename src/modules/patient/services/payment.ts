import { db } from "@/db";
import { users, subscriptions, payments } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";

export async function checkPaymentStatus(clerkId: string) {
  // Get user ID from clerk ID
  const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (!user.length) {
    return { hasActivePayment: false, paymentType: null }; // Consistent return type
  }

  const userId = user[0].id;
  const now = new Date();

  // Check for active subscription
  const activeSubscription = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.patientId, userId),
        eq(subscriptions.status, "active"),
        gte(subscriptions.endDate, now)
      )
    )
    .limit(1);

  if (activeSubscription.length) {
    return { hasActivePayment: true, paymentType: "subscription" };
  }

  // Check for successful single payment
  const singlePayment = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.patientId, userId),
        eq(payments.paymentType, "single"),
        eq(payments.status, "completed")
      )
    )
    .limit(1);

  if (singlePayment.length) {
    return { hasActivePayment: true, paymentType: "single" };
  }

  return { hasActivePayment: false, paymentType: null }; // Consistent return type
}
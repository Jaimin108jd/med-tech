import { z } from "zod";
import { db } from "@/db";
import { payments, subscriptions, subscriptionPlans, users, appointments } from "@/db/schema";
import { eq, and, gte, count, isNull, gt, isNotNull, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from 'uuid';

export const paymentRouter = createTRPCRouter({
  // Get all subscription plans
  getSubscriptionPlans: protectedProcedure.query(async () => {
    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
    return plans;
  }),

  // Get user's active subscription
  getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
    const clerkId = ctx.clerkUserId || "";
    const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (!user.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    const userId = user[0].id;
    const now = new Date();
    const activeSubscription = await db
      .select({
        subscription: subscriptions,
        plan: subscriptionPlans,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(subscriptions.patientId, userId),
          eq(subscriptions.status, "active"),
          gte(subscriptions.endDate, now)
        )
      )
      .limit(1);
    return activeSubscription.length ? activeSubscription[0] : null;
  }),

  // Create a payment order for single payment
  createSinglePaymentOrder: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
        notes: z.string().optional(),
        paymentMethod: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.clerkUserId || "";
      const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!user.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const userId = user[0].id;
      const receipt = `single_${uuidv4().substring(0, 32)}`; // Ensure total length is within 40 characters
      const razorpayResponse = await createRazorpayOrder({
        amount: input.amount * 100, // Convert to paise
        receipt,
        notes: {
          paymentType: "single",
          userId,
          notes: input.notes || "",
        },
      });
      if (!razorpayResponse.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment order",
        });
      }
      if (!razorpayResponse.order) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment order",
        });
      }
      const paymentRecord = await db
        .insert(payments)
        .values({
          patientId: userId,
          amount: input.amount * 100, // Store in paise
          paymentMethod: razorpayResponse.order.method ?? input.paymentMethod ?? "razorpay",
          paymentType: "single",
          status: "pending",
          razorpayOrderId: razorpayResponse.order.id,
          notes: input.notes,
        })
        .returning();
      return {
        paymentId: paymentRecord[0].id,
        razorpayOrderId: razorpayResponse.order.id,
        amount: input.amount * 100, // Return in paise for Razorpay
        currency: "INR",
      };
    }),

  // Create a payment order for subscription
  createSubscriptionOrder: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.clerkUserId || "";
      const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!user.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const userId = user[0].id;
      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, input.planId))
        .limit(1);
      if (!plan.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription plan not found",
        });
      }
      const receipt = `subscription_${uuidv4()}`;
      const razorpayResponse = await createRazorpayOrder({
        amount: plan[0].price, // Already in paise
        receipt,
        notes: {
          paymentType: "subscription",
          userId,
          planId: input.planId,
          notes: input.notes || "",
        },
      });
      if (!razorpayResponse.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment order",
        });
      }
      if (!razorpayResponse.order) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment order",
        });
      }
      const paymentRecord = await db
        .insert(payments)
        .values({
          patientId: userId,
          amount: plan[0].price,
          paymentMethod: razorpayResponse.order.method  ?? "razorpay",
          paymentType: "subscription",
          subscriptionPlanId: input.planId,
          status: "pending",
          razorpayOrderId: razorpayResponse.order.id,
          notes: input.notes,
        })
        .returning();
      return {
        paymentId: paymentRecord[0].id,
        razorpayOrderId: razorpayResponse.order.id,
        amount: plan[0].price,
        currency: "INR",
        planName: plan[0].name,
      };
    }),

  // Verify payment and update records
  verifyPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        razorpayPaymentId: z.string(),
        razorpayOrderId: z.string(),
        razorpaySignature: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.clerkUserId || "";
      const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!user.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const userId = user[0].id;
      const verification = verifyRazorpayPayment({
        orderId: input.razorpayOrderId,
        paymentId: input.razorpayPaymentId,
        signature: input.razorpaySignature,
      });
      if (!verification.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid payment signature",
        });
      }
      const paymentRecord = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.id, input.paymentId),
            eq(payments.patientId, userId),
            eq(payments.razorpayOrderId, input.razorpayOrderId)
          )
        )
        .limit(1);
      if (!paymentRecord.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment record not found",
        });
      }
      await db
        .update(payments)
        .set({
          status: "completed",
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, input.paymentId));
      if (paymentRecord[0].paymentType === "subscription" && paymentRecord[0].subscriptionPlanId) {
        const plan = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, paymentRecord[0].subscriptionPlanId))
          .limit(1);
        if (!plan.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subscription plan not found",
          });
        }
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan[0].durationDays);
        const subscription = await db
          .insert(subscriptions)
          .values({
            patientId: userId,
            planId: paymentRecord[0].subscriptionPlanId,
            startDate,
            endDate,
            status: "active",
          })
          .returning();
        await db
          .update(payments)
          .set({
            subscriptionId: subscription[0].id,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, input.paymentId));
        return {
          success: true,
          paymentType: "subscription",
          subscription: subscription[0],
        };
      }
      return {
        success: true,
        paymentType: "single",
      };
    }),

  checkPaymentStatus: protectedProcedure.query(async ({ ctx }) => {
    const clerkId = ctx.clerkUserId || "";
    const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (!user.length) {
      return {
        hasActivePayment: false,
        remainingAppointments: 0,
      };
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
      return {
        hasActivePayment: true,
        paymentType: "subscription",
        subscription: activeSubscription[0],
        remainingAppointments: Infinity, // Unlimited appointments for subscription
      };
    }

    // Check for single payments with remaining appointments
    const unusedSinglePayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.patientId, userId),
          eq(payments.paymentType, "single"),
          eq(payments.status, "completed"),
          gt(payments.remainingAppointments, 0) // This replaces validPayments check
        )
      );

    return {
      hasActivePayment: unusedSinglePayments.length > 0,
      paymentType: "single",
      payments: unusedSinglePayments,
      remainingAppointments: unusedSinglePayments.reduce((sum, payment) => sum + (payment.remainingAppointments ?? 0), 0),
    };
  }),

  canBookAppointment: protectedProcedure.query(async ({ ctx }) => {
    try {
      const clerkId = ctx.clerkUserId || "";
      const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!user.length) {
        return {
          canBook: false,
          message: "User not found",
        };
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
        return {
          canBook: true,
          paymentType: "subscription",
          message: "You have an active subscription",
        };
      }

      // Check for single payments with remaining appointments
      const unusedSinglePayments = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.patientId, userId),
            eq(payments.paymentType, "single"),
            eq(payments.status, "completed"),
            gt(payments.remainingAppointments, 0) // This replaces validPayments check
          )
        );

      const remainingAppointments = unusedSinglePayments.reduce((sum, payment) => sum + (payment.remainingAppointments ?? 0), 0);

      return {
        canBook: remainingAppointments > 0,
        paymentType: "single",
        remainingAppointments,
        message: remainingAppointments > 0
          ? `You can book ${remainingAppointments} more appointment(s)`
          : "You need to make a payment to book an appointment",
      };
    } catch (error: any) {
      console.error("Can book appointment error:", error);
      console.error(error.stack);
      return {
        canBook: false,
        message: error.message,
      };
    }
  }),
});
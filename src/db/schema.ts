import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Existing Enums
export const userRole = pgEnum("user_role", [
  "admin",
  "patient",
  "doctor",
  "unlisted",
]);
export const userGender = pgEnum("user_gender", ["male", "female", "other"]);
export const appointmentStatus = pgEnum("appointment_status", [
  "scheduled",
  "completed",
  "canceled",
  "rescheduled",
  "in-progress",
]);
export const severityLevel = pgEnum("severity_level", [
  "low",
  "medium",
  "high",
  "critical",
]);
export const bloodType = pgEnum("blood_type", [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

// New Payment Related Enums
export const paymentType = pgEnum("payment_type", ["single", "subscription"]);
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "canceled",
  "expired",
  "trial",
]);

// Existing Tables
export const specializations = pgTable(
  "specializations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("name_idx").on(table.name)]
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    imageUrl: text("image_url"),
    role: userRole().notNull().default("unlisted"),
    email: text("email").unique().notNull(),
    phone: text("phone").notNull(),
    dob: timestamp("dob"),
    gender: userGender(),
    specialization: uuid("specialization_id").references(
      () => specializations.id,
      {
        onDelete: "set null",
      }
    ),
    bloodType: bloodType(),
    insuranceInfo: text("insurance_info"),
    additionalInfo: text("additional_info"),
    verified: boolean("verified").notNull().default(false), // verification status for doctors(patients are auto-verified)
    notes: text("notes"), // for condtions and background info
    yearsOfExperience: integer("years_of_experience"),
    medicalLicenseNumber: text("medical_license_number"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("clerkid_idx").on(table.clerkId)]
);

export const patientProfiles = pgTable("patient_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  bloodType: text("blood_type"),
  emergencyContact: text("emergency_contact"),
  insuranceInfo: text("insurance_info"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").default("Appointment"),
  paymentId: uuid("payment_id"), // Change to uuid type
  patientId: uuid("patient_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  doctorId: uuid("doctor_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  date: timestamp("date").notNull(),
  status: appointmentStatus().notNull().default("scheduled"),
  notes: text("notes"),
  doctorNotes: text("doctor_notes"),
  severity: severityLevel().notNull().default("low"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const medicalRecords = pgTable("medical_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  doctorId: uuid("doctor_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment").notNull(),
  notes: text("notes"),
  severity: text("severity").notNull().default("low"),
  bloodType: text("blood_type"),
  prescription: text("prescription"),
  labResults: text("lab_results"),
  followUpDate: timestamp("follow_up_date"),
  recordDate: timestamp("record_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  medicalRecordId: uuid("medical_record_id")
    .references(() => medicalRecords.id, { onDelete: "cascade" })
    .notNull(),
  medication: text("medication").notNull(),
  dosage: text("dosage").notNull(),
  instructions: text("instructions"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiAnalysis = pgTable("ai_analysis", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  symptoms: text("symptoms").notNull(),
  severityScore: integer("severity_score").notNull(),
  diseaseSummary: text("disease_summary").notNull(),
  suggestedMedications: text("suggested_medications").notNull(),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  durationDays: integer("duration_days").notNull(), // 7, 30, 90, 180 days
  price: integer("price").notNull(), // in cents/paise
  features: text("features").notNull(), // JSON string of features
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Subscriptions Table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  planId: uuid("plan_id")
    .references(() => subscriptionPlans.id, { onDelete: "cascade" })
    .notNull(),
  status: subscriptionStatus().notNull().default("active"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").notNull().default(true),
  canceledAt: timestamp("canceled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Modified Payments Table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull(),
  amount: integer("amount").notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  paymentType: varchar("payment_type").notNull(),
  status: varchar("status").notNull(),
  razorpayOrderId: varchar("razorpay_order_id").notNull(),
  razorpayPaymentId: varchar("razorpay_payment_id"),
  razorpaySignature: varchar("razorpay_signature"),
  subscriptionPlanId: varchar("subscription_plan_id"),
  subscriptionId: varchar("subscription_id"),
  notes: text("notes"),
  remainingAppointments: integer("remaining_appointments").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// chat system:
export const chatRooms = pgTable("chat_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id")
    .references(() => appointments.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  patientId: uuid("patient_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  doctorId: uuid("doctor_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const message_type = pgEnum("message_type", [
  "text",
  "image",
  "document",
  "emoji",
]);
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatRoomId: uuid("chat_room_id")
    .references(() => chatRooms.id, { onDelete: "cascade" })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content"), // Text content of the message
  type: message_type().notNull().default("text"), // Use the enum here
  fileUrl: text("file_url"), // URL for uploaded files (images/documents)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatRoomRelations = relations(chatRooms, ({ one, many }) => ({
  appointment: one(appointments, {
    fields: [chatRooms.appointmentId],
    references: [appointments.id],
  }),
  patient: one(users, {
    fields: [chatRooms.patientId],
    references: [users.id],
  }),
  doctor: one(users, {
    fields: [chatRooms.doctorId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  chatRoom: one(chatRooms, {
    fields: [chatMessages.chatRoomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

// Relationships
export const userRelations = relations(users, ({ one, many }) => ({
  specializations: one(specializations),
  patientProfile: one(patientProfiles),
  doctorAppointments: many(appointments, {
    relationName: "doctor_appointments",
  }),
  patientAppointments: many(appointments, {
    relationName: "patient_appointments",
  }),
  medicalRecords: many(medicalRecords),
  aiAnalysis: many(aiAnalysis),
  payments: many(payments),
  subscriptions: many(subscriptions), // New relation
}));

export const patientProfileRelations = relations(
  patientProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [patientProfiles.userId],
      references: [users.id],
    }),
  })
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
    relationName: "patient_appointments",
  }),
  doctor: one(users, {
    fields: [appointments.doctorId],
    references: [users.id],
    relationName: "doctor_appointments",
  }),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  patient: one(users, {
    fields: [medicalRecords.patientId],
    references: [users.id],
  }),
  doctor: one(users, {
    fields: [medicalRecords.doctorId],
    references: [users.id],
  }),
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  medicalRecord: one(medicalRecords, {
    fields: [prescriptions.medicalRecordId],
    references: [medicalRecords.id],
  }),
}));

export const aiAnalysisRelations = relations(aiAnalysis, ({ one }) => ({
  patient: one(users, {
    fields: [aiAnalysis.patientId],
    references: [users.id],
  }),
}));

// New Payment Related Relations
export const subscriptionPlanRelations = relations(
  subscriptionPlans,
  ({ many }) => ({
    subscriptions: many(subscriptions),
    payments: many(payments),
  })
);

export const subscriptionRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    patient: one(users, {
      fields: [subscriptions.patientId],
      references: [users.id],
    }),
    plan: one(subscriptionPlans, {
      fields: [subscriptions.planId],
      references: [subscriptionPlans.id],
    }),
    payments: many(payments),
  })
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  patient: one(users, {
    fields: [payments.patientId],
    references: [users.id],
  }),
  subscriptionPlan: one(subscriptionPlans, {
    fields: [payments.subscriptionPlanId],
    references: [subscriptionPlans.id],
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));

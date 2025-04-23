"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "../trpc/client";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorBoundary } from "react-error-boundary";
import { FallbackProps } from "react-error-boundary";
import { Lexend_Giga } from "next/font/google";

const formSchema = z
  .object({
    role: z.enum(["patient", "doctor"]),
    gender: z.enum(["male", "female", "other"]),
    dob: z.date(),
    bloodType: z.any(),
    insuranceInfo: z.string().optional(),
    notes: z.string().optional(),
    specialization: z.string().optional(),
  })
  .refine(
    (data) => {
      // If role is patient, bloodType is required
      if (data.role === "patient") {
        return !!data.bloodType;
      }
      // If role is doctor, specialization is required
      if (data.role === "doctor") {
        return !!data.specialization;
      }
      return true;
    },
    {
      message: "Required field missing for selected role",
      path: ["role"], // This will highlight the role field when validation fails
    }
  );
const lxgiga = Lexend_Giga({
  subsets: ["latin", "latin-ext", "vietnamese"],
});

export default function NewPatientProfile() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [userData] = trpc.users.getUser.useSuspenseQuery();
  const [specializations] = trpc.doctorType.getDoctorTypes.useSuspenseQuery();
  const [Role, setRole] = useState<"patient" | "doctor" | "unlisted">(
    "unlisted"
  );

  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      window.location.href = `/dashboard/${form.getValues("role")}`;
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "patient",
      gender: "male", // Add a default gender
      dob: new Date(), // Add a default date
      bloodType: undefined, // This will be validated on submission if role is patient
      insuranceInfo: "",
      notes: "",
      specialization: undefined, // This will be validated on submission if role is doctor
    },
  });

  useEffect(() => {
    if (userData?.role !== "unlisted") {
      window.location.href = `/dashboard/${userData?.role}`;
    }
    if (userData?.role === "unlisted") {
      setIsLoading(false);
    }
    if (userData) {
      const initialRole = userData.role as "patient" | "doctor";
      setRole(initialRole); // Set the Role state to match the form

      form.reset({
        role: initialRole,
        gender: userData.gender as "male" | "female" | "other",
        dob: userData.dob ? new Date(userData.dob) : undefined,
        bloodType: userData.bloodType as
          | "A+"
          | "A-"
          | "B+"
          | "B-"
          | "AB+"
          | "AB-"
          | "O+"
          | "O-",
        insuranceInfo: (userData.insuranceInfo as string) ?? "",
        notes: (userData.notes as string) ?? "",
        specialization: (userData.specialization as string) ?? "",
      });
    } else {
      // If no userData, set the Role to match the default form value
      setRole("patient");
    }
  }, [userData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // Add validation for the conditional fields based on role
      if (values.role === "patient" && !values.bloodType) {
        toast.error("Please select a blood type");
        setIsSubmitting(false);
        return;
      }

      if (values.role === "doctor" && !values.specialization) {
        toast.error("Please select a specialization");
        setIsSubmitting(false);
        return;
      }

      // Submit the form
      await updateProfile.mutateAsync(values);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to update profile. Please try again.");
      setIsSubmitting(false);
      throw error; // Re-throw the error to trigger the ErrorBoundary
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-8">
          <div className="🤚">
            <div className="👉"></div>
            <div className="👉"></div>
            <div className="👉"></div>
            <div className="👉"></div>
            <div className="🌴"></div>
            <div className="👍"></div>
          </div>
          <p className={cn("text-3xl", lxgiga.className)}>Please wait while we checking....</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Profile
          </h1>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Form validation errors:", errors);
                if (errors.specialization) {
                  toast.error("Specialization is required for doctors");
                }
                if (errors.bloodType) {
                  toast.error("Blood type is required for patients");
                }
              })}
              className="space-y-8"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Role Selection</CardTitle>
                      <CardDescription>
                        Choose your role in the healthcare system.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>I am a</FormLabel>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val);
                                setRole(val as "patient" | "doctor");
                                console.log("Role changed to:", val);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {Role === "patient" && (
                        <FormField
                          control={form.control}
                          name="bloodType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Type</FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  console.log("Selected blood type:", val); // Debugging
                                  field.onChange(val);
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="A+">A+</SelectItem>
                                  <SelectItem value="A-">A-</SelectItem>
                                  <SelectItem value="B+">B+</SelectItem>
                                  <SelectItem value="B-">B-</SelectItem>
                                  <SelectItem value="AB+">AB+</SelectItem>
                                  <SelectItem value="AB-">AB-</SelectItem>
                                  <SelectItem value="O+">O+</SelectItem>
                                  <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {Role === "doctor" && (
                        <FormField
                          control={form.control}
                          name="specialization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specialization</FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  console.log("Selected specialization:", val);
                                  field.onChange(val);
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select specialization" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {specializations.map((specialization) => (
                                    <SelectItem
                                      key={specialization.id}
                                      value={specialization.id}
                                    >
                                      {specialization.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={(field.value as Date) || new Date()}
                                onChange={(date) => field.onChange(date)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                      <CardDescription>
                        Provide any relevant medical information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="insuranceInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Information</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Insurance provider, policy number, etc."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any relevant medical history or conditions"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Saving...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save className="mr-2 h-4 w-4" />
                            Complete Profile
                          </div>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </>
  );
}

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="p-4 bg-red-100 border border-red-400 text-red-700 rounded"
    >
      <p>Something went wrong:</p>
      <pre className="mt-2">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  );
}

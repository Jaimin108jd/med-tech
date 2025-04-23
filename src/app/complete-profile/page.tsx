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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Save,
  User,
  UserRound,
  ClipboardList,
  FileText,
} from "lucide-react";
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
    additionalInfo: z.string().optional(),
    yearsOfExperience: z.number().optional(),
    medicalLicenseNumber: z.string().optional(),
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
      path: ["role"],
    }
  );

const lxgiga = Lexend_Giga({
  subsets: ["latin", "latin-ext", "vietnamese"],
});

// Steps component
const Steps = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
              currentStep > index
                ? "bg-blue-600 text-white"
                : currentStep === index
                ? "bg-blue-100 border-2 border-blue-600 text-blue-600"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {currentStep > index ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={cn(
                "w-20 h-1 transition-all duration-200",
                currentStep > index ? "bg-blue-600" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default function NewPatientProfile() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const totalSteps = 3;

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
      gender: "male",
      dob: new Date(),
      bloodType: undefined,
      insuranceInfo: "",
      notes: "",
      specialization: undefined,
      additionalInfo: "",
      yearsOfExperience: 0,
      medicalLicenseNumber: "",
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
      setRole(initialRole);

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
        specialization: (userData.specialization as string) ?? "",
        additionalInfo: (userData.additionalInfo as string) ?? "",
        yearsOfExperience: (userData.yearsOfExperience as number) ?? 0,
        medicalLicenseNumber: (userData.medicalLicenseNumber as string) ?? "",
      });
    } else {
      setRole("patient");
    }
  }, [userData, form]);

  const nextStep = () => {
    // Validate the current step first
    switch (currentStep) {
      case 0:
        // Role selection validation
        const role = form.getValues("role");
        if (!role) {
          toast.error("Please select a role");
          return;
        }
        break;
      case 1:
        // Personal info validation
        const gender = form.getValues("gender");
        const dob = form.getValues("dob");
        if (!gender || !dob) {
          toast.error("Please complete all required fields");
          return;
        }

        // Role-specific validation
        if (Role === "patient" && !form.getValues("bloodType")) {
          toast.error("Please select a blood type");
          return;
        }
        if (Role === "doctor" && !form.getValues("specialization")) {
          toast.error("Please select a specialization");
          return;
        }
        break;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = () => {
    setShowConfirmDialog(true);
  };

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
      throw error;
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

  // Step content components
  const renderStepIcon = (step: number) => {
    switch (step) {
      case 0:
        return <User className="h-6 w-6" />;
      case 1:
        return <UserRound className="h-6 w-6" />;
      case 2:
        return <ClipboardList className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 0:
        return "Role Selection";
      case 1:
        return "Personal Information";
      case 2:
        return "Additional Details";
      default:
        return "Complete Profile";
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 0:
        return "Choose your role in the healthcare system";
      case 1:
        return "Fill in your personal details";
      case 2:
        return "Provide additional information";
      default:
        return "Complete your profile setup";
    }
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
          <p className={cn("text-3xl", lxgiga.className)}>
            Please wait while we checking....
          </p>
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
          className="max-w-4xl mx-auto"
        >
          {/* Progress bar */}
          <Steps currentStep={currentStep} totalSteps={totalSteps} />

          <Form {...form}>
            <form
              // Important: Remove onSubmit to prevent auto-submission
              className="space-y-8"
            >
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                      {renderStepIcon(currentStep)}
                    </div>
                    <div>
                      <CardTitle>{getStepTitle(currentStep)}</CardTitle>
                      <CardDescription>
                        {getStepDescription(currentStep)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Step 1: Role Selection */}
                    {currentStep === 0 && (
                      <div className="space-y-6">
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
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="patient">
                                    Patient
                                  </SelectItem>
                                  <SelectItem value="doctor">Doctor</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 2: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
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

                        {Role === "patient" && (
                          <FormField
                            control={form.control}
                            name="bloodType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Blood Type</FormLabel>
                                <Select
                                  onValueChange={(val) => {
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
                      </div>
                    )}

                    {/* Step 3: Additional Details */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        {Role === "doctor" && (
                          <>
                            <FormField
                              control={form.control}
                              name="yearsOfExperience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Years of Experience</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter years of experience"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="medicalLicenseNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medical License Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your license number"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="additionalInfo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Information</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Additional qualifications, certifications, etc."
                                      className="min-h-[120px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

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
                              <FormLabel>
                                {Role === "patient"
                                  ? "Medical Notes"
                                  : "Professional Notes"}
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={
                                    Role === "patient"
                                      ? "Any relevant medical history or conditions"
                                      : "Any relevant professional information"
                                  }
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between p-6 pt-2">
                    <div>
                      {currentStep > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="flex items-center"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                      )}
                    </div>
                    <div>
                      {currentStep < totalSteps - 1 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="button" // Changed from submit to button
                          className="bg-blue-500 hover:bg-blue-600"
                          disabled={isSubmitting}
                          onClick={handleFinalSubmit} // Use handler instead of submit
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
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Profile Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your profile? You can edit your
              information later from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => form.handleSubmit(onSubmit)()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Submit Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

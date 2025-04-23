"use client"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  Bell,
  Calendar,
  FileText,
  PillIcon as Pills,
  Plus,
  RefreshCcw,
  MessageSquare,
  ChevronRight,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth, useUser } from "@clerk/nextjs"
import { BookAppointmentSheet } from "../ui/components/book-appointment-sheet"
import Link from "next/link"

// Mock data
const appointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Wilson",
    specialty: "Cardiologist",
    date: new Date("2024-03-01T10:00:00"),
    status: "upcoming",
    avatar: "/placeholder.svg?height=40&width=40&text=SW",
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "Neurologist",
    date: new Date("2024-03-05T14:30:00"),
    status: "scheduled",
    avatar: "/placeholder.svg?height=40&width=40&text=MC",
  },
]

const records = [
  {
    id: 1,
    diagnosis: "Hypertension",
    treatment: "Prescribed ACE inhibitors",
    date: new Date("2024-02-15"),
    doctor: "Dr. Sarah Wilson",
  },
  {
    id: 2,
    diagnosis: "Migraine",
    treatment: "Prescribed pain medication",
    date: new Date("2024-02-10"),
    doctor: "Dr. Michael Chen",
  },
]

const prescriptions = [
  {
    id: 1,
    medication: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    startDate: new Date("2024-02-15"),
    endDate: new Date("2024-03-15"),
    refillsLeft: 2,
  },
  {
    id: 2,
    medication: "Sumatriptan",
    dosage: "50mg",
    frequency: "As needed",
    startDate: new Date("2024-02-10"),
    endDate: new Date("2024-05-10"),
    refillsLeft: 3,
  },
]

const notifications = [
  {
    id: 1,
    type: "appointment",
    message: "Upcoming appointment with Dr. Wilson tomorrow at 10:00 AM",
    date: new Date("2024-02-29T10:00:00"),
  },
  {
    id: 2,
    type: "prescription",
    message: "Lisinopril refill needed in 5 days",
    date: new Date("2024-03-10T00:00:00"),
  },
  {
    id: 3,
    type: "test",
    message: "New blood test results available",
    date: new Date("2024-02-28T15:30:00"),
  },
]

export function PatientDashboardView() {
  const { user, isLoaded } = useUser();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex justify-between items-start">
          <div>
            {isLoaded && <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>}
            <p className="text-gray-500 mt-1">Here's an overview of your health information</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">3</span>
          </Button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />

                Book Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>Schedule a visit with your healthcare provider</CardContent>
            <CardFooter>
              <Link href={"/dashboard/patient/appointments"}>
                <Button variant="secondary" className="w-full">
                  Book Now
                </Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>Send a message to your healthcare team</CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                Send Message
              </Button>
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCcw className="h-5 w-5" />
                Request Refill
              </CardTitle>
            </CardHeader>
            <CardContent>Request a prescription refill</CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                Request
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Upcoming Appointments</CardTitle>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start space-x-4 border-b last:border-0 pb-4 last:pb-0"
                  >
                    <Avatar>
                      <AvatarImage src={appointment.avatar} />
                      <AvatarFallback>
                        {appointment.doctor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{appointment.doctor}</p>
                      <p className="text-sm text-gray-500">{appointment.specialty}</p>
                      <p className="text-sm text-gray-500">{format(appointment.date, "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                    <Badge variant={appointment.status === "upcoming" ? "default" : "secondary"} className="capitalize">
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  View All Appointments
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Medical Records */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Recent Medical Records</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="space-y-3 border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between">
                      <p className="font-medium">{record.diagnosis}</p>
                      <span className="text-sm text-gray-500">{format(record.date, "MMM d, yyyy")}</span>
                    </div>
                    <p className="text-sm text-gray-500">{record.treatment}</p>
                    <p className="text-sm text-gray-500">By {record.doctor}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  View Medical History
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Active Prescriptions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Active Prescriptions</CardTitle>
                <Pills className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="space-y-3 border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between">
                      <p className="font-medium">{prescription.medication}</p>
                      <Badge variant="outline">{prescription.refillsLeft} refills left</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {prescription.dosage} - {prescription.frequency}
                    </p>
                    <p className="text-sm text-gray-500">Until {format(prescription.endDate, "MMM d, yyyy")}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  View All Prescriptions
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Notifications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Notifications</CardTitle>
              <CardDescription>Stay updated with your health information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-4 border-b last:border-0 pb-4 last:pb-0">
                  <div className="rounded-full p-2 bg-blue-100">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{format(notification.date, "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}


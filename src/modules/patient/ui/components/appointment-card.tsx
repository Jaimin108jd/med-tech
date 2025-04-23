"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BookAppointmentSheet } from "./book-appointment-sheet"

interface AppointmentCardProps {
  title: string
  dateTime: string
  status: "completed" | "scheduled" | "rescheduled" | "canceled" | "in-progress"
  timeRemaining?: string
}

export default function AppointmentCard({
  title = "Weekly Checkup",
  dateTime = "Sunday 8:00 AM",
  status = "scheduled",
  timeRemaining = "2d 19h 27m 22s",
}: AppointmentCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Status-based styling
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return {
          bgGradient: "from-green-600/10 to-green-500/20",
          bgColor: "bg-green-50",
          textColor: "text-green-800",
          iconColor: "text-green-500",
        }
      case "scheduled":
        return {
          bgGradient: "from-blue-600/10 to-blue-500/20",
          bgColor: "bg-blue-50",
          textColor: "text-blue-800",
          iconColor: "text-blue-500",
        }
      case "rescheduled":
        return {
          bgGradient: "from-amber-600/10 to-amber-500/20",
          bgColor: "bg-amber-50",
          textColor: "text-amber-800",
          iconColor: "text-amber-500",
        }
      default:
        return {
          bgGradient: "from-blue-600/10 to-blue-500/20",
          bgColor: "bg-blue-50",
          textColor: "text-blue-800",
          iconColor: "text-blue-500",
        }
    }
  }

  const styles = getStatusStyles()

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const floatingIconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: "easeOut",
      },
    },
    float: {
      y: [0, -8, 0],
      transition: {
        y: {
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
      },
    },
  }

  const shapeVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.6,
      transition: {
        delay: 0.2,
        duration: 0.7,
      },
    },
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
  }

  const textVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.4,
        duration: 0.5,
      },
    },
  }

  if (!mounted) return null

  return (
    <motion.div initial="hidden" animate="visible" variants={cardVariants} className="w-full max-w-md mx-auto">
      <Card className={cn("overflow-hidden border-0 shadow-lg relative", styles.bgColor)}>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className={cn(
              "absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 bg-gradient-to-br",
              styles.bgGradient,
            )}
            variants={shapeVariants}
            animate="animate"
          />
          <motion.div
            className={cn(
              "absolute bottom-0 left-0 w-40 h-40 rounded-full -ml-20 -mb-20 bg-gradient-to-tr",
              styles.bgGradient,
            )}
            variants={shapeVariants}
            animate="animate"
          />
          <motion.div
            className={cn(
              "absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-gradient-to-r opacity-30",
              styles.bgGradient,
            )}
            variants={shapeVariants}
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0],
              transition: {
                x: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                y: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              },
            }}
          />
        </div>

        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start">
            <motion.div variants={textVariants} className="space-y-2">
              <div
                className={cn(
                  "inline-block px-2 py-1 rounded-md text-xs font-medium mb-2",
                  styles.bgGradient,
                  styles.textColor,
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
              <h2 className={cn("text-xl font-bold", styles.textColor)}>{title}</h2>
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className={cn("h-4 w-4", styles.iconColor)} />
                <span className={styles.textColor}>{dateTime}</span>
              </div>
            </motion.div>

            <motion.div variants={floatingIconVariants} animate="float" className="relative">
              <div className={cn("flex items-center justify-center w-16 h-16 rounded-2xl", styles.bgGradient)}>
                <Calendar className={cn("h-8 w-8", styles.iconColor)} />
              </div>
            </motion.div>
          </div>

          {timeRemaining && (
            <motion.div variants={textVariants} className="mt-6 flex items-center justify-between gap-1">
              <span className="flex items-center gap-1.5 text-sm">
                <Clock className={cn("h-4 w-4", styles.iconColor)} />
                <span className={cn("text-sm font-medium", styles.textColor)}> {timeRemaining}</span>
              </span>
              {/* <BookAppointmentSheet
                defaultValues={
                  {
                    title: title,
                    dateTime: dateTime,
                    status: status,
                    timeRemaining: time
                  }}
              /> */}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}


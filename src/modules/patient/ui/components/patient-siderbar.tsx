"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Calendar, ChevronLeft, ChevronRight, ClipboardList, CreditCard, Home, LogOutIcon, Settings, Stethoscope, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SignOutButton, useUser } from "@clerk/nextjs"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [expanded, setExpanded] = useState(true)
  const pathname = usePathname()
  const { user } = useUser();
  const navItems = [
    { name: "Dashboard", href: "/dashboard/patient", icon: Home },
    { name: "Chat", href: "/dashboard/patient/chat", icon: Users },
    { name: "Appointments", href: "/dashboard/patient/appointments", icon: Calendar },
    { name: "Medical Records", href: "/dashboard/patient/records", icon: ClipboardList },
    { name: "Payments", href: "/dashboard/patient/payments", icon: CreditCard },
  ]
  // my url looks like this dashboard/patient/appointments
  const isActiveMatcher = (href: string) => pathname === href 
  return (
    <motion.div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 shadow-sm",
        expanded ? "w-64" : "w-20",
        className
      )}
      animate={{ width: expanded ? 256 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Stethoscope className="h-6 w-6 text-blue-500" />
          {expanded && <span className="font-bold text-lg text-blue-900">MediSync</span>}
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8"
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = isActiveMatcher(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                    layoutId="activeNavIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 justify-between w-full">
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.imageUrl} alt="User" />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-sm font-medium">{user?.firstName}{' '}{user?.lastName}</div>
                <div className="text-xs text-gray-500">{user?.emailAddresses[0].emailAddress}</div>
              </motion.div>
            )}
          </div>
          {/* // a option for Logout */}
          <SignOutButton>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LogOutIcon size={18} />
            </Button>
          </SignOutButton>
        </div>
      </div>
    </motion.div>
  )
}

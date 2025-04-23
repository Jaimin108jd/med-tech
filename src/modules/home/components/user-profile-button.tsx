"use client";
import { UserButton, useUser } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Calendar, ClipboardList, Settings, Users, Building2, Phone } from "lucide-react"
import { useTheme } from "next-themes"
import { trpc } from "@/app/trpc/client"
import { useRouter } from "next/navigation";

export function UserProfileButton() {
    const { data: user } = trpc.users.getUser.useQuery();
    const userRole = user?.role;
    const validateRole = () => userRole === "admin" || userRole === "doctor" || userRole === "patient";

    const getMenuItems = () => {

        switch (userRole) {
            case "admin":
                return [
                    {
                        label: "Dashboard",
                        icon: <Building2 className="w-4 h-4" />,
                        url: "/admin/dashboard",
                    },
                    {
                        label: "Manage Users",
                        icon: <Users className="w-4 h-4" />,
                        url: "/admin/users",
                    },
                    {
                        label: "Manage Appointments",
                        icon: <Calendar className="w-4 h-4" />,
                        url: "/admin/appointments",
                    },

                ]
            case "doctor":
                return [
                    {
                        label: "My Dashboard",
                        icon: <Building2 className="w-4 h-4" />,
                        url: "/doctor/dashboard",
                    },
                    {
                        label: "My Appointments",
                        icon: <Calendar className="w-4 h-4" />,
                        url: "/doctor/appointments",
                    },
                    {
                        label: "Patient Records",
                        icon: <ClipboardList className="w-4 h-4" />,
                        url: "/doctor/patients",
                    },
                    {
                        label: "Consultations",
                        icon: <Phone className="w-4 h-4" />,
                        url: "/doctor/consultations",
                    },

                ]
            case "patient":
                return [
                    {
                        label: "My Dashboard",
                        icon: <Building2 className="w-4 h-4" />,
                        url: "/patient/dashboard",
                    },
                    {
                        label: "Book Appointment",
                        icon: <Calendar className="w-4 h-4" />,
                        url: "/patient/book-appointment",
                    },
                    {
                        label: "My Appointments",
                        icon: <Calendar className="w-4 h-4" />,
                        url: "/patient/appointments",
                    },
                    {
                        label: "Medical Records",
                        icon: <ClipboardList className="w-4 h-4" />,
                        url: "/patient/records",
                    },

                ]
        }
    }

    return (
        <>
            <UserButton afterSignOutUrl="/" appearance={{
                elements: {
                    avatarBox: "w-10 h-10",
                }
            }}>
                <UserButton.MenuItems>
                    {validateRole() && getMenuItems()?.map((item, index) => (
                        <UserButton.Link key={index} label={item.label} labelIcon={item.icon} href={item.url} />
                    ))}
                    <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
            </UserButton>
        </>
    )
}
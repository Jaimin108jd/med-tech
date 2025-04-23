"use client";

import { trpc } from "@/app/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertTriangle, Heart, Phone, User } from "lucide-react";

export function CriticalInfoCard() {
  const { data: user } = trpc.users.getUser.useQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Critical Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">Blood Type</p>
              <p className="text-sm text-muted-foreground">
                {user?.bloodType || "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Emergency Contact</p>
              <p className="text-sm text-muted-foreground">{user?.phone}</p>
            </div>
          </div>

          {/* Add more critical information here */}
        </motion.div>
      </CardContent>
    </Card>
  );
}

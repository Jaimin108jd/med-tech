// app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { pusherServer } from "@/lib/pusher-client";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse form data instead of JSON
    const formData = await req.formData();
    const socket_id = formData.get("socket_id") as string;
    const channel_name = formData.get("channel_name") as string;

    if (!socket_id || !channel_name) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // For presence channels, we need to provide user data
    // we will fetch data from db since using CurrentUser send a api request to clerk api which is costly.
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);
    if (!user) {
      return new NextResponse("User not exist on Db", { status: 401 });
    }
    const userData = {
      user_id: user.id,
      user_info: {
        name: `${user.firstName} ${user.lastName}`,
        image: user.imageUrl,
      },
    };

    // Generate auth signature
    const authResponse = pusherServer.authorizeChannel(
      socket_id,
      channel_name,
      userData
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

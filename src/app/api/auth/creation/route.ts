import { db } from "@/db";
import { users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Handles user creation/verification after authentication
 */
export const GET = async (req: Request) => {
  try {
    // Get current authenticated user from Clerk
    const user = await currentUser();

    // Check if user is authenticated
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "You are not logged in" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Check if user already exists in our database
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    // Create user if they don't exist yet
    if (!existingUser) {
      await db.insert(users).values({
        clerkId: userId as string,
        email: user.emailAddresses[0]?.emailAddress || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phone: user.phoneNumbers[0]?.phoneNumber || null,
        imageUrl: user.imageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`User ${userId} created successfully`);
    } else {
      console.log(`User ${userId} already exists`);
    }

    // Redirect to complete profile page
    return NextResponse.redirect(new URL("/complete-profile", req.url));
  } catch (error) {
    console.error("Error in user creation:", error);
    return NextResponse.json(
      { error: "Failed to process user registration" },
      { status: 500 }
    );
  }
};

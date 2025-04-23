import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { z } from "zod";
import fetch from "node-fetch";

const DAILY_API_KEY = process.env.DAILY_API_KEY;

if (!DAILY_API_KEY) {
    throw new Error("DAILY_API_KEY must be set in the environment variables.");
}

// Headers for Daily.co API requests
const dailyHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${DAILY_API_KEY}`,
};

// Function to get a room from Daily.co
const getRoom = async (roomName: string) => {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
        method: "GET",
        headers: dailyHeaders,
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Daily.co room retrieval error:", errorData);
        throw new Error("Failed to retrieve Daily.co room");
    }

    return response.json();
};

// Function to create a room in Daily.co
const createRoom = async (roomName: string) => {
    const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: dailyHeaders,
        body: JSON.stringify({
            name: roomName,
            properties: {
                enable_screenshare: true,
                enable_chat: true,
                start_video_off: true,
                start_audio_off: false,
                lang: "en",
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Daily.co room creation error:", errorData);
        throw new Error("Failed to create Daily.co room");
    }

    return response.json();
};

// Function to generate a meeting token for Daily.co
const generateMeetingToken = async (roomName: string, userId: string, isOwner: boolean = false) => {
    const response = await fetch("https://api.daily.co/v1/meeting-tokens", {
        method: "POST",
        headers: dailyHeaders,
        body: JSON.stringify({
            properties: {
                room_name: roomName,
                user_id: userId,
                is_owner: isOwner, // Grant owner permissions if needed
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Daily.co meeting token generation error:", errorData);
        throw new Error("Failed to generate Daily.co meeting token");
    }

    return response.json();
};

export const videoCallRouter = createTRPCRouter({
    // Get or create a Daily.co room
    getOrCreateRoom: protectedProcedure
        .input(z.object({ roomName: z.string() }))
        .mutation(async ({ input }) => {
            try {
                let room;
                try {
                    // Check if the room already exists
                    room = await getRoom(input.roomName);
                } catch (error) {
                    // If the room doesn't exist, create it
                    room = await createRoom(input.roomName);
                }

                return {
                    id: room.id,
                    name: room.name,
                    url: room.url, // Daily.co provides a URL for the room
                };
            } catch (error: any) {
                console.error(error);
                throw error;
            }
        }),

    // Generate a meeting token for joining a Daily.co room
    generateMeetingToken: protectedProcedure
        .input(z.object({
            roomName: z.string(),
            userId: z.string(),
            isOwner: z.boolean().default(false), // Optional: Set to true for host/owner permissions
        }))
        .mutation(async ({ input }) => {
            try {
                const tokenData = await generateMeetingToken(input.roomName, input.userId, input.isOwner);

                return {
                    token: tokenData.token,
                };
            } catch (error: any) {
                console.error(error);
                throw error;
            }
        }),
});
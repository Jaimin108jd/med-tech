"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "../../trpc/client";


const VideoMeeting = ({ id }: { id: string }) => {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    // console.log(params); // return type {id: 'fed3ed72-bf33-43fd-9c92-8e8d3905e4ad'}
    const appointmentId = params?.id;
    if (!appointmentId) {
        router.push('/appointment');
    }

    const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // TRPC mutations for room creation and token generation
    const createRoomMutation = trpc.videoCall.getOrCreateRoom.useMutation();
    const generateTokenMutation = trpc.videoCall.generateMeetingToken.useMutation();

    const startVideoCall = async () => {
        if (!appointmentId) {
            setError("Appointment ID is missing.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Create or get the room
            const roomResponse = await createRoomMutation.mutateAsync({
                roomName: appointmentId as string,
            });

            if (!roomResponse?.url) {
                throw new Error("Failed to create or retrieve the room.");
            }

            // Step 2: Generate a meeting token for the user
            const tokenResponse = await generateTokenMutation.mutateAsync({
                roomName: appointmentId as string,
                userId: "user-123", // Replace with the actual user ID
                isOwner: true, // Set to true for host permissions
            });

            if (!tokenResponse?.token) {
                throw new Error("Failed to generate a meeting token.");
            }

            // Step 3: Set the meeting URL and initialize the Daily.co iframe
            setMeetingUrl(roomResponse.url);
        } catch (err) {
            console.error("Error starting video call:", err);
            setError("Failed to start the video call. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        console.log(meetingUrl);
    }, [meetingUrl])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            {!meetingUrl && (
                <button
                    onClick={startVideoCall}
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {isLoading ? "Starting..." : "Start Video Call"}
                </button>
            )}

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {meetingUrl && (
                <div className="w-full max-w-4xl h-[600px] mt-8">
                    <iframe
                        src={`${meetingUrl}`}
                        allow="camera; microphone; fullscreen; display-capture"
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "0",
                            borderRadius: "8px",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default VideoMeeting;
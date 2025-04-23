"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/app/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ImageIcon,
  PaperclipIcon,
  SendIcon,
  SmileIcon,
  Loader2,
  VideoIcon,
} from "lucide-react";
import { pusherClient } from "@/lib/pusher-client";
import { EmojiPicker } from "../components/ui/emoji-picker";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { CldUploadButton, CldUploadWidget } from "next-cloudinary";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Update the Message interface
interface Message {
  id: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "document" | "emoji";
  fileUrl?: string;
  createdAt: Date;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
}

// Update the ChatRoom interface
interface ChatRoom {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  createdAt: Date;
  updatedAt: Date;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  } | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  } | null;
}

export function ChatInterface() {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [resource, setResource] = useState<any>();
  const presenceChannelsRef = useRef<string[]>([]);
  const presenceUpdatedRef = useRef(false);

  const { data: chatRooms, isLoading: loadingRooms } =
    trpc.chat.getChatRooms.useQuery(
      { userId: user?.id ?? "" },
      { enabled: !!user }
    );

  const { data: DbUser, isLoading } = trpc.users.getUser.useQuery();

  const { data: messages = [], refetch: refetchMessages } =
    trpc.chat.getMessages.useQuery(
      { chatRoomId: selectedRoom ?? "" },
      { enabled: Boolean(selectedRoom) }
    );

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetchMessages();
    },
  });

  const updatePresence = trpc.chat.updateUserPresence.useMutation();

  // Memoize the handle upload function
  const handleUpload = useCallback(
    (result: any) => {
      const fileUrl = result.info.secure_url;
      if (selectedRoom && user?.id) {
        sendMessage.mutate({
          chatRoomId: selectedRoom,
          senderId: user.id,
          content: fileUrl,
          type: result.info.resource_type === "image" ? "image" : "document",
          fileUrl: fileUrl,
        });
      }
    },
    [selectedRoom, user?.id, sendMessage]
  );

  // Memoize the send message function
  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !selectedRoom || !user) return;

    sendMessage.mutate({
      chatRoomId: selectedRoom,
      senderId: user.id,
      content: message,
      type: "text",
    });
  }, [message, selectedRoom, user, sendMessage]);

  // Fix for infinite updatePresence calls
  useEffect(() => {
    if (!user?.id || presenceUpdatedRef.current) return;

    // Set flag to prevent repeated calls
    presenceUpdatedRef.current = true;

    // Set user as online when component mounts - only once
    updatePresence.mutate({ userId: user.id, status: "online" });

    // Set user as offline when component unmounts
    const handleBeforeUnload = () => {
      updatePresence.mutate({ userId: user.id, status: "offline" });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updatePresence.mutate({ userId: user.id, status: "offline" });
    };
  }, [user?.id]);

  // Handle message subscription
  useEffect(() => {
    if (!selectedRoom) return;

    const channel = pusherClient.subscribe(`chat-room-${selectedRoom}`);

    const newMessageHandler = () => {
      refetchMessages();
    };

    channel.bind("new-message", newMessageHandler);

    return () => {
      channel.unbind("new-message", newMessageHandler);
      pusherClient.unsubscribe(`chat-room-${selectedRoom}`);
    };
  }, [selectedRoom, refetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Subscribe to presence channels only once when chatRooms change and clean up properly
  useEffect(() => {
    if (!chatRooms) {
      console.log("No chat rooms available, skipping presence subscription");
      return;
    }

    console.log(
      "Setting up presence channels for chat rooms:",
      chatRooms.length
    );

    // Clean up previous subscriptions
    presenceChannelsRef.current.forEach((channelName) => {
      console.log("Unsubscribing from channel:", channelName);
      pusherClient.unsubscribe(channelName);
    });

    presenceChannelsRef.current = [];

    // Track online status for all doctors and patients
    const userIds = chatRooms.flatMap((room) => {
      const ids = [];
      if (room.doctor?.id) ids.push(room.doctor.id);
      if (room.patient?.id) ids.push(room.patient.id);
      return ids;
    });

    // Create a unique set of IDs
    const uniqueUserIds = [...new Set(userIds)];
    console.log("Unique user IDs to track:", uniqueUserIds);

    // Subscribe to presence channels for all users
    uniqueUserIds.forEach((userId) => {
      const channelName = `presence-${userId}`;
      console.log("Subscribing to channel:", channelName);

      try {
        const presenceChannel = pusherClient.subscribe(channelName);
        presenceChannelsRef.current.push(channelName);

        // Wait for successful subscription before binding events
        presenceChannel.bind("pusher:subscription_succeeded", () => {
          console.log(`Successfully subscribed to ${channelName}`);

          // Bind to the user-status event
          presenceChannel.bind(
            "user-status",
            (data: { userId: string; status: string }) => {
              console.log("Received status update:", data);

              // Immediately log the current state for debugging
              console.log("Current online users before update:", onlineUsers);

              setOnlineUsers((prev) => {
                const newState = {
                  ...prev,
                  [data.userId]: data.status === "online",
                };
                console.log("Updated online users state:", newState);
                return newState;
              });
            }
          );

          // Also try binding to the default presence events
          presenceChannel.bind("pusher:member_added", (member: any) => {
            console.log("Member added:", member);
            setOnlineUsers((prev) => ({
              ...prev,
              [member.id]: true,
            }));
          });

          presenceChannel.bind("pusher:member_removed", (member: any) => {
            console.log("Member removed:", member);
            setOnlineUsers((prev) => ({
              ...prev,
              [member.id]: false,
            }));
          });
        });

        // Log channel errors
        presenceChannel.bind("pusher:subscription_error", (error: any) => {
          console.log(
            "Subscription error for channel",
            channelName,
            ":",
            error
          );
        });
      } catch (error) {
        console.log("Error subscribing to channel", channelName, ":", error);
      }
    });

    return () => {
      // Clean up all subscriptions
      presenceChannelsRef.current.forEach((channelName) => {
        console.log("Cleanup: unsubscribing from channel:", channelName);
        const channel = pusherClient.channel(channelName);
        if (channel) {
          // Unbind all events, not just user-status
          channel.unbind();
          pusherClient.unsubscribe(channelName);
        }
      });
      presenceChannelsRef.current = [];
    };
  }, [chatRooms]);

  // Add this to verify the state is updating properly
  useEffect(() => {
    console.log("onlineUsers state changed:", onlineUsers);
  }, [onlineUsers]);

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Get the selected room details
  const selectedRoomData = selectedRoom
    ? chatRooms?.find((room) => room.id === selectedRoom)
    : null;

  const doctorName = selectedRoomData?.doctor
    ? `Dr. ${selectedRoomData.doctor.firstName} ${selectedRoomData.doctor.lastName}`
    : "Doctor";

  const doctorImage = selectedRoomData?.doctor?.imageUrl || "";

  const doctorInitials = selectedRoomData?.doctor
    ? `${selectedRoomData.doctor.firstName[0]}${selectedRoomData.doctor.lastName[0]}`
    : "DR";

  const isDoctorOnline = selectedRoomData?.doctor?.id
    ? onlineUsers[selectedRoomData.doctor.id] || false
    : false;

  return (
    <div className="flex h-[100dvh] gap-4 p-4">
      {/* Chat Rooms List */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 font-semibold">Chat Rooms</div>
        <Separator />
        <ScrollArea className="flex-1">
          {loadingRooms ? (
            <div className="flex flex-col gap-2 items-center justify-center h-full px-2">
              {Array.from({ length: 15 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-16 p-3 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {chatRooms?.map((room) => {
                const isUserOnline = room.doctor?.id
                  ? onlineUsers[room.doctor.id] || false
                  : false;

                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full p-3 rounded-lg transition-colors ${
                      selectedRoom === room.id
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={room.doctor?.imageUrl || ""} />
                          <AvatarFallback>
                            {room.doctor?.firstName?.[0] || ""}
                            {room.doctor?.lastName?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online indicator dot */}
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            isUserOnline ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          {room.doctor ? (
                            <span>Dr. {room.doctor.firstName}</span>
                          ) : (
                            <span>Doctor</span>
                          )}
                    
                          <Badge
                            variant={isUserOnline ? "default" : "secondary"}
                            className="text-xs px-1.5 py-0"
                          >
                            {isUserOnline ? "Online" : "Offline"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Click to view chat
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {!loadingRooms && chatRooms?.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No chat rooms found
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={doctorImage} />
                    <AvatarFallback>{doctorInitials}</AvatarFallback>
                  </Avatar>
                  {/* Online indicator dot */}
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      isDoctorOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                </div>
                <div>
                  <div className="font-medium">{doctorName}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isDoctorOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                    {isDoctorOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
              <div className="videocallBtn">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/meeting/${selectedRoomData?.appointmentId}`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!isDoctorOnline}
                        >
                          <VideoIcon
                            className={`h-5 w-5 ${
                              !isDoctorOnline ? "text-muted-foreground" : ""
                            }`}
                          />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isDoctorOnline
                        ? "Start Video Call"
                        : "Doctor is offline"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <AnimatePresence initial={false}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${
                        msg.senderId === DbUser?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.senderId === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.type === "text" && <p>{msg.content}</p>}
                        {msg.type === "image" && (
                          <img
                            src={msg.fileUrl || "/placeholder.svg"}
                            alt="Shared image"
                            className="rounded-lg max-w-full"
                          />
                        )}
                        {msg.type === "document" && (
                          <Link
                            href={msg.fileUrl ?? ""}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            Download Document
                          </Link>
                        )}
                        <div
                          className={`text-xs mt-1 text-right ${
                            msg.senderId === user?.id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTimestamp(new Date(msg.createdAt))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </ScrollArea>
            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <EmojiPicker
                        onChange={(emoji) => setMessage((prev) => prev + emoji)}
                      >
                        <Button variant="ghost" size="icon">
                          <SmileIcon className="h-5 w-5" />
                        </Button>
                      </EmojiPicker>
                    </TooltipTrigger>
                    <TooltipContent>Add emoji</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CldUploadWidget
                        uploadPreset="med-tech-preset"
                        onSuccess={(result, { widget }) => {
                          handleUpload(result);
                          widget.close();
                        }}
                        options={{
                          sources: ["local"],
                        }}
                      >
                        {({ open }) => {
                          function handleOnClick() {
                            setResource(undefined);
                            open();
                          }
                          return (
                            <button
                              onClick={handleOnClick}
                              className="p-2 rounded-lg hover:bg-primary/10"
                            >
                              <ImageIcon className="h-5 w-5" />
                            </button>
                          );
                        }}
                      </CldUploadWidget>
                    </TooltipTrigger>
                    <TooltipContent>Send image</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex-col flex items-center justify-center text-muted-foreground">
            <Image
              src="/chat.gif"
              alt="Welcome "
              height={150}
              width={150}
              objectFit="cover"
            />
            Select a chat room to start messaging
          </div>
        )}
      </Card>
    </div>
  );
}

"use client";
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useVideoCallStore } from "@/lib/video-call-provider";
import VideoMeeting from "@/modules/chat/components/ui/VideoCall";
const VideoCallModal = () => {
    const { isOpen, meetingId } = useVideoCallStore();
    return (
        <Dialog open={isOpen}>
            <DialogContent className=" h-[90vh] w-[90vw] max-w-[90vw]">
                <DialogHeader>
                    Video Call
                </DialogHeader>
                <div className="w-full h-[80vh]">
                    <VideoMeeting
                        id={meetingId}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default VideoCallModal
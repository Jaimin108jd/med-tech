import { create } from "zustand";
type videoStore = {
    isOpen: boolean,
    meetingId: string,
    open: () => void,
    close: () => void,
    setMeetingId: (id: string) => void
}
export const useVideoCallStore = create<videoStore>((set) => ({
    isOpen: false,
    meetingId: "",
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    setMeetingId: (id: string) => set({ meetingId: id })
}));

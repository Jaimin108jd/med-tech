import { create } from 'zustand';

interface PaymentModalState {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

export const usePaymentModal = create<PaymentModalState>((set) => ({
    isOpen: false,
    setOpen: (isOpen) => set({ isOpen: isOpen })
}));

"use client";

import { useCallback } from "react";

export function useRazorpay() {
  const loadRazorpay = useCallback(async () => {
    if ((window as any).Razorpay) {
      return (window as any).Razorpay;
    }
    
    return new Promise<any>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        resolve((window as any).Razorpay);
      };
      script.onerror = () => {
        resolve(null);
      };
      document.body.appendChild(script);
    });
  }, []);
  
  return { loadRazorpay };
}

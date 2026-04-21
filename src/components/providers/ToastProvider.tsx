"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#111111",
          border: "1px solid rgba(255,215,0,0.2)",
          color: "#FFFFFF",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
        },
        classNames: {
          success: "!border-green-500/30",
          error: "!border-red-500/30",
          warning: "!border-yellow-500/30",
        },
      }}
      richColors
    />
  );
}

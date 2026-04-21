"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import ToastProvider from "./ToastProvider";
import AiChat from "@/components/ui/AiChat";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ToastProvider />
      <AiChat />
    </ThemeProvider>
  );
}

"use client";

// Eliminamos NextAuth y usamos nuestro AuthProvider SPA
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ConfirmModalProvider } from "@/context/ConfirmModalContext";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ConfirmModalProvider>
          {children}
        </ConfirmModalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
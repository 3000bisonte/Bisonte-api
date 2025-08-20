"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ConnectionHandler() {
  const router = useRouter();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const safeReplace = (path) => {
      if (typeof window === "undefined") return;
      if (window.location.pathname !== path) {
        router.replace(path);
      }
    };

    const goOffline = () => {
      if (typeof window === "undefined") return;
      // Guardar última ruta para volver luego
      try {
        sessionStorage.setItem("lastRoute", window.location.pathname);
      } catch {}
      safeReplace("/no-conexion");
    };

    const goOnline = () => {
      if (typeof window === "undefined") return;
      const last = (() => {
        try {
          return sessionStorage.getItem("lastRoute") || "/";
        } catch {
          return "/";
        }
      })();
      if (window.location.pathname === "/no-conexion") {
        safeReplace(last);
      }
    };

    const handleOffline = () => {
      // Debounce para evitar falsos positivos al cargar SW
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!navigator.onLine) goOffline();
      }, 300);
    };

    const handleOnline = () => {
      clearTimeout(timeoutRef.current);
      // Pequeño retraso para estabilizar el estado
      timeoutRef.current = setTimeout(() => {
        if (navigator.onLine) goOnline();
      }, 150);
    };

    // Verificación inicial con debounce
    if (typeof window !== "undefined") {
      if (!navigator.onLine) {
        handleOffline();
      }
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearTimeout(timeoutRef.current);
    };
  }, [router]);

  // No renderiza UI
  return null;
}
"use client";

import { useEffect } from "react";

const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isProd = process.env.NODE_ENV === "production";

    if (!isProd) {
      // En desarrollo: desregistrar cualquier SW para evitar cache de chunks/estilos
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        if (regs?.length) {
          console.warn("Desregistrando Service Workers en desarrollo...", regs.length);
        }
        regs.forEach((reg) => reg.unregister());
      });
      // Además limpiar caches de SW
      if (window.caches?.keys) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    // Solo producción: registrar SW
    const swVersion = 'v2';
    navigator.serviceWorker
      .register(`/sw.js?v=${swVersion}`)
      .then((registration) => {
        console.log("Service Worker registrado:", registration);

        const handleMessage = (event) => {
          const port = event.ports?.[0];
          // Si se quisiera pasar un puerto al SW, habilitar aquí.
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
      })
      .catch((error) => {
        console.error("Error al registrar el Service Worker:", error);
      });
  }, []);

  return null; // No renderiza nada
};

export default ServiceWorkerRegister;

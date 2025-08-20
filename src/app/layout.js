import "./globals.css";
import { Providers } from "./Providers";
import { RouteGuard } from "@/components/RouteGuard";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ConnectionHandler from "@/components/ConnectionHandler";
import AdDebugInfo from "@/components/AdDebugInfo";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
const AdBannerNative = dynamic(() => import("@/components/AdBannerNative"), { ssr: false });
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

// Fuente consistente con Vercel
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Bisonte Logística",
  description: "App para envíos en Bogotá y municipios cercanos",
  manifest: "/manifest.json",
  icons: {
  apple: "/icon-256x256.png",
  icon: "/icon-512x512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bisonte",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Bisonte Logística",
    title: "Bisonte Logística",
    description: "App para envíos en Bogotá y municipios cercanos",
  },
  keywords: ["envios", "logistica", "bogota", "paquetes", "courier"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bisonte" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
  <link rel="apple-touch-icon" href="/icon-256x256.png" />
        <link rel="manifest" href="/manifest.json" />
  {/* Preconnect/DNS-Prefetch for Google Identity and OAuth to help Android WebView */}
  <link rel="dns-prefetch" href="https://accounts.google.com" />
  <link rel="dns-prefetch" href="https://apis.google.com" />
  <link rel="dns-prefetch" href="https://oauth2.googleapis.com" />
  <link rel="dns-prefetch" href="https://www.googleapis.com" />
  <link rel="dns-prefetch" href="https://ssl.gstatic.com" />
  <link rel="dns-prefetch" href="https://www.gstatic.com" />
  <link rel="preconnect" href="https://accounts.google.com" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://apis.google.com" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://oauth2.googleapis.com" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://www.googleapis.com" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
        
        {/* Configuración para AdMob (cuando esté en app nativa) */}
        <meta name="google-adsense-account" content="ca-pub-1352045169606160" />
        <meta name="admob-app-id" content="ca-app-pub-1352045169606160~5443732431" />
      </head>
  <body className={inter.className}>
        <Providers>
          <RouteGuard>
            <ServiceWorkerRegister />
            <ConnectionHandler />
            <AdDebugInfo />
            {children}
            {/* Banner nativo solo en APK */}
            <AdBannerNative />
            <MobileBottomNav />
          </RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
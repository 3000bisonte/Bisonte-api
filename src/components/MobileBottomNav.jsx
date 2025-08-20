"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const items = [
  { href: "/home/", label: "Inicio", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active?"text-teal-400":"text-gray-400"}><path d="M3 9.5l9-7 9 7"/><path d="M9 22V12h6v10"/></svg>
  )},
  { href: "/misenvios", label: "Envíos", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active?"text-teal-400":"text-gray-400"}><path d="M3 7h18l-2 10H5L3 7z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
  )},
  { href: "/cotizador", label: "Cotizar", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active?"text-teal-400":"text-gray-400"}><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg>
  )},
  { href: "/pagos", label: "Pagos", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active?"text-teal-400":"text-gray-400"}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
  )},
  { href: "/perfilCard", label: "Perfil", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active?"text-teal-400":"text-gray-400"}><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
  )},
  // adicionales de acceso rápido
  { href: "/misenvios", label: "Historial", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active?"text-teal-400":"text-gray-400"}><path d="M12 8v5l4 2"/><circle cx="12" cy="12" r="10"/></svg>
  )},
  { href: "/contacto", label: "Contacto", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active?"text-teal-400":"text-gray-400"}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  )},
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
  const hideOn = ["/", "/register", "/recuperar", "/no-conexion", "/diagnostic", "/auth/" ]; 
    const shouldHide = hideOn.some((p) => pathname === p || pathname?.startsWith(p));
    setHidden(shouldHide);
  }, [pathname]);

  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="max-w-md mx-auto flex items-center justify-between px-6 py-2 gap-2" style={{paddingBottom: "max(env(safe-area-inset-bottom), 8px)"}}>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl hover:bg-white/5">
              {item.icon(active)}
              <span className={`text-[11px] ${active?"text-teal-400":"text-gray-400"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

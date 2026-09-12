"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/today", label: "Hoje", icon: "🏠" },
  { href: "/checklist", label: "Checklist", icon: "📋" },
  { href: "/layette", label: "Enxoval", icon: "🛍️" },
  { href: "/journey", label: "Jornada", icon: "📅" },
  { href: "/profile", label: "Perfil", icon: "👤" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-border bg-surface/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-xs transition-colors ${
                  active ? "text-primary-dark" : "text-muted"
                }`}
              >
                <span className={`text-xl ${active ? "" : "opacity-70"}`}>{item.icon}</span>
                <span className={active ? "font-medium" : ""}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

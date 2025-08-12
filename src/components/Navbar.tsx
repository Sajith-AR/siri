"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/appointments", label: "Appointments" },
  { href: "/chat", label: "Chat" },
  { href: "/records", label: "Records" },
  { href: "/call/demo", label: "Call" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="border-b border-foreground/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="text-base font-semibold">
          Telemedicine
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "hover:text-foreground/80 transition-colors " +
                  (isActive ? "text-foreground font-medium" : "text-foreground/70")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="hidden sm:inline-flex items-center rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-md bg-foreground text-background px-3 py-1.5 text-sm hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}



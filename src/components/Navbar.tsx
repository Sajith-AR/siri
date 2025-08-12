"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import TopBarControls from "@/components/TopBarControls";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/symptom-check", label: "Symptom Check" },
  { href: "/appointments", label: "Appointments" },
  { href: "/chat", label: "Chat" },
  { href: "/records", label: "Records" },
  { href: "/call/demo", label: "Call" },
  { href: "/library", label: "Library" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useSettings();
  return (
    <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-card)]/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="text-base font-semibold">
          {t("appTitle")}
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
                {(() => {
                  switch (item.label) {
                    case "Home":
                      return t("navHome");
                    case "Appointments":
                      return t("navAppointments");
                    case "Chat":
                      return t("navChat");
                    case "Records":
                      return t("navRecords");
                    case "Library":
                      return t("library");
                    case "Symptom Check":
                      return t("startSymptomCheck");
                    default:
                      return t("navCall");
                  }
                })()}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <TopBarControls />
          <Link
            href="/help"
            className="hidden sm:inline-flex items-center rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
          >
            {t("help")}
          </Link>
          <Link
            href="/signin"
            className="hidden sm:inline-flex items-center rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-md bg-foreground text-background px-3 py-1.5 text-sm hover:opacity-90"
          >
            {t("signUp")}
          </Link>
        </div>
      </div>
    </header>
  );
}



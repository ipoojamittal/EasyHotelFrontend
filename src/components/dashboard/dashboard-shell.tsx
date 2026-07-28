"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  DoorClosed,
  BedDouble,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: string[];
}

const NAV_SECTIONS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["staff", "hotelAdmin", "superAdmin"] },
    ],
  },
  {
    heading: "Property",
    items: [
      { href: "/dashboard/hotel", label: "Hotel", icon: Building2, roles: ["hotelAdmin"] },
      { href: "/dashboard/room-types", label: "Room types", icon: BedDouble, roles: ["hotelAdmin", "staff"] },
      { href: "/dashboard/rooms", label: "Rooms", icon: DoorClosed, roles: ["hotelAdmin", "staff"] },
    ],
  },
  {
    heading: "Operations",
    items: [
      { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays, roles: ["hotelAdmin", "staff"] },
      { href: "/dashboard/staff", label: "Staff", icon: Users, roles: ["hotelAdmin"] },
    ],
  },
  {
    heading: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["staff", "hotelAdmin", "superAdmin"] },
    ],
  },
];

/**
 * DashboardShell — sidebar + topbar wrapper for the management dashboard.
 * Minimal Phase-0 stub; expanded in Phase 3 with collapse, cmd+K, mobile sheet.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — 256px expanded (per the Linear/Vercel pattern) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="font-mono text-sm tracking-tight">
            <span className="text-sidebar-foreground">hms</span>
            <span className="text-sidebar-primary">.</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter((i) =>
              user ? i.roles.includes(user.role) : false
            );
            if (items.length === 0) return null;
            return (
              <div key={section.heading}>
                <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-accent-foreground/60">
                  {section.heading}
                </p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
        {user ? (
          <div className="border-t border-sidebar-border px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-sidebar-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-sidebar-accent-foreground/60">
                  {user.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
          {/* Mobile brand (sidebar hidden < md) */}
          <Link
            href="/dashboard"
            className="font-mono text-sm md:hidden"
          >
            <span className="text-foreground">hms</span>
            <span className="text-primary">.</span>
          </Link>
          <div className="hidden text-sm text-muted-foreground md:block">
            {/* Breadcrumb placeholder — Phase 3 */}
          </div>
          <div className="text-xs text-muted-foreground">
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

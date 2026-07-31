"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Building2,
  DoorClosed,
  BedDouble,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
  type LucideIcon,
} from "lucide-react";
import { CommandMenu } from "./command-menu";
import { useBreadcrumb } from "./use-breadcrumb";

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
      { href: "/hotels", label: "All hotels", icon: Building2, roles: ["superAdmin"] },
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

/** Sidebar nav content — shared between desktop sidebar and mobile sheet. */
function SidebarNav({ user, onNavigate }: { user: { firstName: string; lastName: string; role: string } | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
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
                      onClick={onNavigate}
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
  );
}

/** User footer — shared between desktop sidebar and mobile sheet. */
function SidebarFooter({ user, onLogout }: { user: { firstName: string; lastName: string; role: string } | null; onLogout: () => void }) {
  if (!user) return null;
  return (
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
          onClick={onLogout}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * DashboardShell — sidebar + topbar wrapper for the management dashboard.
 * Features:
 * - Collapsible desktop sidebar (icon-rail when collapsed, 256px expanded).
 * - Mobile sheet (hamburger) for < md breakpoints.
 * - cmd+K command palette for quick navigation.
 * - Topbar with breadcrumb + search trigger.
 * - Forced dark theme via the `.dark` wrapper in the layout.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const breadcrumb = useBreadcrumb();

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col transition-[width] duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="font-mono text-sm tracking-tight">
            <span className="text-sidebar-foreground">hms</span>
            <span className="text-sidebar-primary">.</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
        {collapsed ? (
          <>
            {/* Icon rail */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
              {NAV_SECTIONS.flatMap((s) => s.items)
                .filter((i) => (user ? i.roles.includes(user.role) : false))
                .map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex h-9 w-full items-center justify-center rounded-md transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                      title={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  );
                })}
            </nav>
            <div className="border-t border-sidebar-border py-3">
              <Button
                variant="ghost"
                size="icon"
                className="mx-auto h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                onClick={onLogout}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <SidebarNav user={user} />
            <SidebarFooter user={user} onLogout={onLogout} />
          </>
        )}
      </aside>

      {/* Mobile sidebar (sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2 z-50 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center px-6">
            <Link href="/dashboard" className="font-mono text-sm tracking-tight">
              <span className="text-sidebar-foreground">hms</span>
              <span className="text-sidebar-primary">.</span>
            </Link>
          </div>
          <SidebarNav user={user} onNavigate={() => setMobileOpen(false)} />
          <SidebarFooter user={user} onLogout={onLogout} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-6 pl-14 backdrop-blur-md md:pl-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb.href}>
                {i > 0 ? (
                  <span className="text-muted-foreground/40">/</span>
                ) : null}
                {i === breadcrumb.length - 1 ? (
                  <span className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* Search trigger (opens cmd+K) */}
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 text-muted-foreground sm:inline-flex"
              onClick={() => {
                // Dispatch a synthetic keydown to open the command menu.
                window.dispatchEvent(
                  new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                    bubbles: true,
                  })
                );
              }}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                ⌘K
              </kbd>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>

      <CommandMenu />
    </div>
  );
}

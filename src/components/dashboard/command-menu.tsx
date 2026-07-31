"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth } from "@/components/providers/auth-provider";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  DoorClosed,
  CalendarDays,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface CmdItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
}

const COMMANDS: { group: string; items: CmdItem[] }[] = [
  {
    group: "Navigate",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["staff", "hotelAdmin", "superAdmin"] },
      { label: "Hotel settings", href: "/dashboard/hotel", icon: Building2, roles: ["hotelAdmin"] },
      { label: "Room types", href: "/dashboard/room-types", icon: BedDouble, roles: ["hotelAdmin", "staff"] },
      { label: "Rooms", href: "/dashboard/rooms", icon: DoorClosed, roles: ["hotelAdmin", "staff"] },
      { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays, roles: ["hotelAdmin", "staff"] },
      { label: "Staff", href: "/dashboard/staff", icon: Users, roles: ["hotelAdmin"] },
      { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["staff", "hotelAdmin", "superAdmin"] },
    ],
  },
];

/**
 * CommandMenu — a cmd+K palette for quick navigation. Opens with ⌘K /
 * Ctrl+K. Filters commands by the user's role. Uses shadcn's
 * CommandDialog (cmdk under the hood).
 */
export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Global key listener for ⌘K / Ctrl+K.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {COMMANDS.map((section) => {
          const items = section.items.filter((i) =>
            user ? i.roles.includes(user.role) : false
          );
          if (items.length === 0) return null;
          return (
            <CommandGroup key={section.group} heading={section.group}>
              {items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => run(item.href)}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useUsers, useDeleteUser } from "@/lib/query";
import type { User } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { ConfirmDialog } from "@/components/primitives/confirm-dialog";
import { RoleBadge } from "@/components/primitives/status-badge";
import { formatRelative } from "@/lib/format";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/apiFetch";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";

/**
 * StaffList — the /dashboard/staff page. A DataTable of the hotelAdmin's
 * staff/users with create/edit/deactivate.
 */
export function StaffList() {
  const { data: users, isLoading, isError, error } = useUsers({ limit: 100 });
  const deleteUser = useDeleteUser();

  if (isError) {
    return (
      <div className="space-y-8">
        <Header />
        <EmptyState
          icon={Users}
          title="Could not load staff"
          description={error instanceof ApiError ? error.message : "Please try again later."}
        />
      </div>
    );
  }

  const list = (users ?? []).filter((u) => u.role !== "customer");

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <Header />
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/dashboard/staff/new">
            <Plus className="h-4 w-4" />
            New staff member
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff yet"
          description="Add your first team member to start delegating work."
          action={
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/dashboard/staff/new">
                <Plus className="h-4 w-4" />
                New staff member
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-28">Role</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-32">Joined</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((u) => (
                <StaffRow
                  key={u.id}
                  user={u}
                  onDelete={async () => {
                    try {
                      await deleteUser.mutateAsync(u.id);
                      toast.success("Staff member removed.");
                    } catch (err) {
                      toast.error(err instanceof ApiError ? err.message : "Could not remove.");
                      throw err;
                    }
                  }}
                  deleting={deleteUser.isPending}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function StaffRow({
  user,
  onDelete,
  deleting,
}: {
  user: User;
  onDelete: () => Promise<void>;
  deleting: boolean;
}) {
  const isActive = !user.isDeleted;
  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link href={`/dashboard/staff/${user.id}`} className="hover:text-primary">
          {user.firstName} {user.lastName}
        </Link>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{user.email ?? "—"}</TableCell>
      <TableCell>
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell>
        <span
          className={
            isActive
              ? "inline-flex items-center gap-1.5 text-xs text-success"
              : "inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          }
        >
          <span
            className={
              isActive
                ? "h-1.5 w-1.5 rounded-full bg-success"
                : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
            }
          />
          {isActive ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {user.createdAt ? formatRelative(user.createdAt) : "—"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/dashboard/staff/${user.id}`} aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            }
            title="Remove this staff member?"
            description={`This deletes ${user.firstName} ${user.lastName}. They will no longer be able to log in.`}
            confirmLabel="Remove"
            destructive
            onConfirm={onDelete}
          >
            {deleting ? <p className="text-xs text-muted-foreground">Removing…</p> : null}
          </ConfirmDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Staff</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Team members who can manage your hotel.
      </p>
    </div>
  );
}

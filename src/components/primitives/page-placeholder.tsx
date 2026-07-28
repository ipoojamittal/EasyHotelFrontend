import * as React from "react";

/**
 * PagePlaceholder — used during Phase 0 so every route resolves to a real
 * page. Replaced feature-by-feature in Phases 1–4. Keeps a consistent,
 * on-brand look (not a generic "TODO").
 */
export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          In progress
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This page ships in a later build phase.
        </p>
      </div>
    </div>
  );
}

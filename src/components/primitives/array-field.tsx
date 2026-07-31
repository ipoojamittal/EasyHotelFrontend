"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ArrayField — a reusable editor for string[] fields (amenities, tags,
 * images, phoneNumbers). Renders the current items as chips/rows with
 * remove buttons, plus an input to add new entries. Enter or click "Add"
 * appends. Empty/duplicate entries are ignored.
 *
 * For image URLs, set `type="url"` to render a thumbnail preview next to
 * each entry.
 */
export function ArrayField({
  label,
  values,
  onChange,
  placeholder,
  type = "text",
  maxItems,
  className,
}: {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  type?: "text" | "url";
  maxItems?: number;
  className?: string;
}) {
  const [input, setInput] = React.useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) return;
    if (maxItems && values.length >= maxItems) return;
    onChange([...values, trimmed]);
    setInput("");
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label>{label}</Label> : null}
      {/* Existing items */}
      {values.length > 0 ? (
        <div className="space-y-2">
          {values.map((value, i) => (
            <div
              key={`${value}-${i}`}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5"
            >
              {type === "url" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={value}
                  alt=""
                  className="h-8 w-12 shrink-0 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate text-sm">{value}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => remove(i)}
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      {/* Add input */}
      <div className="flex gap-2">
        <Input
          type={type === "url" ? "url" : "text"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder ?? "Add an item…"}
          className="h-9"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 gap-1"
          onClick={add}
          disabled={!input.trim() || (maxItems ? values.length >= maxItems : false)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {maxItems ? (
        <p className="text-xs text-muted-foreground">
          {values.length}/{maxItems} items
        </p>
      ) : null}
    </div>
  );
}

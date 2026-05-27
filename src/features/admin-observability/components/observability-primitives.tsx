"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import type { ProcessingEventStatus } from "@/app/api/admin/processing-events/responses";

export const statusStyle: Record<ProcessingEventStatus, string> = {
  started: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  error: "border-rose-500/20 bg-rose-500/10 text-rose-300",
};

export const statusIcon = {
  started: Clock3,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

export function StatusBadge({ status }: { status: ProcessingEventStatus }) {
  const Icon = statusIcon[status];
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium ${statusStyle[status]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/[0.06] bg-[#101018] p-3">
      <p className="mb-1 text-[11px] uppercase text-zinc-600">{label}</p>
      <p className="truncate font-mono text-[11px] text-zinc-300">{value}</p>
    </div>
  );
}

export function formatTime(value: string, locale: string) {
  return new Date(value).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(value: string, locale: string) {
  return new Date(value).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export function formatBytes(value: number | null) {
  if (value === null) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Select } from "@/frontend/components/ui/select";
import { Textarea } from "@/frontend/components/ui/textarea";
import { OFFER_STATUSES, type OfferStatus } from "@/lib/analysis-types";
import type { JobMatchAnalysisTrackingEntryResponse } from "@/app/api/job-match-analyses/responses";
import type {
  CreateFollowUpEntryInput,
  FollowUpEntryInput,
} from "../../../api/job-match-analysis-api";

export type FollowUpEntryFields = FollowUpEntryInput;
export type CreateFollowUpEntryFields = CreateFollowUpEntryInput;

interface TrackingUpdateFormProps {
  currentStatus: OfferStatus;
  entry?: JobMatchAnalysisTrackingEntryResponse;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (
    value: FollowUpEntryFields | CreateFollowUpEntryFields,
  ) => Promise<void>;
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function nowAsDateTimeLocal(): string {
  return toDateTimeLocal(new Date().toISOString());
}

function optional(value: string): string | null {
  return value.trim() || null;
}

export function TrackingUpdateForm({
  currentStatus,
  entry,
  isSaving,
  onCancel,
  onSubmit,
}: TrackingUpdateFormProps) {
  const t = useTranslations("analysisDetail.tracking");
  const navigation = useTranslations("navigation");
  const id = useId();
  const isEditing = Boolean(entry);
  const [form, setForm] = useState(() => {
    const status = entry?.status ?? currentStatus;
    return {
      status,
      title: entry?.title ?? "",
      notes: entry?.notes ?? "",
      nextAction: entry?.nextAction ?? "",
      nextActionAt: entry?.nextActionAt
        ? toDateTimeLocal(entry.nextActionAt)
        : "",
      occurredAt: entry?.occurredAt
        ? toDateTimeLocal(entry.occurredAt)
        : nowAsDateTimeLocal(),
      updateCurrentStatus: entry ? false : status !== currentStatus,
    };
  });
  const statusDiffers = form.status !== currentStatus;

  const handleStatusChange = (nextStatus: OfferStatus) => {
    setForm((current) => ({
      ...current,
      status: nextStatus,
      updateCurrentStatus: isEditing
        ? current.updateCurrentStatus
        : nextStatus !== currentStatus,
    }));
  };

  return (
    <form
      className="rounded-xl border border-action-border/35 bg-panel-raised p-4 shadow-sm sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const fields: FollowUpEntryFields = {
          status: form.status,
          title: optional(form.title),
          notes: optional(form.notes),
          nextAction: optional(form.nextAction),
          nextActionAt:
            form.nextAction.trim() && form.nextActionAt
              ? new Date(form.nextActionAt).toISOString()
              : null,
          occurredAt: new Date(form.occurredAt).toISOString(),
        };
        void onSubmit(
          isEditing
            ? fields
            : {
                ...fields,
                updateCurrentStatus:
                  statusDiffers && form.updateCurrentStatus,
              },
        );
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${id}-status`}>{t("status")}</Label>
          <Select
            id={`${id}-status`}
            name="status"
            value={form.status}
            onChange={(event) =>
              handleStatusChange(event.target.value as OfferStatus)
            }
          >
            {OFFER_STATUSES.map((offerStatus) => (
              <option key={offerStatus} value={offerStatus}>
                {navigation(`offerStatuses.${offerStatus}`)}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${id}-occurred-at`}>{t("occurredAt")}</Label>
          <Input
            id={`${id}-occurred-at`}
            name="occurredAt"
            type="datetime-local"
            value={form.occurredAt}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                occurredAt: event.target.value,
              }))
            }
            required
            className="h-10"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor={`${id}-title`}>{t("optionalTitle")}</Label>
        <Input
          id={`${id}-title`}
          name="title"
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          placeholder={t("titlePlaceholder")}
          className="h-10"
        />
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor={`${id}-notes`}>{t("note")}</Label>
        <Textarea
          id={`${id}-notes`}
          name="notes"
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder={t("notePlaceholder")}
          rows={4}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.65fr)]">
        <div className="space-y-2">
          <Label htmlFor={`${id}-next-action`}>{t("nextAction")}</Label>
          <Input
            id={`${id}-next-action`}
            name="nextAction"
            value={form.nextAction}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                nextAction: event.target.value,
                nextActionAt: event.target.value.trim()
                  ? current.nextActionAt
                  : "",
              }));
            }}
            placeholder={t("nextActionPlaceholder")}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${id}-next-action-at`}>{t("nextActionAt")}</Label>
          <Input
            id={`${id}-next-action-at`}
            name="nextActionAt"
            type="datetime-local"
            value={form.nextActionAt}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                nextActionAt: event.target.value,
              }))
            }
            disabled={!form.nextAction.trim()}
            className="h-10"
          />
        </div>
      </div>

      {!isEditing && statusDiffers && (
        <div className="mt-4 rounded-lg border border-action-border/30 bg-action/5 p-3">
          <Label htmlFor={`${id}-update-current`} className="items-start">
            <input
              id={`${id}-update-current`}
              name="updateCurrentStatus"
              type="checkbox"
              aria-label={t("updateCurrentStatus")}
              checked={form.updateCurrentStatus}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  updateCurrentStatus: event.target.checked,
                }))
              }
              className="mt-0.5 size-4 accent-action"
            />
            <span>
              <span className="block text-sm text-text-main">
                {t("updateCurrentStatus")}
              </span>
              <span className="mt-1 block text-xs font-normal text-text-muted">
                {t("updateCurrentStatusHint")}
              </span>
            </span>
          </Label>
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onCancel}
          disabled={isSaving}
          className="min-h-10"
        >
          {t("cancel")}
        </Button>
        <Button type="submit" size="lg" disabled={isSaving} className="min-h-10">
          {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {isEditing ? t("saveChanges") : t("saveUpdate")}
        </Button>
      </div>
    </form>
  );
}

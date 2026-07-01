"use client";

import { FormEvent, useState } from "react";
import { Link2, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Select } from "@/frontend/components/ui/select";
import { Textarea } from "@/frontend/components/ui/textarea";
import type {
  OpportunityPersonInput,
  OpportunityPersonResponse,
  OpportunityPersonRole,
} from "../../../api/opportunity-people-api";
import { OPPORTUNITY_PERSON_ROLE_OPTIONS } from "./opportunity-person-roles";

interface LinkDraft {
  key: string;
  url: string;
  label: string;
}

interface OpportunityPersonFormState {
  name: string;
  role: OpportunityPersonRole | "";
  jobTitle: string;
  organization: string;
  email: string;
  phone: string;
  notes: string;
  links: LinkDraft[];
}

interface OpportunityPersonFormProps {
  person?: OpportunityPersonResponse | null;
  isSaving: boolean;
  onSubmit: (input: OpportunityPersonInput) => Promise<void> | void;
  onCancel: () => void;
}

export function OpportunityPersonForm({
  person = null,
  isSaving,
  onSubmit,
  onCancel,
}: OpportunityPersonFormProps) {
  const t = useTranslations("analysisDetail.people.form");
  const rolesT = useTranslations("analysisDetail.people.roles");
  const [form, setForm] = useState<OpportunityPersonFormState>(() => ({
    name: person?.name ?? "",
    role: person?.role ?? "",
    jobTitle: person?.jobTitle ?? "",
    organization: person?.organization ?? "",
    email: person?.email ?? "",
    phone: person?.phone ?? "",
    notes: person?.notes ?? "",
    links:
      person?.links.map((link, index) => ({
        key: `existing-${index}`,
        url: link.url,
        label: link.label ?? "",
      })) ?? [],
  }));

  const updateForm = (patch: Partial<OpportunityPersonFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.role) return;
    await onSubmit({
      name: form.name.trim(),
      role: form.role,
      jobTitle: form.jobTitle.trim() || null,
      organization: form.organization.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      links: form.links.map((link) => ({
        url: link.url.trim(),
        label: link.label.trim() || null,
      })),
      notes: form.notes.trim() || null,
    });
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-5">
        <div className="space-y-2">
          <Label htmlFor="opportunity-person-name">{t("name")}</Label>
          <Input
            id="opportunity-person-name"
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(event) => updateForm({ name: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="opportunity-person-role">{t("role")}</Label>
          <Select
            id="opportunity-person-role"
            name="role"
            required
            value={form.role}
            onChange={(event) =>
              updateForm({
                role: event.target.value as OpportunityPersonRole | "",
              })
            }
          >
            <option value="">{t("selectRole")}</option>
            {OPPORTUNITY_PERSON_ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {rolesT(option)}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="opportunity-person-title">{t("jobTitle")}</Label>
            <Input
              id="opportunity-person-title"
              name="jobTitle"
              autoComplete="organization-title"
              value={form.jobTitle}
              onChange={(event) => updateForm({ jobTitle: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opportunity-person-organization">
              {t("organization")}
            </Label>
            <Input
              id="opportunity-person-organization"
              name="organization"
              autoComplete="organization"
              value={form.organization}
              onChange={(event) =>
                updateForm({ organization: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opportunity-person-email">{t("email")}</Label>
            <Input
              id="opportunity-person-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateForm({ email: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opportunity-person-phone">{t("phone")}</Label>
            <Input
              id="opportunity-person-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => updateForm({ phone: event.target.value })}
            />
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="flex w-full items-center justify-between text-sm font-medium text-text-main">
            <span className="inline-flex items-center gap-2">
              <Link2 className="size-4 text-text-muted" />
              {t("links")}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  links: [
                    ...current.links,
                    { key: crypto.randomUUID(), url: "", label: "" },
                  ],
                }))
              }
            >
              <Plus />
              {t("addLink")}
            </Button>
          </legend>
          {form.links.map((link, index) => (
            <div key={link.key} className="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-line bg-panel-subtle p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`opportunity-person-link-url-${link.key}`}>
                    {t("linkUrl", { number: index + 1 })}
                  </Label>
                  <Input
                    id={`opportunity-person-link-url-${link.key}`}
                    type="text"
                    autoComplete="url"
                    required
                    value={link.url}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        links: current.links.map((item) =>
                          item.key === link.key
                            ? { ...item, url: event.target.value }
                            : item,
                        ),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`opportunity-person-link-label-${link.key}`}>
                    {t("linkLabel", { number: index + 1 })}
                  </Label>
                  <Input
                    id={`opportunity-person-link-label-${link.key}`}
                    placeholder={t("linkLabelPlaceholder")}
                    value={link.label}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        links: current.links.map((item) =>
                          item.key === link.key
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      }))
                    }
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="mt-6 text-danger-text hover:text-danger-text"
                aria-label={t("removeLink", { number: index + 1 })}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    links: current.links.filter(
                      (item) => item.key !== link.key,
                    ),
                  }))
                }
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="opportunity-person-notes">{t("notes")}</Label>
          <Textarea
            id="opportunity-person-notes"
            name="notes"
            rows={5}
            placeholder={t("notesPlaceholder")}
            value={form.notes}
            onChange={(event) => updateForm({ notes: event.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-line bg-panel-subtle px-5 py-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t("saving") : person ? t("save") : t("create")}
        </Button>
      </div>
    </form>
  );
}

"use client";

import {
  ExternalLink,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  LabelBadge,
  LABEL_BADGE_SIZES,
  LABEL_BADGE_TONES,
} from "@/frontend/components/shared/label-badge";
import { Button } from "@/frontend/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import type { OpportunityPersonResponse } from "../../../api/opportunity-people-api";

interface OpportunityPersonCardProps {
  person: OpportunityPersonResponse;
  onEdit: (person: OpportunityPersonResponse) => void;
  onDelete: (person: OpportunityPersonResponse) => void;
  onPrepareConversation: (person: OpportunityPersonResponse) => void;
}

function linkName(
  link: OpportunityPersonResponse["links"][number],
  fallback: string,
): string {
  if (link.label) return link.label;
  try {
    return new URL(link.url).hostname.replace(/^www\./, "");
  } catch {
    return fallback;
  }
}

export function OpportunityPersonCard({
  person,
  onEdit,
  onDelete,
  onPrepareConversation,
}: OpportunityPersonCardProps) {
  const t = useTranslations("analysisDetail.people");
  const initials = person.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const subtitle = [person.jobTitle, person.organization]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="relative min-h-64 border border-line/80 bg-panel-base shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-line-default hover:shadow-md">
      <CardHeader className="grid-cols-[auto_1fr_auto] items-start gap-x-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-info/[0.09] font-heading text-sm font-semibold text-info-text ring-1 ring-info-border/50">
          {initials}
        </div>
        <div className="min-w-0 pt-0.5">
          <CardTitle className="truncate text-base text-text-main">
            {person.name}
          </CardTitle>
          {subtitle ? (
            <p className="mt-1 truncate text-xs text-text-muted">{subtitle}</p>
          ) : null}
        </div>
        <CardAction className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("editPerson", { name: person.name })}
            onClick={() => onEdit(person)}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-danger-text hover:text-danger-text"
            aria-label={t("deletePerson", { name: person.name })}
            onClick={() => onDelete(person)}
          >
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <LabelBadge
          size={LABEL_BADGE_SIZES.XS}
          tone={LABEL_BADGE_TONES.INFO}
        >
          {t(`roles.${person.role}`)}
        </LabelBadge>

        {person.notes ? (
          <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-text-soft">
            {person.notes}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-2 text-xs text-text-muted">
          {person.email ? (
            <a className="inline-flex items-center gap-1.5 hover:text-text-main" href={`mailto:${person.email}`}>
              <Mail className="size-3.5" />
              {person.email}
            </a>
          ) : null}
          {person.phone ? (
            <a className="inline-flex items-center gap-1.5 hover:text-text-main" href={`tel:${person.phone}`}>
              <Phone className="size-3.5" />
              {person.phone}
            </a>
          ) : null}
          {person.links.map((link) => (
            <a
              key={link.url}
              className="inline-flex items-center gap-1.5 hover:text-text-main"
              href={link.url}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-3.5" />
              {linkName(link, t("linkFallback"))}
            </a>
          ))}
        </div>
      </CardContent>

      <CardFooter className="bg-panel-subtle/70">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-info-text hover:text-info-text"
          onClick={() => onPrepareConversation(person)}
        >
          <MessageCircle />
          {t("prepareConversation")}
        </Button>
      </CardFooter>
    </Card>
  );
}

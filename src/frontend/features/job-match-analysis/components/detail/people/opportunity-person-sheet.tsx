"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/frontend/components/ui/sheet";
import type {
  OpportunityPersonInput,
  OpportunityPersonResponse,
} from "../../../api/opportunity-people-api";
import { OpportunityPersonForm } from "./opportunity-person-form";

interface OpportunityPersonSheetProps {
  open: boolean;
  person: OpportunityPersonResponse | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: OpportunityPersonInput) => Promise<void>;
}

export function OpportunityPersonSheet({
  open,
  person,
  isSaving,
  onOpenChange,
  onSubmit,
}: OpportunityPersonSheetProps) {
  const t = useTranslations("analysisDetail.people.form");
  const commonT = useTranslations("common.actions");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        closeLabel={commonT("close")}
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:md:max-w-xl"
      >
        <SheetHeader className="border-b border-line px-5 py-4">
          <SheetTitle>
            {person ? t("editTitle") : t("createTitle")}
          </SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>
        <OpportunityPersonForm
          key={person?.id ?? "new-person"}
          person={person}
          isSaving={isSaving}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}

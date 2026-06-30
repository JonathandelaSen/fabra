"use client";

import { useState } from "react";
import { Plus, UserRound, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useConfirm } from "@/frontend/components/shared/confirm-provider";
import { Button } from "@/frontend/components/ui/button";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import type {
  OpportunityPersonInput,
  OpportunityPersonResponse,
} from "../../../api/opportunity-people-api";
import { useOpportunityPeople } from "../../../hooks/use-opportunity-people";
import { OpportunityPersonCard } from "./opportunity-person-card";
import { OpportunityPersonSheet } from "./opportunity-person-sheet";

interface TabPeopleProps {
  analysisId: string;
  onPrepareConversation: (name: string) => void;
}

export function TabPeople({
  analysisId,
  onPrepareConversation,
}: TabPeopleProps) {
  const t = useTranslations("analysisDetail.people");
  const confirm = useConfirm();
  const people = useOpportunityPeople(analysisId);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPerson, setEditingPerson] =
    useState<OpportunityPersonResponse | null>(null);

  const openCreate = () => {
    setEditingPerson(null);
    setIsSheetOpen(true);
  };

  const openEdit = (person: OpportunityPersonResponse) => {
    setEditingPerson(person);
    setIsSheetOpen(true);
  };

  const savePerson = async (input: OpportunityPersonInput) => {
    try {
      if (editingPerson) {
        await people.updatePerson.mutateAsync({
          personId: editingPerson.id,
          input,
        });
      } else {
        await people.createPerson.mutateAsync(input);
      }
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Could not save opportunity person", error);
      alert(t("form.saveFailed"));
    }
  };

  const deletePerson = async (person: OpportunityPersonResponse) => {
    if (!(await confirm({ title: t("deleteConfirm", { name: person.name }) }))) {
      return;
    }
    try {
      await people.deletePerson.mutateAsync(person.id);
    } catch (error) {
      console.error("Could not delete opportunity person", error);
      alert(t("deleteFailed"));
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-panel-base p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-info/[0.08] text-info-text ring-1 ring-info-border/50">
            <UsersRound className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-text-main">
              {t("title")}
            </h2>
          </div>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus />
          {t("add")}
        </Button>
      </div>

      {people.query.isPending ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label={t("loading")}>
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : people.query.isError ? (
        <div className="mt-6 rounded-xl border border-danger-border bg-danger/[0.05] p-4 text-sm text-danger-text">
          {t("loadFailed")}
        </div>
      ) : people.query.data?.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {people.query.data.map((person) => (
            <OpportunityPersonCard
              key={person.id}
              person={person}
              onEdit={openEdit}
              onDelete={deletePerson}
              onPrepareConversation={(selected) =>
                onPrepareConversation(selected.name)
              }
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel-subtle px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-panel-base text-text-muted ring-1 ring-line">
            <UserRound className="size-5" />
          </div>
          <h3 className="mt-4 font-heading text-base font-semibold text-text-main">
            {t("emptyTitle")}
          </h3>
          <p className="mt-1 max-w-md text-sm text-text-muted">
            {t("emptyDescription")}
          </p>
        </div>
      )}

      <OpportunityPersonSheet
        open={isSheetOpen}
        person={editingPerson}
        isSaving={people.isSaving}
        onOpenChange={setIsSheetOpen}
        onSubmit={savePerson}
      />
    </section>
  );
}

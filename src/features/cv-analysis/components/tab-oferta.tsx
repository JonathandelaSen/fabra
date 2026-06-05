"use client";

import { motion } from "framer-motion";
import { ListChecks, Briefcase, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { JobKeyData } from "@/lib/analysis-types";
import { BasicPanel } from "@/components/shared/basic-panel";

interface TabOfertaProps {
  jobKeyData: JobKeyData | null;
  jobDescription: string | null;
}

export default function TabOferta({
  jobKeyData,
  jobDescription,
}: TabOfertaProps) {
  const t = useTranslations("analysisDetail.offer");

  return (
    <div className="space-y-6">
      {jobKeyData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BasicPanel className="p-6">
          <h4 className="text-sm font-semibold text-sky-300 flex items-center gap-2 mb-4">
            <ListChecks className="w-4 h-4" />
            {t("keyData")}
          </h4>
          <div className="grid gap-3 md:grid-cols-3">
            {(
              [
                [t("title"), jobKeyData.title],
                [t("company"), jobKeyData.company],
                [t("location"), jobKeyData.location],
                [t("remote"), jobKeyData.remote],
                [t("salary"), jobKeyData.salary],
                [t("seniority"), jobKeyData.seniority],
                [t("contractType"), jobKeyData.contractType],
              ] as Array<[string, string | null | undefined]>
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-line bg-field p-3"
              >
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-faint">
                  {label}
                </p>
                <p className="mt-1 text-sm sm:text-base text-zinc-200">
                  {value || t("notSpecified")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(
              [
                [t("requirements"), jobKeyData.requirements],
                [t("responsibilities"), jobKeyData.responsibilities],
                [t("benefits"), jobKeyData.benefits],
                [t("notablePoints"), jobKeyData.notablePoints],
              ] as Array<[string, string[] | undefined]>
            ).map(([label, values]) => {
              const list = Array.isArray(values) ? values : [];
              return (
                <div
                  key={label}
                  className="rounded-xl border border-line bg-field p-4"
                >
                  <p className="mb-3 text-xs sm:text-sm font-semibold text-zinc-200">
                    {label}
                  </p>
                  {list.length > 0 ? (
                    <ul className="space-y-2">
                      {list.map((item, index) => (
                        <li
                          key={`${item}-${index}`}
                          className="flex gap-2 text-xs sm:text-sm text-zinc-300"
                        >
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-sky-400/70" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs sm:text-sm italic text-text-faint">{t("notSpecified")}.</p>
                  )}
                </div>
              );
            })}
          </div>
        </BasicPanel>
      </motion.div>
      )}

      {jobDescription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-6"
        >
          <Accordion>
            <AccordionItem className="border-none">
              <AccordionTrigger className="py-0 hover:no-underline">
                <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t("fullDescription")}
                </h4>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="text-sm sm:text-base text-zinc-300 bg-field rounded-xl p-4 border border-line whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {jobDescription}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      )}
    </div>
  );
}

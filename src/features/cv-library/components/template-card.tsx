"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { CVTemplateDefinition } from "@/lib/cv-templates";
import CVTemplatePreview from "./cv-template-preview";

interface TemplateCardProps {
  template: CVTemplateDefinition;
  onSelect: (template: CVTemplateDefinition) => void;
}

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const t = useTranslations("analysisFlow.templates");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-all hover:border-teal-500/30 hover:bg-white/[0.04]"
    >
      <div className="w-full bg-zinc-900 p-6 sm:p-8 flex items-center justify-center">
        <svg
          className="w-full h-auto max-w-full rounded-sm shadow-2xl transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          viewBox="0 0 794 1123"
          preserveAspectRatio="xMidYMid meet"
        >
          <foreignObject width="794" height="1123">
            <div className="w-[794px] h-[1123px] bg-white overflow-hidden">
              <CVTemplatePreview
                profile={template.fixtureProfile}
                templateId={template.templateId}
                locale="es"
              />
            </div>
          </foreignObject>
        </svg>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold text-white">{template.name}</h3>
        <p className="mt-2 text-sm text-zinc-400">{template.description}</p>
        <div className="mt-auto pt-6">
          <Button
            onClick={() => onSelect(template)}
            className="w-full bg-white text-black hover:bg-zinc-200"
          >
            {t("useTemplate")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

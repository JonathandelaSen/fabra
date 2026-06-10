import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

interface MetricsWindowFilterProps {
  days: number | null;
  onChange: (days: number | null) => void;
}

export function MetricsWindowFilter({ days, onChange }: MetricsWindowFilterProps) {
  const t = useTranslations("admin.dashboard");
  const value = days === null ? "all" : String(days);

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v === "all" ? null : Number(v))}>
      <TabsList className="bg-foreground/5 p-1 rounded-xl">
        <TabsTrigger value="all" className="px-4 py-1.5 text-xs rounded-lg">{t("windowAll")}</TabsTrigger>
        <TabsTrigger value="7" className="px-4 py-1.5 text-xs rounded-lg">{t("window7")}</TabsTrigger>
        <TabsTrigger value="30" className="px-4 py-1.5 text-xs rounded-lg">{t("window30")}</TabsTrigger>
        <TabsTrigger value="90" className="px-4 py-1.5 text-xs rounded-lg">{t("window90")}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

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
      <TabsList>
        <TabsTrigger value="all">{t("windowAll")}</TabsTrigger>
        <TabsTrigger value="7">{t("window7")}</TabsTrigger>
        <TabsTrigger value="30">{t("window30")}</TabsTrigger>
        <TabsTrigger value="90">{t("window90")}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

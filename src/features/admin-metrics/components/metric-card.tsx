import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface MetricCardProps {
  label: string;
  total: number | undefined;
  windowCount: number | undefined;
  windowDays: number | null;
}

export function MetricCard({ label, total, windowCount, windowDays }: MetricCardProps) {
  const t = useTranslations("admin.dashboard");
  return (
    <Card className="p-4 flex flex-col gap-1">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{total ?? "-"}</div>
      {windowDays !== null && windowCount !== undefined && (
        <div className="text-xs text-muted-foreground mt-1">
          {windowCount >= 0 ? "+" : ""}{t("windowDelta", { count: windowCount, days: windowDays })}
        </div>
      )}
    </Card>
  );
}

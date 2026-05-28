export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getScoreColor(score: number) {
  if (score >= 80)
    return {
      text: "text-emerald-400",
      stroke: "stroke-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    };
  if (score >= 60)
    return {
      text: "text-amber-400",
      stroke: "stroke-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    };
  return {
    text: "text-rose-400",
    stroke: "stroke-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  };
}

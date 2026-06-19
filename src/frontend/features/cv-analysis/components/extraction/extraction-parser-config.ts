export type ParserTab = "python" | "pdfjs" | "node";

export const PARSERS: {
  key: ParserTab;
  labelKey: string;
  descriptionKey: ParserTab;
  color: string;
  badgeKey: string;
  badgeColor: string;
}[] = [
  {
    key: "python",
    labelKey: "parserLabels.python",
    descriptionKey: "python",
    color: "bg-emerald-500",
    badgeKey: "parserBadges.python",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    key: "pdfjs",
    labelKey: "parserLabels.pdfjs",
    descriptionKey: "pdfjs",
    color: "bg-sky-500",
    badgeKey: "parserBadges.pdfjs",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  {
    key: "node",
    labelKey: "parserLabels.node",
    descriptionKey: "node",
    color: "bg-amber-500",
    badgeKey: "parserBadges.node",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
];

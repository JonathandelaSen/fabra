interface SectionGroupHeaderProps {
  label: string;
  count?: number;
  className?: string;
}

export function SectionGroupHeader({
  label,
  count,
  className = "",
}: SectionGroupHeaderProps) {
  return (
    <div
      className={`mb-2.5 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ${className}`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="rounded-full bg-white/[0.04] border border-white/[0.02] px-2 py-0.5 text-zinc-400">
          {count}
        </span>
      )}
    </div>
  );
}

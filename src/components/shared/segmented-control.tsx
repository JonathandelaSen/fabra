"use client";

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex rounded-lg border border-white/[0.06] bg-white/[0.035] p-1 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            value === option.value
              ? "bg-white/[0.10] text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-1 text-zinc-600">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}

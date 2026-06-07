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
      role="group"
      className={`flex rounded-lg border border-line bg-panel-control p-1 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            value === option.value
              ? "bg-panel-base text-text-main shadow-sm"
              : "text-text-muted hover:text-text-soft"
          }`}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-1 text-text-faint">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}

import React from "react";
import { X } from "lucide-react";

interface EducationalBannerProps {
  title: React.ReactNode;
  description: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBgColor?: string;
  bgColor?: string;
  borderColor?: string;
  shadowColor?: string;
  onClose?: () => void;
  cta?: React.ReactNode;
}

export default function EducationalBanner({
  title,
  description,
  icon: Icon,
  iconColor = "text-indigo-400",
  iconBgColor = "bg-indigo-500/10",
  bgColor = "bg-indigo-500/[0.03]",
  borderColor = "border-indigo-500/10",
  shadowColor = "shadow-[0_0_15px_rgba(99,102,241,0.03)]",
  onClose,
  cta,
}: EducationalBannerProps) {
  return (
    <div
      className={`shrink-0 w-full p-4 rounded-2xl ${bgColor} border ${borderColor} ${shadowColor} backdrop-blur-sm flex gap-3 relative group`}
    >
      {Icon && (
        <div className={`w-8 h-8 rounded-lg ${iconBgColor} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      )}
      <div className="flex-1 min-w-0 pr-6">
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
          {description}
        </p>
        {cta && <div className="mt-3">{cta}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-200"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

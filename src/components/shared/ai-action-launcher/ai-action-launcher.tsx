"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import AIActionLauncherHeader from "./ai-action-launcher-header";
import AIActionLauncherIntegrated from "./ai-action-launcher-integrated";
import AIActionLauncherCopyPaste from "./ai-action-launcher-copy-paste";

export interface AIModelOption {
  id: string;
  label: string;
  provider?: string;
  badge?: string;
  disabled?: boolean;
}

export interface AIActionLauncherProps {
  actionLabel: string;
  integrated: {
    available: boolean;
    selectedModelId: string;
    models: AIModelOption[];
    onModelChange: (modelId: string) => void;
    onRun: () => void;
    unavailableReason?: string;
    onConfigure?: () => void;
  };
  copyPaste: {
    available: boolean;
    onOpenFlow: () => void;
    unavailableReason?: string;
  };
  loading?: boolean;
  disabled?: boolean;
}

export default function AIActionLauncher({
  actionLabel,
  integrated,
  copyPaste,
  loading = false,
  disabled = false,
}: AIActionLauncherProps) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={loading || disabled}
        className="w-fit flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-950/30 hover:shadow-indigo-900/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{actionLabel}...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4.5 h-4.5 text-indigo-200 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
            <span>{actionLabel}</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70 group-hover:translate-y-0.5 transition-transform duration-300" />
          </>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] xs:w-[380px] p-0 overflow-hidden bg-[#0c0c16]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/80 animate-in fade-in-0 zoom-in-95 duration-200"
      >
        <AIActionLauncherHeader />

        <div className="p-4 flex flex-col gap-3">
          <AIActionLauncherIntegrated
            available={integrated.available}
            selectedModelId={integrated.selectedModelId}
            models={integrated.models}
            onModelChange={integrated.onModelChange}
            onRun={integrated.onRun}
            unavailableReason={integrated.unavailableReason}
            onConfigure={integrated.onConfigure}
            onClose={handleClose}
          />

          {copyPaste.available && (
            <AIActionLauncherCopyPaste
              onOpenFlow={copyPaste.onOpenFlow}
              onClose={handleClose}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

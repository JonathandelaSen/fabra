import React from "react";
import { Settings2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface ActivityContextSelectorProps {
  id?: string;
  label?: string;
  manageLabel: string;
  value: string;
  onChange: (value: string) => void;
  contexts: Array<{ id: string; name: string }>;
  onManageClick: () => void;
}

export function ActivityContextSelector({
  id,
  label,
  manageLabel,
  value,
  onChange,
  contexts,
  onManageClick,
}: ActivityContextSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-zinc-400">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-2">
        <Select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {contexts.map((ctx) => (
            <option key={ctx.id} value={ctx.id} className="bg-[#101018] text-zinc-100">
              {ctx.name}
            </option>
          ))}
        </Select>
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onManageClick}
            className="px-0 text-xs text-zinc-500 hover:bg-transparent hover:text-indigo-300"
          >
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            {manageLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

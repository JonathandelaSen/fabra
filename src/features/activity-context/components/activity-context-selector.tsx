import React from "react";
import { Settings2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";

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
        <label htmlFor={id} className="text-xs font-semibold text-text-muted">
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
            <option key={ctx.id} value={ctx.id} className="bg-panel-elevated text-text-on-bright">
              {ctx.name}
            </option>
          ))}
        </Select>
        <div>
          <IconTextButton
            icon={Settings2}
            onClick={onManageClick}
          >
            {manageLabel}
          </IconTextButton>
        </div>
      </div>
    </div>
  );
}

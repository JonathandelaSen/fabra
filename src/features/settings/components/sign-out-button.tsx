"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { IconTextButton } from "@/components/shared/action-buttons";

interface SignOutButtonProps {
  label: string;
  pendingLabel: string;
}

export function SignOutButton({ label, pendingLabel }: SignOutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <IconTextButton
      type="submit"
      icon={LogOut}
      strong
      loading={pending}
      className="h-10"
    >
      {pending ? pendingLabel : label}
    </IconTextButton>
  );
}

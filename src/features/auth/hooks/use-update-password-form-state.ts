"use client";

import { useActionState } from "react";
import {
  updatePasswordFromRecovery,
  type AuthFormState,
} from "../api/auth-actions";

const INITIAL_STATE: AuthFormState = {};

export function useUpdatePasswordFormState() {
  const [state, action, pending] = useActionState(
    updatePasswordFromRecovery,
    INITIAL_STATE,
  );

  return {
    action,
    pending,
    state,
  };
}

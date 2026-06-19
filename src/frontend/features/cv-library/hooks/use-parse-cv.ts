"use client";

import { useState } from "react";
import { parseCVDocument } from "../api/cv-library-api";
import { getErrorMessage } from "@/lib/errors";

export function useParseCV(onSuccess: (id: string) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await parseCVDocument(file);
      onSuccess(data.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return { parse, loading, error, setError };
}

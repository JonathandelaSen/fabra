"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/frontend/components/shared/search-input";

interface CVLibrarySearchInputProps {
  searchQuery: string;
  onChange: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function CVLibrarySearchInput({
  searchQuery,
  onChange,
  inputRef,
}: CVLibrarySearchInputProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  return (
    <SearchInput
      value={searchQuery}
      onChange={onChange}
      placeholder={t("searchPlaceholder")}
      inputRef={inputRef}
    />
  );
}

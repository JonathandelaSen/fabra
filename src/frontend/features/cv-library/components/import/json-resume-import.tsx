"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FileJson, Upload, ClipboardPaste, Loader2, AlertTriangle } from "lucide-react";
import { useImportJsonResume } from "../../hooks/use-import-json-resume";

type Tab = "upload" | "paste";

interface JsonResumeImportProps {
  onSuccess?: (cvId?: string) => void;
}

export function JsonResumeImport({ onSuccess }: JsonResumeImportProps) {
  const t = useTranslations("jsonResumeImport");
  const [tab, setTab] = useState<Tab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pasteContent, setPasteContent] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useImportJsonResume();

  const tryParseName = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed?.basics?.name && !name) setName(parsed.basics.name);
    } catch {
      // ignore parse errors during typing
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.endsWith(".json")) {
      setLocalError(t("errors.invalidFile"));
      return;
    }
    if (selected.size > 1024 * 1024) {
      setLocalError(t("errors.fileTooLarge"));
      return;
    }
    setFile(selected);
    setLocalError(null);
    selected.text().then((content) => tryParseName(content));
  };

  const handleSubmit = async () => {
    setLocalError(null);
    setWarnings([]);

    let jsonContent: string;
    let filename: string | undefined;

    if (tab === "upload") {
      if (!file) return;
      jsonContent = await file.text();
      filename = file.name;
    } else {
      if (!pasteContent.trim()) return;
      jsonContent = pasteContent;
    }

    try {
      const result = await mutation.mutateAsync({
        jsonContent,
        name: name || undefined,
        filename,
      });
      setWarnings(result.warnings);
      onSuccess?.(result.document?.id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t("errors.invalidJson"));
    }
  };

  const canSubmit =
    !mutation.isPending && (tab === "upload" ? !!file : !!pasteContent.trim());

  return (
    <div className="grid gap-4">
      <div className="flex gap-1 rounded-lg bg-panel-elevated/50 p-1">
        <button
          onClick={() => setTab("upload")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === "upload"
              ? "bg-panel-control text-text-on-bright"
              : "text-text-muted hover:text-text-soft"
          }`}
        >
          <Upload className="h-4 w-4" />
          {t("tabs.upload")}
        </button>
        <button
          onClick={() => setTab("paste")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === "paste"
              ? "bg-panel-control text-text-on-bright"
              : "text-text-muted hover:text-text-soft"
          }`}
        >
          <ClipboardPaste className="h-4 w-4" />
          {t("tabs.paste")}
        </button>
      </div>

      {tab === "upload" ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-line-default/60 p-8 text-center transition-colors hover:border-line-strong/80 hover:bg-panel/[0.02]"
        >
          <FileJson className="h-10 w-10 text-text-muted" />
          <div>
            <p className="text-sm font-medium text-text-soft">
              {file ? file.name : t("uploadArea.drop")}
            </p>
            <p className="text-xs text-text-muted">
              {file
                ? `${(file.size / 1024).toFixed(1)} KB`
                : t("uploadArea.click")}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <textarea
          value={pasteContent}
          onChange={(e) => {
            setPasteContent(e.target.value);
            tryParseName(e.target.value);
          }}
          placeholder={t("pasteArea.placeholder")}
          rows={8}
          className="w-full rounded-xl border border-line-default bg-panel-elevated/50 px-4 py-3 text-sm text-text-soft placeholder:text-text-faint focus:border-action-border/40 focus:outline-none focus:ring-1 focus:ring-action-border"
        />
      )}

      <div className="grid gap-1.5">
        <label className="text-xs font-medium text-text-muted">
          {t("nameLabel")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="rounded-lg border border-line-default bg-panel-elevated/50 px-3 py-2 text-sm text-text-soft placeholder:text-text-faint focus:border-action-border/40 focus:outline-none focus:ring-1 focus:ring-action-border"
        />
      </div>

      {localError && (
        <p className="text-sm text-danger-text">{localError}</p>
      )}

      {warnings.length > 0 && (
        <div className="rounded-lg border border-warning-border bg-warning/5 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-warning-text">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t("warnings.title")}
          </p>
          <ul className="list-inside list-disc text-xs text-warning-text/80">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
          canSubmit
            ? "bg-gradient-to-r from-action to-action-hover text-text-on-dark hover:from-action-hover hover:to-action"
            : "bg-panel-control/60 text-text-muted cursor-not-allowed"
        }`}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("importing")}
          </>
        ) : (
          <>
            <FileJson className="h-4 w-4" />
            {t("submit")}
          </>
        )}
      </button>
    </div>
  );
}

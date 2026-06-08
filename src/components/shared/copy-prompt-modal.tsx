"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";

interface CopyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  promptContent?: string;
}

export function CopyPromptModal({
  isOpen,
  onClose,
  title = "Prompt copied!",
  message = "You can now paste it into ChatGPT, Claude, or your favorite AI to generate the result.",
  promptContent,
}: CopyPromptModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleCopyAndClose = async () => {
    if (promptContent) {
      await copyToClipboard(promptContent);
    }
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
      onClose();
    }, 750);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-scrim-soft backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-0 top-0 sm:left-1/2 sm:top-1/2 z-50 h-full w-full sm:h-auto sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 overflow-hidden rounded-none sm:rounded-xl border-0 sm:border border-line-default bg-panel-elevated p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-md text-text-muted hover:text-text-soft z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center text-center h-full max-sm:justify-between sm:block">
              <div className="w-full max-sm:flex-1 max-sm:flex max-sm:flex-col max-sm:justify-center max-sm:min-h-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success-text mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text-main">{title}</h3>
                <p className="mb-4 text-sm text-text-muted">{message}</p>
                
                {promptContent && (
                  <div className="mb-6 w-full text-left max-sm:flex-1 max-sm:min-h-0 max-sm:flex max-sm:flex-col">
                    <div className="max-h-80 max-sm:max-h-none max-sm:flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-line bg-field-code p-4 text-sm font-mono text-text-soft">
                      {promptContent}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleCopyAndClose}
                disabled={isCopied}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-panel-active px-4 py-2.5 text-sm font-medium text-text-soft transition-colors hover:bg-line-strong disabled:opacity-80 mt-auto sm:mt-0"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-success-text" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {isCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

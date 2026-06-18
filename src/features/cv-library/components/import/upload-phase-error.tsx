"use client";

import { motion } from "framer-motion";

interface UploadPhaseErrorProps {
  error: string;
}

export function UploadPhaseError({ error }: UploadPhaseErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-4 px-4 py-3 rounded-xl bg-danger-soft border border-danger-border text-danger-text text-sm"
    >
      {error}
    </motion.div>
  );
}

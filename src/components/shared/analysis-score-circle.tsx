"use client";

import { motion } from "framer-motion";

interface AnalysisScoreCircleProps {
  score: number;
  textClassName: string;
  strokeClassName: string;
}

export default function AnalysisScoreCircle({
  score,
  textClassName,
  strokeClassName,
}: AnalysisScoreCircleProps) {
  return (
    <div className="relative shrink-0 w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          className="fill-none stroke-line-strong/[0.06]"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          className={`fill-none ${strokeClassName}`}
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ strokeDasharray: "0 264" }}
          animate={{ strokeDasharray: `${score * 2.64} 264` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`text-4xl font-black ${textClassName}`}
        >
          {score}
        </motion.span>
        <span className="text-text-muted text-[10px] font-semibold tracking-wider mt-0.5">
          / 100
        </span>
      </div>
    </div>
  );
}

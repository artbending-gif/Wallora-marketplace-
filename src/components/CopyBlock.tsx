"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyBlock({
  command,
  label,
}: {
  command: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="my-3">
      {label && (
        <p className="mb-1 text-[11px] font-bold tracking-wide text-paper/50 uppercase">
          {label}
        </p>
      )}
      <div className="group flex items-center gap-3 rounded-lg border border-paper/15 bg-black/40 px-4 py-3">
        <code className="flex-1 overflow-x-auto font-mono text-sm text-mint whitespace-pre">
          {command}
        </code>
        <button
          onClick={copy}
          aria-label="Copy command"
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-paper/20 px-2.5 py-1.5 text-xs font-bold text-paper/80 transition-colors hover:border-butter hover:text-butter"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-mint" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
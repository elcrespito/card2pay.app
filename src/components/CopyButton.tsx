"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
  className = "btn-ghost",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      {copied ? "Copied!" : label}
    </button>
  );
}

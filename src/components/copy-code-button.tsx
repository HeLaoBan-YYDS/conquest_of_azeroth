"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

function copyWithFallback(value: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value).catch(() => copyWithTextarea(value));
  }

  copyWithTextarea(value);

  return Promise.resolve();
}

function copyWithTextarea(value: string) {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

export function CopyCodeButton({
  code,
  copyLabel = "Copy code",
  copiedLabel = "Copied",
  className,
}: {
  code: string;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = copied ? Check : Copy;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    await copyWithFallback(code);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      aria-label={`${copied ? copiedLabel : copyLabel}: ${code}`}
      title={`${copied ? copiedLabel : copyLabel}: ${code}`}
      onClick={handleCopy}
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-lg bg-background px-3 py-1.5 text-left font-mono text-sm font-bold text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        copied && "text-emerald-600 dark:text-emerald-400",
        className,
      )}
    >
      <code className="min-w-0 break-all bg-transparent p-0 font-inherit text-inherit">{code}</code>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </button>
  );
}

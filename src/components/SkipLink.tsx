"use client";

export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-foreground focus:text-background rounded"
    >
      Skip to content
    </a>
  );
}



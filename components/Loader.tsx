"use client";

import * as React from "react";

type LoaderProps = {
  fullScreen?: boolean;
  colorClassName?: string;
  className?: string;
  sizeClassName?: string; // lets you override h/w if you want
};

export default function Loader({
  fullScreen = false,
  colorClassName = "text-white/80",
  className = "",
  sizeClassName = "h-6 w-6",
}: LoaderProps) {
  const spinner = (
    <svg
      role="status"
      aria-label="Loading"
      className={`${sizeClassName} animate-spin ${colorClassName} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
      />
    </svg>
  );

  if (!fullScreen) return spinner;

  return <div className="grid min-h-screen place-items-center">{spinner}</div>;
}

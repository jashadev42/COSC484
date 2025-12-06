// src/components/icons/SettingsIcon.jsx
import React from "react";

export default function SettingsIcon({ filled = false, className = "" }) {
  const fill = filled ? "white" : "none";
  const stroke = filled ? "white" : "currentColor";

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82L4.21 7.1a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.91 4.6 1.65 1.65 0 0 0 9.9 3.09V3a2 2 0 0 1 4 0v.09c0 .67.39 1.27 1 1.51.45.19.97.12 1.38-.18l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.67 0 1.27.39 1.51 1H21a2 2 0 0 1 0 4h-.09c-.72 0-1.33.39-1.51 1z" />
    </svg>
  );
}

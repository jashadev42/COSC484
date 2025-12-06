// src/components/icons/UserIcon.jsx
import React from "react";

export default function UserIcon({ filled = false, className = "" }) {
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
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-3 3.8-4.5 7-4.5s5.5 1.5 7 4.5" />
    </svg>
  );
}

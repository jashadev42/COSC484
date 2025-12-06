// src/components/icons/ChatIcon.jsx
import React from "react";

export default function ChatIcon({ filled = false, className = "" }) {
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
      <path d="M5 4h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

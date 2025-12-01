// src/components/icons/SparkIcon.jsx
import React from "react";

export default function SparkIcon({ filled = false, className = "" }) {
  const fill = filled ? "#fbbf24" : "none";
  const stroke = filled ? "#fbbf24" : "currentColor";

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
      <path d="M10 2L4 13h5l-1 9 6-11h-5l1-9z" />
    </svg>
  );
}

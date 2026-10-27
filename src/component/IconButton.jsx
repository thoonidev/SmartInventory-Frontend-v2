import React from "react";

const icons = {
  add: "M12 5v14M5 12h14",
  edit: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3zM14 6l4 4",
  delete: "M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13",
  view: "M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
  clear: "M6 6l12 12M18 6L6 18",
  save: "M5 4h12l2 2v14H5V4zM8 4v6h8V4M8 20v-6h8v6",
  cancel: "M6 6l12 12M18 6L6 18",
  back: "M15 18l-6-6 6-6",
  approve: "M5 13l4 4L19 7",
  reject: "M6 6l12 12M18 6L6 18",
  previous: "M15 18l-6-6 6-6",
  next: "M9 18l6-6-6-6",
  refresh: "M20 12a8 8 0 0 1-14 5M4 12a8 8 0 0 1 14-5M18 3v4h-4M6 21v-4h4",
  download: "M12 3v12M7 10l5 5 5-5M5 21h14",
  user: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
};

const variants = {
  neutral: "border-[#cfd6e2] bg-white text-[#465366] hover:bg-[#f8fafc]",
  primary: "border-[#123c69] bg-[#123c69] text-white hover:bg-[#0d2d4f]",
  danger: "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c] hover:bg-[#ffecec]",
  success: "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73] hover:bg-[#e0f1ea]",
};

const IconButton = ({
  icon = "view",
  label,
  onClick,
  type = "button",
  variant = "neutral",
  disabled = false,
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    title={label}
    aria-label={label}
    disabled={disabled}
    className={`inline-grid h-9 w-9 place-items-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-50 ${
      variants[variant] || variants.neutral
    } ${className}`}
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[icon] || icons.view} />
    </svg>
  </button>
);

export default IconButton;

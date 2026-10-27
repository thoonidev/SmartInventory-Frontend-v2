import React, { useEffect, useRef, useState } from "react";

const SelectMenu = ({ label, value, options, onChange, status = "idle", required = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(([optionValue]) => String(optionValue) === String(value));
  const statusClass = {
    idle: "border-[#cfd6e2] focus:border-[#123c69] focus:ring-[#123c69]/10",
    error: "border-[#e58b8b] bg-[#fff8f8] focus:border-[#b42318] focus:ring-[#b42318]/10 saas-field-shake",
    success: "border-[#8cc8aa] bg-[#fbfffd] focus:border-[#2f6f73] focus:ring-[#2f6f73]/10",
  }[status] || "border-[#cfd6e2] focus:border-[#123c69] focus:ring-[#123c69]/10";

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <label className="relative block" ref={ref}>
      {label && (
        <span className="text-sm font-semibold text-[#344055]">
          {label}{required && <span className="ml-1 text-[#b42318]">*</span>}
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${label ? "mt-2 h-11" : "h-10"} flex w-full items-center justify-between rounded-md border px-3 text-left text-sm outline-none transition hover:bg-[#f8fafc] focus:ring-2 ${statusClass}`}
      >
        <span className="truncate">{selected?.[1] || "Seleccionar"}</span>
        <span className="text-[#647084]">v</span>
      </button>
      {open && (
        <div className={`absolute left-0 right-0 ${label ? "top-[76px]" : "top-11"} z-40 max-h-36 overflow-y-auto rounded-md border border-[#d8dee8] bg-white shadow-lg`}>
          {options.map(([optionValue, optionLabel]) => (
            <button
              key={optionValue || "empty"}
              type="button"
              onClick={() => {
                onChange(optionValue);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#f8fafc] ${
                String(optionValue) === String(value)
                  ? "bg-[#e8f1fb] font-bold text-[#123c69]"
                  : "text-[#344055]"
              }`}
            >
              {optionLabel}
            </button>
          ))}
        </div>
      )}
    </label>
  );
};

export default SelectMenu;

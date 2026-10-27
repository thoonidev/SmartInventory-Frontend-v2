import React, { useMemo, useState } from "react";
import SelectMenu from "./SelectMenu";

const stateStyles = {
  idle: "border-[#cfd6e2] focus:border-[#123c69] focus:ring-[#123c69]/10",
  error: "border-[#e58b8b] bg-[#fff8f8] focus:border-[#b42318] focus:ring-[#b42318]/10 saas-field-shake",
  success: "border-[#8cc8aa] bg-[#fbfffd] focus:border-[#2f6f73] focus:ring-[#2f6f73]/10",
};

const helperStyles = {
  idle: "text-[#647084]",
  error: "text-[#9b2c2c]",
  success: "text-[#2f6f73]",
};

const resolveState = ({ value, focused, required, validator, error }) => {
  if (!focused) return "idle";
  if (error) return "error";
  const hasValue = String(value ?? "").trim().length > 0;
  if (required && !hasValue) return "error";
  if (hasValue && validator && !validator(value)) return "error";
  if (hasValue && (required || validator) && (!validator || validator(value))) return "success";
  return "idle";
};

export const ValidatedField = ({
  label,
  value,
  onChange,
  required = false,
  validator,
  errorMessage,
  successMessage = "Correcto",
  hint = "",
  type = "text",
  className = "",
  inputClassName = "",
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const state = useMemo(
    () => resolveState({ value, focused, required, validator }),
    [value, focused, required, validator]
  );
  const helper = focused
    ? state === "error"
      ? errorMessage || "Revise este campo"
      : state === "success"
        ? successMessage
        : hint
    : "";

  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="text-sm font-semibold text-[#344055]">
          {label}{required && <span className="ml-1 text-[#b42318]">*</span>}
        </span>
      )}
      <input
        {...props}
        type={type}
        value={value ?? ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        aria-invalid={state === "error"}
        className={`mt-2 h-11 w-full rounded-md border px-3 text-sm outline-none transition focus:ring-2 ${stateStyles[state]} ${inputClassName}`}
      />
      {helper && (
        <p className={`mt-1 text-xs font-semibold transition ${helperStyles[state]}`}>
          {helper}
        </p>
      )}
    </label>
  );
};

export const ValidatedTextArea = ({
  label,
  value,
  onChange,
  required = false,
  validator,
  errorMessage,
  successMessage = "Correcto",
  hint = "",
  rows = 3,
  className = "",
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const state = useMemo(
    () => resolveState({ value, focused, required, validator }),
    [value, focused, required, validator]
  );
  const helper = focused
    ? state === "error"
      ? errorMessage || "Revise este campo"
      : state === "success"
        ? successMessage
        : hint
    : "";

  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="text-sm font-semibold text-[#344055]">
          {label}{required && <span className="ml-1 text-[#b42318]">*</span>}
        </span>
      )}
      <textarea
        {...props}
        rows={rows}
        value={value ?? ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        aria-invalid={state === "error"}
        className={`mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 ${stateStyles[state]}`}
      />
      {helper && (
        <p className={`mt-1 text-xs font-semibold transition ${helperStyles[state]}`}>
          {helper}
        </p>
      )}
    </label>
  );
};

export const ValidatedSelect = ({
  label,
  value,
  onChange,
  options,
  required = false,
  className = "",
}) => {
  return (
    <div className={className}>
      <SelectMenu label={label} value={value} onChange={onChange} options={options} status="idle" required={required} />
    </div>
  );
};

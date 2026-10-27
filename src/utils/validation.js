export const isBlank = (value) => String(value ?? "").trim().length === 0;

export const isPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

export const isNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};

export const isPeruvianRuc = (value) => /^(10|15|17|20)\d{9}$/.test(String(value).trim());

export const isPeruvianMobile = (value) =>
  /^(\+?51)?[\s-]?9\d{2}[\s-]?\d{3}[\s-]?\d{3}$/.test(String(value).trim());

export const isSku = (value) => /^[A-Za-z0-9._-]{2,30}$/.test(String(value).trim());

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());

export const firstValidationError = (rules) => {
  const failed = rules.find((rule) => !rule.valid);
  return failed?.message || "";
};

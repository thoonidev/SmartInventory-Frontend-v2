import ApiService from "../service/ApiService";

const planRank = {
  FREE: 0,
  BASIC: 1,
  PREMIUM: 2,
};

const featureRequirements = {
  reports: { plan: "BASIC", title: "Reportes PDF y Excel" },
  audit: { plan: "BASIC", title: "Auditoria" },
  live: { plan: "PREMIUM", title: "Centro operativo" },
  advancedKpis: { plan: "PREMIUM", title: "KPIs logisticos avanzados" },
};

export const getCurrentPlan = () => ApiService.getOrganization()?.plan || "FREE";

export const getFeatureRequirement = (feature) => featureRequirements[feature];

export const canUseFeature = (feature) => {
  const requirement = getFeatureRequirement(feature);
  if (!requirement) return true;
  return (planRank[getCurrentPlan()] ?? 0) >= (planRank[requirement.plan] ?? 0);
};

export const planLabel = (plan) => ({
  FREE: "Free",
  BASIC: "Basic",
  PREMIUM: "Premium",
}[plan] || plan);

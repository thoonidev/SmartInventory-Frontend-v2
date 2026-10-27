import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ApiService from "./ApiService";
import PlanUpgradeRequired from "../component/PlanUpgradeRequired";
import { canUseFeature } from "../utils/planAccess";

export const ProtectedRoute = ({ element }) => {
  const location = useLocation();
  return ApiService.isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export const AdminRoute = ({ element }) => {
  const location = useLocation();
  return ApiService.isAdmin() ? (
    element
  ) : (
    <Navigate to="/dashboard" replace state={{ from: location }} />
  );
};

export const ManagerRoute = ({ element }) => {
  const location = useLocation();
  return ApiService.isAdmin() || ApiService.isManager() ? (
    element
  ) : (
    <Navigate to="/dashboard" replace state={{ from: location }} />
  );
};

export const PlanFeatureRoute = ({ element, feature }) => {
  const location = useLocation();
  if (!ApiService.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return canUseFeature(feature) ? element : <PlanUpgradeRequired feature={feature} />;
};

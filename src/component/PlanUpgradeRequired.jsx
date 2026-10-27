import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { getCurrentPlan, getFeatureRequirement, planLabel } from "../utils/planAccess";

const PlanUpgradeRequired = ({ feature }) => {
  const navigate = useNavigate();
  const requirement = getFeatureRequirement(feature);
  const currentPlan = getCurrentPlan();

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <section className="saas-surface p-8">
          <p className="saas-kicker">Funcion premium</p>
          <h1 className="saas-title mt-2">{requirement?.title || "Modulo premium"}</h1>
          <p className="mt-4 text-sm leading-6 text-[#647084]">
            Esta opcion esta visible para que conozcas lo que incluye SmartInventory, pero tu plan actual
            {` ${planLabel(currentPlan)} `}no la tiene activa. Para usarla necesitas el plan
            {` ${planLabel(requirement?.plan)} `}o superior.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="saas-button-primary h-11 px-5 text-sm"
            >
              Ver planes
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="saas-button-secondary h-11 px-5 text-sm"
            >
              Volver al panel
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PlanUpgradeRequired;

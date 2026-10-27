import React, { useCallback, useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { ValidatedField } from "../component/FormControls";
import { firstValidationError, isBlank } from "../utils/validation";
import { useConfirm } from "../component/confirmContext";

const planNames = {
  FREE: "Gratuito",
  BASIC: "Basic",
  PREMIUM: "Premium",
};

const planCards = [
  {
    plan: "FREE",
    price: "S/ 0",
    monthlyAmount: 0,
    description: "Inicio gratuito para comenzar la operacion.",
    features: ["20 productos", "2 usuarios activos", "Compras y ventas", "Sin reportes exportables", "Sin centro operativo"],
  },
  {
    plan: "BASIC",
    price: "S/ 49",
    monthlyAmount: 49,
    description: "Operacion pyme con reportes y auditoria.",
    features: ["200 productos", "5 usuarios activos", "Reportes PDF/Excel", "Auditoria"],
  },
  {
    plan: "PREMIUM",
    price: "S/ 99",
    monthlyAmount: 99,
    description: "Operacion avanzada con monitoreo en tiempo real.",
    features: ["Productos ilimitados", "Usuarios activos ilimitados", "Centro operativo", "KPIs logisticos avanzados"],
  },
];

const emptyPaymentForm = {
  holderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

const PlanPage = () => {
  const confirm = useConfirm();
  const [organization, setOrganization] = useState(null);
  const [limits, setLimits] = useState(null);
  const [payments, setPayments] = useState([]);
  const [checkout, setCheckout] = useState(null);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const currentPlan = limits?.plan || "FREE";
  const visiblePlanCards = planCards.filter((card) => planRank(card.plan) >= planRank(currentPlan));
  const currentPlanCard = planCards.find((card) => card.plan === currentPlan);
  const hasPaidSubscription = currentPlan !== "FREE";
  const activePlanChange = payments.find((payment) => ["PENDING", "SCHEDULED"].includes(payment.status));
  const scheduledCancellation = activePlanChange?.status === "SCHEDULED" && activePlanChange?.targetPlan === "FREE"
    ? activePlanChange
    : null;
  const visibleActivePlanChange = scheduledCancellation ? null : activePlanChange;
  const latestPaidPlan = payments.find((payment) => payment.status === "PAID" && payment.targetPlan === currentPlan);
  const nextRenewalDate = latestPaidPlan ? addDays(latestPaidPlan.paidAt || latestPaidPlan.createdAt, 30) : null;

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4500);
  }, []);

  const fetchPlan = useCallback(async () => {
    try {
      const [organizationResponse, paymentResponse] = await Promise.all([
        ApiService.getCurrentOrganization(),
        ApiService.getPlanPayments(),
      ]);
      setOrganization(organizationResponse.organization || null);
      setLimits(organizationResponse.planLimits || organizationResponse.organization?.planLimits || null);
      setPayments(paymentResponse.planPayments || []);
      if (organizationResponse.organization) ApiService.saveOrganization(organizationResponse.organization);
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudo cargar el plan.");
    }
  }, [showMessage]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const startCheckout = async (nextPlan) => {
    if (!organization || nextPlan === limits?.plan || activePlanChange) return;
    setLoading(true);
    try {
      const response = await ApiService.createPlanCheckout(nextPlan);
      if (response.planPayment?.status === "SCHEDULED") {
        showMessage(response.message || "Suscripcion cancelada. Tu plan seguira activo hasta el final del ciclo.");
        setCheckout(null);
        await fetchPlan();
        return;
      }
      if (response.planPayment?.status === "PAID") {
        showMessage(response.message || `Plan actualizado a ${planNames[nextPlan]}.`);
        setCheckout(null);
        await fetchPlan();
        return;
      }
      setCheckout(response.planPayment);
      setPaymentForm(emptyPaymentForm);
      showMessage("Checkout generado. Confirma el pago para activar el plan.");
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudo generar el checkout.");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (event) => {
    event.preventDefault();
    if (!checkout) return;
    const digits = paymentForm.cardNumber.replace(/\s/g, "");
    const validationMessage = firstValidationError([
      { valid: !isBlank(paymentForm.holderName), message: "Ingrese el titular de la tarjeta." },
      { valid: /^\d{16}$/.test(digits), message: "Ingrese 16 digitos de tarjeta para la simulacion." },
      { valid: /^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentForm.expiry), message: "Ingrese vencimiento en formato MM/AA." },
      { valid: /^\d{3,4}$/.test(paymentForm.cvv), message: "Ingrese CVV valido." },
    ]);
    if (validationMessage) {
      showMessage(validationMessage);
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.confirmPlanPayment(checkout.id);
      showMessage(response.message || "Pago aprobado. Plan activado.");
      setCheckout(null);
      setPaymentForm(emptyPaymentForm);
      await fetchPlan();
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudo confirmar el pago.");
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentField = (field, value) => {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  };

  const continuePendingPayment = () => {
    if (activePlanChange?.status === "PENDING") {
      setCheckout(activePlanChange);
    }
  };

  const cancelPlanChange = async () => {
    if (!activePlanChange) return;
    setLoading(true);
    try {
      const response = await ApiService.cancelPlanPayment(activePlanChange.id);
      showMessage(response.message || "Solicitud de plan cancelada.");
      setCheckout(null);
      await fetchPlan();
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudo cancelar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    const renewalText = nextRenewalDate ? ` hasta el ${formatDate(nextRenewalDate)}` : " hasta el final del ciclo pagado";
    const ok = await confirm({
      title: "Cancelar suscripcion",
      message: `Tu plan ${planNames[currentPlan] || currentPlan} seguira activo${renewalText}. Despues la empresa pasara al plan gratuito y no se eliminaran datos. Deseas continuar?`,
      confirmLabel: "Cancelar suscripcion",
      cancelLabel: "Volver",
      tone: "danger",
    });
    if (ok) startCheckout("FREE");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="saas-kicker">Suscripcion</p>
          <h1 className="saas-title mt-1">Mi plan</h1>
          <p className="mt-2 text-sm text-[#647084]">
            Control de limites, checkout y activacion de suscripcion para {organization?.name || "tu empresa"}.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#bfe1d2] bg-[#edf7f3] px-4 py-3 text-sm font-semibold text-[#2f6f73]">
            {message}
          </p>
        )}

        {limits && (
          <>
            <section className="saas-surface p-6">
              <p className="text-sm font-semibold text-[#526071]">Plan actual</p>
              <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-4xl font-bold text-[#172033]">
                    {planNames[currentPlan] || currentPlan}
                  </h2>
                  <p className="mt-2 text-sm text-[#647084]">
                    {currentPlanCard?.description || "Plan activo para tu empresa."}
                  </p>
                </div>
                <span className={`rounded border px-4 py-2 text-sm font-bold ${
                  hasPaidSubscription
                    ? "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]"
                    : "border-[#bfd7ef] bg-[#e8f1fb] text-[#123c69]"
                }`}>
                  {hasPaidSubscription ? "Suscripcion activa" : "Plan gratuito"}
                </span>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <UsageCard label="Productos" current={limits.currentProducts} max={limits.maxProducts} />
              <UsageCard label="Usuarios activos" current={limits.currentUsers} max={limits.maxUsers} />
            </section>

            <p className="text-xs font-semibold text-[#647084]">
              Los usuarios activos incluyen administrador, supervisor y consulta.
            </p>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Feature label="Reportes PDF/Excel" enabled={limits.reportsEnabled} />
              <Feature label="Centro operativo" enabled={limits.liveOperationsEnabled} />
              <Feature label="Auditoria avanzada" enabled={limits.auditEnabled} />
            </section>

            <section className="space-y-4">
              <div>
                <p className="saas-kicker">Planes</p>
                <h2 className="mt-1 text-2xl font-bold text-[#172033]">Cambiar a un plan superior</h2>
              </div>
              {visibleActivePlanChange && <ActivePlanChangeNotice payment={visibleActivePlanChange} onContinue={continuePendingPayment} onCancel={cancelPlanChange} loading={loading} />}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {visiblePlanCards.map((card) => (
                  <PlanOptionCard
                    key={card.plan}
                    card={card}
                    current={card.plan === currentPlan}
                    disabled={loading || Boolean(activePlanChange)}
                    onSelect={() => startCheckout(card.plan)}
                  />
                ))}
              </div>
            </section>

            <section className="saas-surface p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="saas-kicker">Gestionar suscripcion</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#172033]">
                    {scheduledCancellation
                      ? "Suscripcion cancelada"
                      : hasPaidSubscription
                        ? "Renovacion automatica activa"
                        : "Sin suscripcion de pago"}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm text-[#647084]">
                    {scheduledCancellation
                      ? `Tu plan ${planNames[currentPlan] || currentPlan} seguira activo hasta el ${formatDate(scheduledCancellation.effectiveAt)}. Despues la empresa pasara al plan gratuito y se mantendran los datos.`
                      : hasPaidSubscription
                        ? `Tu suscripcion se renovara automaticamente${nextRenewalDate ? ` el ${formatDate(nextRenewalDate)}` : ""}. Puedes cancelarla y conservar el acceso hasta el final del ciclo pagado.`
                        : "Estas usando el plan gratuito. Cuando compres un plan, la activacion se hara despues de confirmar el pago."}
                  </p>
                  {scheduledCancellation && (
                    <p className="mt-3 rounded-md border border-[#bfd7ef] bg-[#f5f9fd] px-3 py-2 text-sm font-semibold text-[#526071]">
                      Al quedar en Free, no se eliminan productos ni usuarios; solo se restringen nuevas acciones y funciones premium segun los limites gratuitos.
                    </p>
                  )}
                </div>
                {hasPaidSubscription && (
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-64">
                    {scheduledCancellation ? (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={cancelPlanChange}
                        className="saas-button-secondary h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Mantener suscripcion
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={loading || Boolean(activePlanChange)}
                        onClick={cancelSubscription}
                        className="rounded-md border border-[#f4c7c7] bg-white px-4 py-2 text-sm font-bold text-[#9b2c2c] transition hover:bg-[#fff4f4] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Cancelar suscripcion
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>

            {checkout && (
              <section className="saas-surface p-6">
                <div className="flex flex-col gap-4 border-b border-[#d8dee8] pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="saas-kicker">Checkout</p>
                    <h2 className="mt-1 text-xl font-bold text-[#172033]">
                      Activar {planNames[checkout.targetPlan] || checkout.targetPlan}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#526071]">Referencia</p>
                    <p className="text-lg font-black text-[#172033]">{checkout.referenceCode}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-md border border-[#d8dee8] bg-[#f8fafc] p-4">
                    <p className="text-sm font-bold text-[#526071]">Resumen</p>
                    <p className="mt-3 text-3xl font-black text-[#172033]">
                      S/ {Number(checkout.amount || 0).toFixed(2)}
                    </p>
                    <p className="mt-2 text-sm text-[#647084]">
                      Pago mensual en soles. La confirmacion simula la aprobacion de una pasarela real.
                    </p>
                  </div>

                  <form onSubmit={confirmPayment} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ValidatedField
                      label="Titular"
                      value={paymentForm.holderName}
                      onChange={(value) => updatePaymentField("holderName", value)}
                      required
                      validator={(value) => !isBlank(value)}
                      errorMessage="Ingrese el titular."
                    />
                    <ValidatedField
                      label="Tarjeta"
                      value={paymentForm.cardNumber}
                      onChange={(value) => updatePaymentField("cardNumber", value)}
                      required
                      inputMode="numeric"
                      validator={(value) => /^\d{16}$/.test(value.replace(/\s/g, ""))}
                      errorMessage="Ingrese 16 digitos."
                    />
                    <ValidatedField
                      label="Vencimiento"
                      value={paymentForm.expiry}
                      onChange={(value) => updatePaymentField("expiry", value)}
                      required
                      placeholder="MM/AA"
                      validator={(value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value)}
                      errorMessage="Use MM/AA."
                    />
                    <ValidatedField
                      label="CVV"
                      value={paymentForm.cvv}
                      onChange={(value) => updatePaymentField("cvv", value)}
                      required
                      inputMode="numeric"
                      validator={(value) => /^\d{3,4}$/.test(value)}
                      errorMessage="Ingrese 3 o 4 digitos."
                    />
                    <div className="flex gap-3 md:col-span-2">
                      <button type="submit" disabled={loading} className="saas-button-primary h-11 px-4 text-sm disabled:bg-[#7b8798]">
                        Confirmar pago
                      </button>
                      <button type="button" onClick={() => setCheckout(null)} className="saas-button-secondary h-11 px-4 text-sm">
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            <section className="saas-surface saas-table-scroll">
              <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
                <thead className="bg-[#f8fafc]">
                  <tr>
                    {["Referencia", "Cambio", "Monto", "Estado", "Fecha"].map((header) => (
                      <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f6] bg-white">
                  {payments.length ? payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#f8fafc]">
                      <td className="px-5 py-4 font-bold text-[#172033]">{payment.referenceCode}</td>
                      <td className="px-5 py-4 text-[#647084]">
                        {planNames[payment.previousPlan] || payment.previousPlan} a {planNames[payment.targetPlan] || payment.targetPlan}
                      </td>
                      <td className="px-5 py-4 text-[#647084]">S/ {Number(payment.amount || 0).toFixed(2)}</td>
                      <td className="px-5 py-4"><StatusBadge payment={payment} /></td>
                      <td className="px-5 py-4 text-[#647084]">{formatDate(payment.effectiveAt || payment.paidAt || payment.createdAt)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-5 py-6 text-center text-[#647084]" colSpan={5}>
                        Aun no hay pagos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

const UsageCard = ({ label, current, max }) => (
  <div className="saas-surface p-5">
    <p className="text-sm font-semibold text-[#526071]">{label}</p>
    <p className="mt-3 text-2xl font-bold text-[#172033]">
      {current || 0} / {max ?? "Ilimitado"}
    </p>
  </div>
);

const ActivePlanChangeNotice = ({ payment, onContinue, onCancel, loading }) => {
  const isPendingPayment = payment.status === "PENDING";
  const isCancellation = payment.status === "SCHEDULED" && payment.targetPlan === "FREE";
  return (
    <div className="rounded-md border border-[#f3d49a] bg-[#fff8e8] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold text-[#8a5a10]">
            {isPendingPayment ? "Pago pendiente" : isCancellation ? "Cancelacion programada" : "Cambio programado"}
          </p>
          <p className="mt-1 text-sm text-[#526071]">
            {isPendingPayment
              ? `Tienes un checkout pendiente para cambiar a ${planNames[payment.targetPlan] || payment.targetPlan}.`
              : isCancellation
                ? `Tu suscripcion se cancelo y seguira activa hasta el ${formatDate(payment.effectiveAt)}.`
                : `Tu cambio a ${planNames[payment.targetPlan] || payment.targetPlan} esta programado para el ${formatDate(payment.effectiveAt)}.`}
            {" "}Primero finaliza o cancela esta solicitud para crear otra.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {isPendingPayment && (
            <button
              type="button"
              onClick={onContinue}
              className="saas-button-primary h-10 px-4 text-sm"
            >
              Continuar pago
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-md border border-[#d6b76d] bg-white px-4 py-2 text-sm font-bold text-[#8a5a10] transition hover:bg-[#fff3d6] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCancellation ? "Mantener suscripcion" : "Cancelar solicitud"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ label, enabled }) => (
  <div className="saas-surface p-5">
    <p className="text-sm font-bold text-[#172033]">{label}</p>
    <p className={`mt-2 text-sm font-bold ${enabled ? "text-[#2f6f73]" : "text-[#9b2c2c]"}`}>
      {enabled ? "Incluido" : "No incluido"}
    </p>
  </div>
);

const PlanOptionCard = ({ card, current, disabled, onSelect }) => (
  <article className={`saas-surface p-6 ${current ? "border-[#123c69] ring-2 ring-[#123c69]/10" : ""}`}>
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-[#172033]">{card.plan}</h3>
      <span className={`rounded border px-3 py-1 text-xs font-bold ${
        current
          ? "border-[#bfd7ef] bg-[#e8f1fb] text-[#123c69]"
          : "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]"
      }`}>
        {current ? "Actual" : "Mejora"}
      </span>
    </div>
    <p className="mt-3 text-3xl font-black text-[#172033]">
      {card.price}<span className="text-sm font-semibold text-[#647084]"> / mes</span>
    </p>
    <p className="mt-3 min-h-10 text-sm text-[#647084]">{card.description}</p>
    <ul className="mt-5 space-y-2 text-sm text-[#465366]">
      {card.features.map((feature) => (
        <li key={feature}>Incluye: {feature}</li>
      ))}
    </ul>
    <button
      type="button"
      disabled={disabled || current}
      onClick={onSelect}
      className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-bold transition ${
        current
          ? "cursor-not-allowed border border-[#d8dee8] bg-[#eef2f6] text-[#647084]"
          : "saas-button-primary disabled:cursor-not-allowed disabled:bg-[#7b8798]"
      }`}
    >
      {current ? "Tu plan actual" : `Cambiar a ${planNames[card.plan] || card.plan}`}
    </button>
  </article>
);

const StatusBadge = ({ payment }) => {
  const status = payment.status;
  const scheduledCancellation = status === "SCHEDULED" && payment.targetPlan === "FREE";
  const styles = {
    PAID: "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]",
    SCHEDULED: "border-[#bfd7ef] bg-[#e8f1fb] text-[#123c69]",
    PENDING: "border-[#f3d49a] bg-[#fff8e8] text-[#8a5a10]",
    CANCELLED: "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c]",
  };
  const labels = {
    PAID: "Pagado",
    SCHEDULED: "Programado",
    PENDING: "Pendiente",
    CANCELLED: "No aplicado",
  };
  return (
    <span className={`rounded border px-3 py-1 text-xs font-bold ${styles[status] || styles.PENDING}`}>
      {scheduledCancellation ? "Cancela al cierre" : labels[status] || status}
    </span>
  );
};

const planRank = (plan) => ({ FREE: 0, BASIC: 1, PREMIUM: 2 }[plan] ?? 0);

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const addDays = (value, days) => {
  if (!value) return null;
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export default PlanPage;

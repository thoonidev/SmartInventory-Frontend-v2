import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import LiveService from "../service/LiveService";

const statusCopy = {
  CONNECTED: ["En vivo", "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]"],
  DISCONNECTED: ["Desconectado", "border-[#d8dee8] bg-[#f8fafc] text-[#526071]"],
  ERROR: ["Error de conexion", "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c]"],
};

const severityClass = {
  SUCCESS: "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]",
  INFO: "border-[#bfd7ef] bg-[#e8f1fb] text-[#123c69]",
  WARNING: "border-[#f3d49a] bg-[#fff8e8] text-[#8a5a10]",
  DANGER: "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c]",
};

const severityLabels = {
  SUCCESS: "Correcto",
  INFO: "Informativo",
  WARNING: "Atencion",
  DANGER: "Critico",
};

const eventTypeLabels = {
  CONNECTED: "Conexion",
  STOCK_ALERT: "Alerta de stock",
  TRANSACTION_CREATED: "Movimiento registrado",
  TRANSACTION_STATUS_UPDATED: "Estado actualizado",
  PRODUCT_CREATED: "Producto registrado",
  PRODUCT_UPDATED: "Producto actualizado",
};

const LiveOperationsPage = () => {
  const [status, setStatus] = useState("DISCONNECTED");
  const [events, setEvents] = useState([]);
  const organization = ApiService.getOrganization();

  useEffect(() => {
    let active = true;
    let reconnectTimer;
    let socket;

    const connect = () => {
      if (!active) return;

      socket = LiveService.connect({
        onStatus: (nextStatus) => {
          if (!active) return;

          setStatus(nextStatus);
          if (nextStatus === "DISCONNECTED") {
            reconnectTimer = setTimeout(connect, 3000);
          }
        },
        onEvent: (event) => {
          if (!active) return;

          setEvents((currentEvents) => [
            { ...event, id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}` },
            ...currentEvents,
          ].slice(0, 80));
        },
      });
    };

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
      }
    };
  }, []);

  const metrics = useMemo(() => {
    const stockAlerts = events.filter((event) => event.type === "STOCK_ALERT");
    const transactions = events.filter((event) => event.type?.startsWith("TRANSACTION_"));
    const productChanges = events.filter((event) => event.type?.startsWith("PRODUCT_"));
    return {
      stockAlerts: stockAlerts.length,
      transactions: transactions.length,
      productChanges: productChanges.length,
      lastEvent: formatEventTime(events[0]?.createdAt),
    };
  }, [events]);

  const alerts = events.filter((event) => event.type === "STOCK_ALERT").slice(0, 8);
  const [statusLabel, statusStyle] = statusCopy[status] || statusCopy.DISCONNECTED;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="saas-kicker">Centro en tiempo real</p>
              <h1 className="saas-title mt-1">Centro operativo</h1>
              <p className="mt-2 text-sm text-[#647084]">
                {organization?.name || "Empresa actual"} recibe movimientos, cambios y alertas sin recargar.
              </p>
            </div>
            <span className={`w-fit rounded border px-4 py-2 text-sm font-bold ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Metric label="Movimientos" value={metrics.transactions} />
            <Metric label="Cambios de producto" value={metrics.productChanges} />
            <Metric label="Alertas de stock" value={metrics.stockAlerts} danger={metrics.stockAlerts > 0} />
            <Metric
              label="Ultimo evento"
              value={metrics.lastEvent}
            />
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="saas-surface xl:col-span-2">
              <div className="border-b border-[#d8dee8] px-5 py-4">
                <h2 className="text-base font-bold text-[#172033]">
                  Actividad en vivo
                </h2>
              </div>
              <div className="divide-y divide-[#eef2f6]">
                {events.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-[#647084]">
                    Esperando movimientos de inventario.
                  </p>
                ) : (
                  events.map((event) => <EventRow key={event.id} event={event} />)
                )}
              </div>
            </section>

            <aside className="saas-surface">
              <div className="border-b border-[#d8dee8] px-5 py-4">
                <h2 className="text-base font-bold text-[#172033]">
                  Alertas criticas
                </h2>
              </div>
              <div className="space-y-3 p-5">
                {alerts.length === 0 ? (
                  <p className="text-sm text-[#647084]">Sin alertas nuevas en esta sesion.</p>
                ) : (
                  alerts.map((event) => (
                    <div
                      key={event.id}
                      className={`rounded-md border p-3 text-sm ${severityClass[event.severity] || severityClass.WARNING}`}
                    >
                      <p className="font-semibold">{event.title}</p>
                      <p className="mt-1">{event.message}</p>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
      </div>
    </Layout>
  );
};

const Metric = ({ label, value, danger = false }) => (
  <div className="saas-surface p-4">
    <p className="text-xs font-bold uppercase text-[#647084]">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${danger ? "text-[#9b2c2c]" : "text-[#172033]"}`}>
      {value}
    </p>
  </div>
);

const EventRow = ({ event }) => (
  <div className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[150px_1fr_auto] md:items-center">
    <div>
      <p className="text-xs font-bold uppercase text-[#647084]">
        {formatEventTime(event.createdAt)}
      </p>
      <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${severityClass[event.severity] || severityClass.INFO}`}>
        {severityLabels[event.severity] || "Informativo"}
      </span>
    </div>
    <div>
      <p className="font-bold text-[#172033]">{event.title}</p>
      <p className="mt-1 text-sm text-[#647084]">{event.message}</p>
      {event.data?.items?.length > 0 && (
        <p className="mt-2 text-xs text-[#647084]">
          {event.data.items.map((item) => `${item.productName} x ${item.quantity}`).join(" | ")}
        </p>
      )}
    </div>
    <p className="text-sm font-bold text-[#647084]">
      {eventTypeLabels[event.type] || event.entity || "Evento"}
    </p>
  </div>
);

const formatEventTime = (value) => {
  if (!value) return "-";

  const normalized = Array.isArray(value)
    ? new Date(
        value[0],
        (value[1] || 1) - 1,
        value[2] || 1,
        value[3] || 0,
        value[4] || 0,
        value[5] || 0
      )
    : new Date(value);

  return Number.isNaN(normalized.getTime())
    ? "-"
    : normalized.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
};

export default LiveOperationsPage;

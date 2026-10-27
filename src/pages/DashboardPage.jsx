import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { transactionTypeLabels } from "../constants/translations";

const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`;

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [abcProducts, setAbcProducts] = useState([]);
  const organization = ApiService.getOrganization();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionResponse, kpiResponse, alertsResponse, abcResponse] =
          await Promise.all([
            ApiService.getAllTransactions(),
            ApiService.getLogisticsKpis(),
            ApiService.getLogisticsAlerts(),
            ApiService.getLogisticsAbcAnalysis(),
          ]);

        if (transactionResponse.status === 200) {
          setTransactions(transactionResponse.transactions || []);
        }
        setKpi(kpiResponse.logisticsKpi || null);
        setAlerts(alertsResponse.products || []);
        setAbcProducts(abcResponse.products || []);
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "No se pudo cargar el resumen del negocio."
        );
      }
    };
    fetchData();
  }, []);

  const transactionData = useMemo(() => {
    const dailyData = {};
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      dailyData[day] = { day, count: 0, quantity: 0, amount: 0 };
    }
    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      if (
        date.getMonth() + 1 === selectedMonth &&
        date.getFullYear() === selectedYear
      ) {
        const day = date.getDate();
        dailyData[day].count += 1;
        dailyData[day].quantity += transaction.totalProducts || 0;
        dailyData[day].amount += Number(transaction.totalPrice || 0);
      }
    });
    return Object.values(dailyData);
  }, [transactions, selectedMonth, selectedYear]);

  const transactionTypeData = useMemo(() => {
    const totals = {};
    transactions.forEach((transaction) => {
      const label =
        transactionTypeLabels[transaction.transactionType] ||
        transaction.transactionType;
      totals[label] = (totals[label] || 0) + 1;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const abcSummary = useMemo(() => {
    const totals = { A: 0, B: 0, C: 0, "Sin clase": 0 };
    abcProducts.forEach((product) => {
      totals[product.abcClass || "Sin clase"] += 1;
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  }, [abcProducts]);

  const pendingDocuments = useMemo(
    () =>
      transactions.filter((transaction) =>
        ["PENDING", "PROCESSING"].includes(transaction.status)
      ),
    [transactions]
  );

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6),
    [transactions]
  );

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(0, i).toLocaleString("es-PE", { month: "long" }),
    value: i + 1,
  }));
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  const totalCount = transactionData.reduce((acc, cur) => acc + cur.count, 0);
  const totalAmount = transactionData.reduce((acc, cur) => acc + cur.amount, 0);
  const pieColors = ["#123c69", "#2f6f73", "#b7791f", "#647084"];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="saas-kicker">Panel ejecutivo</p>
            <h1 className="saas-title mt-1">
              {organization?.name || "SmartInventory"}
            </h1>
            <p className="mt-2 text-sm text-[#647084]">
              Vista consolidada de inventario, valor logistico y alertas de operacion.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-10 rounded-md border border-[#cfd6e2] bg-white px-3 text-sm text-[#172033] outline-none focus:border-[#123c69]"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-10 rounded-md border border-[#cfd6e2] bg-white px-3 text-sm text-[#172033] outline-none focus:border-[#123c69]"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && (
          <p className="rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Valor inventario", money(kpi?.inventoryValue), "Valorizacion actual"],
            ["Unidades stock", kpi?.totalUnitsInStock || 0, "Disponible en almacenes"],
            ["Stock bajo", kpi?.lowStockProducts || 0, "Requiere reposicion"],
            ["Pendientes", pendingDocuments.length, "Documentos por atender"],
          ].map(([label, value, help]) => (
            <section
              key={label}
              className="saas-surface p-5"
            >
              <p className="text-sm font-semibold text-[#526071]">{label}</p>
              <p className="mt-2 text-2xl font-bold text-[#172033]">{value}</p>
              <p className="mt-2 text-xs text-[#7b8798]">{help}</p>
            </section>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="saas-surface p-5 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[#172033]">Actividad reciente</h2>
              <span className="text-sm font-semibold text-[#647084]">
                {totalCount} movimientos este periodo
              </span>
            </div>
            <div className="mt-4 divide-y divide-[#eef2f6]">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-1 gap-2 py-3 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="font-bold text-[#172033]">
                        TRX-{String(transaction.id).padStart(5, "0")} ·{" "}
                        {transactionTypeLabels[transaction.transactionType] ||
                          transaction.transactionType}
                      </p>
                      <p className="mt-1 text-sm text-[#647084]">
                        {transaction.description || transaction.note || "Movimiento registrado"}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-bold text-[#172033]">
                        {money(transaction.totalPrice)}
                      </p>
                      <p className="mt-1 text-xs text-[#647084]">
                        {transaction.createdAt
                          ? new Date(transaction.createdAt).toLocaleDateString("es-PE")
                          : "-"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-[#647084]">
                  Aun no hay actividad registrada.
                </p>
              )}
            </div>
          </section>

          <section className="saas-surface p-5">
            <h2 className="text-lg font-bold text-[#172033]">Atencion requerida</h2>
            <div className="mt-4 space-y-3">
              <SummaryPill label="Documentos pendientes" value={pendingDocuments.length} />
              <SummaryPill label="Productos en alerta" value={alerts.length} />
              <SummaryPill label="Ventas del periodo" value={money(totalAmount)} />
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="saas-surface p-5 lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-[#172033]">
              Movimiento diario
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8dee8" />
                <XAxis dataKey="day" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "amount" ? money(value) : value
                  }
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#123c69"
                  strokeWidth={3}
                  name="Transacciones"
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2f6f73"
                  strokeWidth={3}
                  name="Importe"
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          <section className="saas-surface p-5">
            <h2 className="mb-4 text-lg font-bold text-[#172033]">
              Tipos de transaccion
            </h2>
            {transactionTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={transactionTypeData} dataKey="value" nameKey="name" outerRadius={95}>
                    {transactionTypeData.map((item, index) => (
                      <Cell key={item.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#647084]">Sin transacciones registradas.</p>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="saas-surface p-5">
            <h2 className="mb-4 text-lg font-bold text-[#172033]">
              Productos con alerta
            </h2>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-md border border-[#f3d49a] bg-[#fff8e8] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-[#172033]">{product.name}</p>
                      <p className="text-sm text-[#647084]">
                        {product.sku} | {product.warehouseLocation || "Sin ubicacion"}
                      </p>
                    </div>
                    <span className="rounded bg-white px-3 py-1 text-sm font-bold text-[#8a5a10]">
                      {product.stockQuantity} / {product.reorderPoint}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#647084]">No hay alertas activas.</p>
            )}
          </section>

          <section className="saas-surface p-5">
            <h2 className="mb-4 text-lg font-bold text-[#172033]">
              Distribucion ABC
            </h2>
            {abcSummary.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={abcSummary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8dee8" />
                  <XAxis dataKey="name" tickLine={false} />
                  <YAxis tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#123c69" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#647084]">Sin clasificacion ABC.</p>
            )}
          </section>
        </div>

        <p className="text-sm text-[#647084]">
          Transacciones del periodo: {totalCount}
        </p>
      </div>
    </Layout>
  );
};

export default DashboardPage;

const SummaryPill = ({ label, value }) => (
  <div className="rounded-md border border-[#d8dee8] bg-[#f8fafc] p-3">
    <p className="text-sm font-semibold text-[#647084]">{label}</p>
    <p className="mt-1 text-xl font-bold text-[#172033]">{value}</p>
  </div>
);

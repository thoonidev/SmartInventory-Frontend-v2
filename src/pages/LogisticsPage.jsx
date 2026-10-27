import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { canUseFeature } from "../utils/planAccess";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`;
const percent = (value) => `${Number(value || 0).toFixed(1)}%`;

const stockBadge = (product) => {
  if ((product.stockQuantity || 0) <= 0) {
    return "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c]";
  }
  if (
    product.reorderPoint !== null &&
    product.reorderPoint !== undefined &&
    product.stockQuantity <= product.reorderPoint
  ) {
    return "border-[#f3d49a] bg-[#fff8e8] text-[#8a5a10]";
  }
  return "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]";
};

const LogisticsPage = () => {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [abcProducts, setAbcProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("alerts");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogistics = async () => {
      try {
        const [kpiRes, alertsRes, suggestionsRes, abcRes] = await Promise.all([
          ApiService.getLogisticsKpis(),
          ApiService.getLogisticsAlerts(),
          ApiService.getReorderSuggestions(),
          ApiService.getLogisticsAbcAnalysis(),
        ]);
        setKpi(kpiRes.logisticsKpi || null);
        setAlerts(alertsRes.products || []);
        setSuggestions(suggestionsRes.reorderSuggestions || []);
        setAbcProducts(abcRes.products || []);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "No se pudo cargar la informacion logistica."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLogistics();
  }, []);

  const abcSummary = useMemo(() => {
    const totals = { A: 0, B: 0, C: 0, SinClase: 0 };
    abcProducts.forEach((product) => {
      const key = product.abcClass || "SinClase";
      totals[key] = (totals[key] || 0) + 1;
    });
    return [
      { name: "A", value: totals.A, color: "#123c69" },
      { name: "B", value: totals.B, color: "#2f6f73" },
      { name: "C", value: totals.C, color: "#b7791f" },
      { name: "Sin clase", value: totals.SinClase, color: "#647084" },
    ].filter((item) => item.value > 0);
  }, [abcProducts]);

  const valueChart = useMemo(
    () =>
      [...abcProducts]
        .sort((a, b) => Number(b.inventoryValue || 0) - Number(a.inventoryValue || 0))
        .slice(0, 8)
        .map((product) => ({
          name: product.sku || product.name,
          value: Number(product.inventoryValue || 0),
        })),
    [abcProducts]
  );

  const advancedKpis = useMemo(() => {
    const totalProducts = abcProducts.length || 0;
    const totalInventoryValue = abcProducts.reduce(
      (sum, product) => sum + Number(product.inventoryValue || 0),
      0
    );
    const classAValue = abcProducts
      .filter((product) => product.abcClass === "A")
      .reduce((sum, product) => sum + Number(product.inventoryValue || 0), 0);
    const classifiedProducts = abcProducts.filter((product) => product.abcClass).length;
    const productsWithReorder = abcProducts.filter(
      (product) => product.reorderPoint !== null && product.reorderPoint !== undefined
    ).length;
    const riskValue = alerts.reduce(
      (sum, product) => sum + Number(product.inventoryValue || 0),
      0
    );
    const healthScore = totalProducts
      ? Math.max(0, 100 - (alerts.length / totalProducts) * 100)
      : 100;

    return {
      classAConcentration: totalInventoryValue ? (classAValue / totalInventoryValue) * 100 : 0,
      riskValue,
      reorderCoverage: totalProducts ? (productsWithReorder / totalProducts) * 100 : 0,
      abcCoverage: totalProducts ? (classifiedProducts / totalProducts) * 100 : 0,
      healthScore,
      suggestedUnits: suggestions.reduce((sum, item) => sum + Number(item.suggestedQuantity || 0), 0),
    };
  }, [abcProducts, alerts, suggestions]);

  const premiumKpisEnabled = canUseFeature("advancedKpis");

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="saas-kicker">Gestion logistica</p>
            <h1 className="saas-title mt-1">Inventario, reposicion y ABC</h1>
            <p className="mt-2 text-sm text-[#647084]">
              Indicadores para optimizar recursos, abastecimiento y valor almacenado.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="saas-button-primary self-start px-4 py-2 text-sm"
          >
            Actualizar
          </button>
        </div>

        {message && (
          <p className="rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
            {message}
          </p>
        )}

        {loading ? (
          <p className="saas-surface p-6 text-center text-[#647084]">
            Cargando informacion...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Valor de inventario", money(kpi?.inventoryValue), "Capital almacenado"],
                ["Unidades en stock", kpi?.totalUnitsInStock || 0, "Existencia total"],
                ["Productos bajo minimo", kpi?.lowStockProducts || 0, "Reposicion requerida"],
                ["Stock critico", kpi?.criticalStockProducts || 0, "Riesgo operativo"],
              ].map(([label, value, help]) => (
                <section key={label} className="saas-surface p-5">
                  <p className="text-sm font-semibold text-[#526071]">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-[#172033]">{value}</p>
                  <p className="mt-2 text-xs text-[#7b8798]">{help}</p>
                </section>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <section className="saas-surface p-5 lg:col-span-3">
                <h2 className="mb-4 text-lg font-bold text-[#172033]">
                  Productos de mayor valor
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={valueChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d8dee8" />
                    <XAxis dataKey="name" tickLine={false} />
                    <YAxis tickLine={false} />
                    <Tooltip formatter={(value) => money(value)} />
                    <Bar dataKey="value" fill="#123c69" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </section>

              <section className="saas-surface p-5 lg:col-span-2">
                <h2 className="mb-4 text-lg font-bold text-[#172033]">
                  Clasificacion ABC
                </h2>
                {abcSummary.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={abcSummary} dataKey="value" nameKey="name" outerRadius={95}>
                        {abcSummary.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-[#647084]">Sin datos ABC disponibles.</p>
                )}
              </section>
            </div>

            <section className="saas-surface p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="saas-kicker">Premium</p>
                  <h2 className="mt-1 text-lg font-bold text-[#172033]">
                    KPIs logisticos avanzados
                  </h2>
                  <p className="mt-2 text-sm text-[#647084]">
                    Indicadores para evaluar riesgo, cobertura de reposicion y concentracion del valor almacenado.
                  </p>
                </div>
                {!premiumKpisEnabled && (
                  <button
                    type="button"
                    onClick={() => navigate("/plan")}
                    className="saas-button-primary self-start px-4 py-2 text-sm"
                  >
                    Mejorar a Premium
                  </button>
                )}
              </div>

              {premiumKpisEnabled ? (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <AdvancedMetric label="Salud logistica" value={percent(advancedKpis.healthScore)} help="Porcentaje de productos sin alerta de stock." />
                  <AdvancedMetric label="Capital en riesgo" value={money(advancedKpis.riskValue)} help="Valor del inventario en productos con alerta." danger={advancedKpis.riskValue > 0} />
                  <AdvancedMetric label="Concentracion clase A" value={percent(advancedKpis.classAConcentration)} help="Peso del valor de productos A sobre el inventario total." />
                  <AdvancedMetric label="Cobertura de reorden" value={percent(advancedKpis.reorderCoverage)} help="Productos con punto de reorden definido." />
                  <AdvancedMetric label="Cobertura ABC" value={percent(advancedKpis.abcCoverage)} help="Productos clasificados para analisis ABC." />
                  <AdvancedMetric label="Unidades sugeridas" value={advancedKpis.suggestedUnits} help="Cantidad total recomendada para reposicion." />
                </div>
              ) : (
                <div className="mt-5 rounded-md border border-[#d8dee8] bg-[#f8fafc] p-4">
                  <p className="text-sm font-bold text-[#172033]">Disponible en Premium</p>
                  <p className="mt-2 text-sm text-[#647084]">
                    Tu plan actual mantiene los KPIs basicos. Premium activa analisis avanzado de riesgo logistico,
                    cobertura ABC, capital en riesgo y salud de reposicion.
                  </p>
                </div>
              )}
            </section>

            <div className="flex flex-wrap gap-2">
              {[
                ["alerts", "Alertas"],
                ["suggestions", "Reposicion"],
                ["abc", "Detalle ABC"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`rounded-md px-4 py-2 text-sm font-bold ${
                    activeTab === key
                      ? "bg-[#123c69] text-white"
                      : "border border-[#cfd6e2] bg-white text-[#465366] hover:bg-[#f8fafc]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "alerts" && (
              <ProductTable
                products={alerts}
                emptyText="No hay productos por debajo del punto de reorden."
              />
            )}

            {activeTab === "suggestions" && (
              <SuggestionTable suggestions={suggestions} />
            )}

            {activeTab === "abc" && (
              <ProductTable
                products={abcProducts}
                emptyText="No hay productos para analizar."
                showValue
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

const ProductTable = ({ products, emptyText, showValue = false }) => {
  if (!products.length) {
    return <p className="saas-surface p-6 text-center text-[#647084]">{emptyText}</p>;
  }

  return (
    <div className="saas-surface overflow-x-auto">
      <table className="min-w-full divide-y divide-[#d8dee8] text-sm">
        <thead className="bg-[#f8fafc]">
          <tr>
            {["Producto", "SKU", "Stock", "Punto reorden", "Ubicacion", "ABC", showValue ? "Valor" : null]
              .filter(Boolean)
              .map((header) => (
                <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">
                  {header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eef2f6] bg-white">
          {products.map((product) => (
            <tr key={product.id || product.productId} className="hover:bg-[#f8fafc]">
              <td className="px-5 py-4 font-bold text-[#172033]">{product.name}</td>
              <td className="px-5 py-4 text-[#647084]">{product.sku}</td>
              <td className="px-5 py-4">
                <span className={`rounded border px-3 py-1 text-xs font-bold ${stockBadge(product)}`}>
                  {product.stockQuantity ?? 0}
                </span>
              </td>
              <td className="px-5 py-4 text-[#647084]">{product.reorderPoint ?? "-"}</td>
              <td className="px-5 py-4 text-[#647084]">{product.warehouseLocation || "-"}</td>
              <td className="px-5 py-4 font-bold text-[#344055]">{product.abcClass || "-"}</td>
              {showValue && <td className="px-5 py-4 font-bold text-[#172033]">{money(product.inventoryValue)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SuggestionTable = ({ suggestions }) => {
  if (!suggestions.length) {
    return (
      <p className="saas-surface p-6 text-center text-[#647084]">
        No hay sugerencias de reposicion pendientes.
      </p>
    );
  }

  return (
    <div className="saas-surface overflow-x-auto">
      <table className="min-w-full divide-y divide-[#d8dee8] text-sm">
        <thead className="bg-[#f8fafc]">
          <tr>
            {["Producto", "SKU", "Stock", "Punto reorden", "Cantidad sugerida", "Ubicacion"].map((header) => (
              <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eef2f6] bg-white">
          {suggestions.map((item) => (
            <tr key={item.productId} className="hover:bg-[#f8fafc]">
              <td className="px-5 py-4 font-bold text-[#172033]">{item.productName}</td>
              <td className="px-5 py-4 text-[#647084]">{item.sku}</td>
              <td className="px-5 py-4 text-[#647084]">{item.stockQuantity}</td>
              <td className="px-5 py-4 text-[#647084]">{item.reorderPoint}</td>
              <td className="px-5 py-4 font-bold text-[#123c69]">{item.suggestedQuantity}</td>
              <td className="px-5 py-4 text-[#647084]">{item.warehouseLocation || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdvancedMetric = ({ label, value, help, danger = false }) => (
  <div className={`rounded-md border p-4 ${
    danger ? "border-[#f4c7c7] bg-[#fff4f4]" : "border-[#d8dee8] bg-white"
  }`}>
    <p className="text-sm font-semibold text-[#526071]">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${danger ? "text-[#9b2c2c]" : "text-[#172033]"}`}>
      {value}
    </p>
    <p className="mt-2 text-xs leading-5 text-[#7b8798]">{help}</p>
  </div>
);

export default LogisticsPage;

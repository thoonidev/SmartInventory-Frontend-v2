import React, { useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import SelectMenu from "../component/SelectMenu";

const reports = [
  {
    key: "inventory",
    title: "Inventario valorizado",
    description: "Productos, stock, valor logistico, ABC y puntos de reorden.",
    metrics: ["Stock", "Valor", "Reposicion"],
  },
  {
    key: "transactions",
    title: "Libro de transacciones",
    description: "Compras, ventas, devoluciones, cantidades, estados e importes.",
    metrics: ["Operaciones", "Estados", "Importes"],
  },
];

const formats = [
  ["excel", "XLSX", "Hoja editable para analisis y conciliacion."],
  ["pdf", "PDF", "Documento ejecutivo listo para auditoria."],
];

const ReportsPage = () => {
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState("");
  const [inventoryFilters, setInventoryFilters] = useState({
    stockFilter: "ALL",
    abcClass: "ALL",
  });
  const [transactionFilters, setTransactionFilters] = useState({
    dateFrom: "",
    dateTo: "",
    type: "ALL",
    status: "ALL",
  });

  const download = async (reportType, format) => {
    const downloadKey = `${reportType}-${format}`;
    setDownloading(downloadKey);
    setMessage("");

    try {
      const filters =
        reportType === "inventory" ? inventoryFilters : transactionFilters;
      const response = await ApiService.downloadReport(reportType, format, filters);
      const extension = format === "excel" ? "xlsx" : "pdf";
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Reporte descargado correctamente.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "No se pudo descargar el reporte."
      );
    } finally {
      setDownloading("");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="saas-kicker">Reportes exportables</p>
            <h1 className="saas-title mt-1">Descargas operativas</h1>
            <p className="mt-2 text-sm text-[#647084]">
              Archivos filtrados para auditoria, analisis gerencial y seguimiento logistico.
            </p>
          </div>
          <p className="rounded-md border border-[#d8dee8] bg-white px-4 py-2 text-sm font-semibold text-[#526071]">
            PDF y XLSX
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#bfe1d2] bg-[#edf7f3] px-4 py-3 text-sm font-semibold text-[#2f6f73]">
            {message}
          </p>
        )}

        <section className="saas-surface p-5">
          <h2 className="text-base font-bold text-[#172033]">Parametros del reporte</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-md border border-[#d8dee8] bg-[#f8fafc] p-4">
              <p className="text-sm font-bold text-[#172033]">Inventario</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectField
                  label="Estado de stock"
                  value={inventoryFilters.stockFilter}
                  onChange={(value) =>
                    setInventoryFilters((current) => ({ ...current, stockFilter: value }))
                  }
                  options={[
                    ["ALL", "Todos"],
                    ["OK", "Disponible"],
                    ["LOW", "Bajo minimo"],
                    ["OUT", "Agotado"],
                  ]}
                />
                <SelectField
                  label="Clase ABC"
                  value={inventoryFilters.abcClass}
                  onChange={(value) =>
                    setInventoryFilters((current) => ({ ...current, abcClass: value }))
                  }
                  options={[
                    ["ALL", "Todas"],
                    ["A", "A"],
                    ["B", "B"],
                    ["C", "C"],
                  ]}
                />
              </div>
            </div>

            <div className="rounded-md border border-[#d8dee8] bg-[#f8fafc] p-4">
              <p className="text-sm font-bold text-[#172033]">Transacciones</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InputField
                  label="Desde"
                  type="date"
                  value={transactionFilters.dateFrom}
                  onChange={(value) =>
                    setTransactionFilters((current) => ({ ...current, dateFrom: value }))
                  }
                />
                <InputField
                  label="Hasta"
                  type="date"
                  value={transactionFilters.dateTo}
                  onChange={(value) =>
                    setTransactionFilters((current) => ({ ...current, dateTo: value }))
                  }
                />
                <SelectField
                  label="Tipo"
                  value={transactionFilters.type}
                  onChange={(value) =>
                    setTransactionFilters((current) => ({ ...current, type: value }))
                  }
                  options={[
                    ["ALL", "Todos"],
                    ["PURCHASE", "Compra"],
                    ["SALE", "Venta"],
                    ["RETURN_TO_SUPPLIER", "Dev. proveedor"],
                    ["RETURN_FROM_CUSTOMER", "Dev. cliente"],
                    ["PRODUCTION_OUTPUT", "Entrada por produccion"],
                  ]}
                />
                <SelectField
                  label="Estado"
                  value={transactionFilters.status}
                  onChange={(value) =>
                    setTransactionFilters((current) => ({ ...current, status: value }))
                  }
                  options={[
                    ["ALL", "Todos"],
                    ["PENDING", "Pendiente"],
                    ["PROCESSING", "En proceso"],
                    ["COMPLETED", "Completado"],
                    ["CANCELLED", "Cancelado"],
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {reports.map((report) => (
            <section key={report.key} className="saas-surface p-6">
              <h2 className="text-xl font-bold text-[#172033]">{report.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#647084]">
                {report.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {report.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="rounded border border-[#d8dee8] bg-[#f8fafc] px-3 py-1 text-xs font-bold text-[#526071]"
                  >
                    {metric}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {formats.map(([format, label, detail]) => {
                  const key = `${report.key}-${format}`;
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => download(report.key, format)}
                      disabled={downloading === key}
                      className="rounded-md border border-[#d8dee8] bg-white p-4 text-left transition hover:border-[#123c69] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:bg-[#f0f3f7]"
                    >
                      <span className="text-sm font-bold text-[#172033]">
                        {downloading === key ? "Descargando..." : `Descargar ${label}`}
                      </span>
                      <span className="mt-1 block text-xs text-[#647084]">{detail}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
};

const SelectField = (props) => <SelectMenu {...props} />;

const InputField = ({ label, type, value, onChange }) => (
  <label className="block">
    <span className="text-sm font-semibold text-[#344055]">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 h-10 w-full rounded-md border border-[#cfd6e2] bg-white px-3 text-sm outline-none transition focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/10"
    />
  </label>
);

export default ReportsPage;

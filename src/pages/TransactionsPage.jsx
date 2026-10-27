import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import PaginationComponent from "../component/PaginationComponent";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import IconButton from "../component/IconButton";
import SelectMenu from "../component/SelectMenu";
import {
  transactionStatusLabels,
  transactionTypeLabels,
} from "../constants/translations";

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const defaultFilters = {
  query: "",
  type: "ALL",
  status: "ALL",
  dateFrom: "",
  dateTo: "",
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const getTransactions = async () => {
      setLoading(true);
      try {
        const transactionData = await ApiService.getAllTransactions("");
        setTransactions(transactionData.transactions || []);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "No se pudieron cargar transacciones."
        );
      } finally {
        setLoading(false);
      }
    };

    getTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const createdAt = transaction.createdAt
        ? new Date(transaction.createdAt)
        : null;
      const dateText = createdAt ? createdAt.toISOString().slice(0, 10) : "";
      const text = [
        transaction.id,
        transaction.transactionType,
        transactionTypeLabels[transaction.transactionType],
        transaction.status,
        transactionStatusLabels[transaction.status],
        transaction.description,
        transaction.note,
        transaction.organizationName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || text.includes(query);
      const matchesType =
        filters.type === "ALL" || transaction.transactionType === filters.type;
      const matchesStatus =
        filters.status === "ALL" || transaction.status === filters.status;
      const matchesDateFrom = !filters.dateFrom || dateText >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || dateText <= filters.dateTo;

      return (
        matchesQuery &&
        matchesType &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [filters, transactions]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const pagedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const metrics = useMemo(() => {
    const totalAmount = filteredTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.totalPrice || 0),
      0
    );
    const completed = filteredTransactions.filter(
      (transaction) => transaction.status === "COMPLETED"
    ).length;
    const pending = filteredTransactions.filter(
      (transaction) =>
        transaction.status === "PENDING" || transaction.status === "PROCESSING"
    ).length;
    return { totalAmount, completed, pending };
  }, [filteredTransactions]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="saas-kicker">Operaciones</p>
              <h1 className="saas-title mt-1">Transacciones</h1>
              <p className="mt-2 text-sm text-[#647084]">
                Libro operativo para consultar movimientos, estados y documentos.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="self-start rounded-md border border-[#cfd6e2] bg-white px-4 py-2 text-sm font-bold text-[#465366] hover:bg-[#f8fafc] md:self-auto"
            >
              Limpiar filtros
            </button>
          </div>

          {message && (
            <p className="rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="Monto filtrado"
              value={currencyFormatter.format(metrics.totalAmount)}
            />
            <MetricCard label="Completadas" value={metrics.completed} />
            <MetricCard label="Pendientes o en proceso" value={metrics.pending} />
          </div>

          <section className="saas-surface p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_180px_180px]">
              <label className="block md:col-span-2 xl:col-span-1">
                <span className="text-sm font-medium text-gray-600">
                  Busqueda general
                </span>
                <input
                  value={filters.query}
                  onChange={(event) => updateFilter("query", event.target.value)}
                  placeholder="ID, tipo, estado, descripcion o nota"
                  className="mt-2 h-11 w-full rounded-md border border-[#cfd6e2] px-3 text-sm outline-none transition focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/10"
                />
              </label>
              <FilterSelect
                label="Tipo"
                value={filters.type}
                onChange={(value) => updateFilter("type", value)}
                options={[
                  ["ALL", "Todos"],
                  ["PURCHASE", "Compra"],
                  ["SALE", "Venta"],
                  ["RETURN_TO_SUPPLIER", "Dev. proveedor"],
                  ["RETURN_FROM_CUSTOMER", "Dev. cliente"],
                ]}
              />
              <FilterSelect
                label="Estado"
                value={filters.status}
                onChange={(value) => updateFilter("status", value)}
                options={[
                  ["ALL", "Todos"],
                  ["PENDING", "Pendiente"],
                  ["PROCESSING", "En proceso"],
                  ["COMPLETED", "Completado"],
                  ["CANCELLED", "Cancelado"],
                ]}
              />
              <DateInput
                label="Desde"
                value={filters.dateFrom}
                onChange={(value) => updateFilter("dateFrom", value)}
              />
              <DateInput
                label="Hasta"
                value={filters.dateTo}
                onChange={(value) => updateFilter("dateTo", value)}
              />
            </div>
          </section>

          <section className="saas-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#d8dee8] px-5 py-4">
              <h2 className="text-base font-bold text-[#172033]">
                Libro de transacciones
              </h2>
              <span className="text-sm font-semibold text-[#647084]">
                {filteredTransactions.length} registros
              </span>
            </div>
            {loading ? (
              <p className="p-6 text-center text-[#647084]">Cargando informacion...</p>
            ) : pagedTransactions.length > 0 ? (
              <div className="saas-table-scroll">
                <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
                  <thead className="bg-[#f8fafc]">
                    <tr>
                      {[
                        "Documento",
                        "Tipo",
                        "Estado",
                        "Cantidad",
                        "Total",
                        "Almacen",
                        "Fecha",
                        "Accion",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-5 py-3 text-left font-bold text-[#526071]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2f6] bg-white">
                    {pagedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-[#f8fafc]">
                        <td data-wrap="true" className="px-5 py-4">
                          <p className="font-bold text-[#172033]">
                            TRX-{String(transaction.id).padStart(5, "0")}
                          </p>
                          <p className="mt-1 max-w-72 truncate text-xs text-[#647084]">
                            {transaction.description || transaction.note || "Sin detalle"}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#344055]">
                          {transactionTypeLabels[transaction.transactionType] ||
                            transaction.transactionType}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={transaction.status} />
                        </td>
                        <td className="px-5 py-4 text-[#647084]">
                          {transaction.totalProducts || 0}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#172033]">
                          {currencyFormatter.format(transaction.totalPrice || 0)}
                        </td>
                        <td className="min-w-40 px-5 py-4 text-[#647084]">
                          {transaction.warehouseLocation || "-"}
                        </td>
                        <td className="min-w-48 whitespace-nowrap px-5 py-4 text-[#647084]">
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString("es-PE")
                            : "-"}
                        </td>
                        <td className="px-5 py-4">
                          <IconButton
                            icon="view"
                            label="Ver documento"
                            onClick={() => navigate(`/transaction/${transaction.id}`)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-6 text-center text-[#647084]">
                No hay transacciones para los filtros seleccionados.
              </p>
            )}
          </section>

          <div className="flex justify-center">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
      </div>
    </Layout>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="saas-surface p-5">
    <p className="text-sm font-semibold text-[#526071]">{label}</p>
    <p className="mt-2 text-2xl font-bold text-[#172033]">{value}</p>
  </div>
);

const FilterSelect = (props) => <SelectMenu {...props} />;

const DateInput = ({ label, value, onChange }) => (
  <label className="block">
    <span className="text-sm font-semibold text-[#344055]">{label}</span>
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 h-11 w-full rounded-md border border-[#cfd6e2] px-3 text-sm outline-none transition focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/10"
    />
  </label>
);

const StatusBadge = ({ status }) => {
  const className =
    status === "COMPLETED"
      ? "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]"
      : status === "CANCELLED"
      ? "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c]"
      : status === "PROCESSING"
      ? "border-[#f3d49a] bg-[#fff8e8] text-[#8a5a10]"
      : "border-[#d8dee8] bg-[#f8fafc] text-[#526071]";

  return (
    <span className={`rounded border px-3 py-1 text-xs font-bold ${className}`}>
      {transactionStatusLabels[status] || status || "-"}
    </span>
  );
};

export default TransactionsPage;

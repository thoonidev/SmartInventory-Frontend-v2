import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { transactionTypeLabels } from "../constants/translations";
import IconButton from "../component/IconButton";
import { useConfirm } from "../component/confirmContext";

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const ApprovalsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const confirm = useConfirm();

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const response = await ApiService.getAllTransactions("");
      setTransactions(response.transactions || []);
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudieron cargar aprobaciones.");
    }
  }, [showMessage]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const pendingTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.status === "PENDING" &&
          ["PURCHASE", "RETURN_FROM_CUSTOMER"].includes(transaction.transactionType)
      ),
    [transactions]
  );

  const updateStatus = async (transactionId, status) => {
    const action = status === "COMPLETED" ? "aprobar" : "rechazar";
    const stockImpact = status === "COMPLETED"
      ? " Si corresponde, esta accion aplicara el movimiento de stock."
      : " Esta accion cancelara el documento pendiente.";
    const ok = await confirm({
      title: `${status === "COMPLETED" ? "Aprobar" : "Rechazar"} documento`,
      message: `Desea ${action} este documento?${stockImpact}`,
      confirmLabel: status === "COMPLETED" ? "Aprobar" : "Rechazar",
      tone: status === "COMPLETED" ? "success" : "danger",
    });
    if (!ok) {
      return;
    }
    try {
      await ApiService.updateTransactionStatus(transactionId, status);
      showMessage(status === "COMPLETED" ? "Documento aprobado." : "Documento rechazado.");
      loadTransactions();
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudo actualizar el documento.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="saas-kicker">Control interno</p>
          <h1 className="saas-title mt-1">Aprobaciones</h1>
          <p className="mt-2 text-sm text-[#647084]">
            Compras y devoluciones de cliente esperan aprobacion antes de modificar stock.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#bfe1d2] bg-[#edf7f3] px-4 py-3 text-sm font-semibold text-[#2f6f73]">
            {message}
          </p>
        )}

        <section className="saas-surface saas-table-scroll">
          {pendingTransactions.length === 0 ? (
            <p className="p-8 text-center text-[#647084]">No hay documentos pendientes.</p>
          ) : (
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  {["Documento", "Tipo", "Unidades", "Total", "Fecha", "Acciones"].map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {pendingTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-[#f8fafc]">
                    <td data-wrap="true" className="px-5 py-4 font-bold text-[#172033]">
                      TRX-{String(transaction.id).padStart(5, "0")}
                      <p className="mt-1 max-w-72 truncate text-xs font-normal text-[#647084]">
                        {transaction.description || transaction.note || "Sin detalle"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-[#647084]">
                      {transactionTypeLabels[transaction.transactionType] || transaction.transactionType}
                    </td>
                    <td className="px-5 py-4 text-[#647084]">{transaction.totalProducts || 0}</td>
                    <td className="px-5 py-4 font-bold text-[#172033]">
                      {currencyFormatter.format(transaction.totalPrice || 0)}
                    </td>
                    <td className="px-5 py-4 text-[#647084]">
                      {transaction.createdAt
                        ? new Date(transaction.createdAt).toLocaleString("es-PE")
                        : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <IconButton
                        icon="approve"
                        label="Aprobar documento"
                        onClick={() => updateStatus(transaction.id, "COMPLETED")}
                        variant="success"
                        className="mr-2"
                      />
                      <IconButton
                        icon="reject"
                        label="Rechazar documento"
                        onClick={() => updateStatus(transaction.id, "CANCELLED")}
                        variant="danger"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default ApprovalsPage;

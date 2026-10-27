import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import IconButton from "../component/IconButton";
import { useConfirm } from "../component/confirmContext";

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const responseData = await ApiService.getAllCustomers();
        setCustomers(responseData.customers || []);
      } catch (error) {
        showMessage(error.response?.data?.message || "Error al obtener clientes.");
      }
    };
    getCustomers();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleDeleteCustomer = async (customerId) => {
    const ok = await confirm({
      title: "Desactivar cliente",
      message: "El cliente dejara de estar disponible para nuevas ventas y devoluciones, pero su historial se conserva. Desea continuar?",
      confirmLabel: "Desactivar",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await ApiService.deleteCustomer(customerId);
      setCustomers((current) =>
        current.filter((customer) => customer.id !== customerId)
      );
      showMessage("Cliente desactivado correctamente");
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudo desactivar el cliente.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="saas-kicker">Comercial</p>
            <h1 className="saas-title mt-1">Clientes</h1>
            <p className="mt-2 text-sm text-[#647084]">
              Administra clientes para ventas, devoluciones y trazabilidad comercial.
            </p>
          </div>
          <IconButton
            icon="add"
            label="Agregar cliente"
            onClick={() => navigate("/add-customer")}
            variant="primary"
            className="self-start"
          />
        </div>

        {message && (
          <p className="rounded-md border border-[#bfe1d2] bg-[#edf7f3] px-4 py-3 text-sm font-semibold text-[#2f6f73]">
            {message}
          </p>
        )}

        {customers.length > 0 ? (
          <div className="saas-surface saas-table-scroll">
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  {["Cliente", "Documento", "Contacto", "Direccion", "Acciones"].map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#f8fafc]">
                    <td className="px-5 py-4 font-bold text-[#172033]">{customer.name}</td>
                    <td className="px-5 py-4 text-[#647084]">{customer.documentNumber || "-"}</td>
                    <td className="px-5 py-4 text-[#647084]">{customer.contactInfo || "-"}</td>
                    <td className="px-5 py-4 text-[#647084]">{customer.address || "-"}</td>
                    <td className="px-5 py-4">
                      <IconButton
                        icon="edit"
                        label="Editar cliente"
                        onClick={() => navigate(`/edit-customer/${customer.id}`)}
                        className="mr-2"
                      />
                      <IconButton
                        icon="delete"
                        label="Desactivar cliente"
                        onClick={() => handleDeleteCustomer(customer.id)}
                        variant="danger"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="saas-surface p-6 text-center text-[#647084]">
            No hay clientes registrados.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default CustomerPage;

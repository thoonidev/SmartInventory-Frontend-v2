import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import IconButton from "../component/IconButton";
import { useConfirm } from "../component/confirmContext";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    const getSuppliers = async () => {
      try {
        const responseData = await ApiService.getAllSuppliers();
        if (responseData.status === 200) {
          setSuppliers(responseData.suppliers || []);
        } else {
          showMessage(responseData.message);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error al obtener proveedores."
        );
      }
    };
    getSuppliers();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const handleDeleteSupplier = async (supplierId) => {
    const ok = await confirm({
      title: "Desactivar proveedor",
      message: "El proveedor dejara de estar disponible para nuevas compras y reposicion, pero su historial se conserva. Desea continuar?",
      confirmLabel: "Desactivar",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await ApiService.deleteSupplier(supplierId);
      setSuppliers((current) =>
        current.filter((supplier) => supplier.id !== supplierId)
      );
      showMessage("Proveedor desactivado correctamente");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo desactivar el proveedor."
      );
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="saas-kicker">Abastecimiento</p>
            <h1 className="saas-title mt-1">Proveedores</h1>
            <p className="mt-2 text-sm text-[#647084]">
              Gestiona socios de suministro, contacto y condiciones operativas.
            </p>
          </div>
          <IconButton
            icon="add"
            label="Agregar proveedor"
            onClick={() => navigate("/add-supplier")}
            variant="primary"
            className="self-start"
          />
        </div>

        {message && (
          <p className="rounded-md border border-[#bfe1d2] bg-[#edf7f3] px-4 py-3 text-sm font-semibold text-[#2f6f73]">
            {message}
          </p>
        )}

        {suppliers.length > 0 ? (
          <div className="saas-surface saas-table-scroll">
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  {["Proveedor", "Contacto", "Direccion", "Acciones"].map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-[#f8fafc]">
                    <td className="px-5 py-4 font-bold text-[#172033]">
                      {supplier.name}
                    </td>
                    <td className="px-5 py-4 text-[#647084]">
                      {supplier.contactInfo || "-"}
                    </td>
                    <td className="px-5 py-4 text-[#647084]">
                      {supplier.address || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <IconButton
                        icon="edit"
                        label="Editar proveedor"
                        onClick={() => navigate(`/edit-supplier/${supplier.id}`)}
                        className="mr-2"
                      />
                      <IconButton
                        icon="delete"
                        label="Desactivar proveedor"
                        onClick={() => handleDeleteSupplier(supplier.id)}
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
            No hay proveedores registrados.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default SupplierPage;

import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { firstValidationError, isBlank } from "../utils/validation";
import { ValidatedField } from "../component/FormControls";
import { useConfirm } from "../component/confirmContext";

const AddEditSupplierPage = () => {
  const { supplierId } = useParams();
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    if (supplierId) {
      setIsEditing(true);

      const fetchSupplier = async () => {
        try {
          const supplierData = await ApiService.getSupplierById(supplierId);
          if (supplierData.status === 200) {
            setName(supplierData.supplier.name || "");
            setContactInfo(supplierData.supplier.contactInfo || "");
            setAddress(supplierData.supplier.address || "");
          }
        } catch (error) {
          showMessage(
            error.response?.data?.message ||
              "Error al obtener el proveedor seleccionado."
          );
        }
      };
      fetchSupplier();
    }
  }, [supplierId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationMessage = firstValidationError([
      { valid: !isBlank(name), message: "Ingrese el nombre del proveedor." },
      { valid: !isBlank(contactInfo), message: "Ingrese el contacto del proveedor." },
      { valid: !isBlank(address), message: "Ingrese la direccion del proveedor." },
    ]);
    if (validationMessage) {
      showMessage(validationMessage);
      return;
    }
    const ok = await confirm({
      title: isEditing ? "Actualizar proveedor" : "Crear proveedor",
      message: isEditing
        ? "Se guardaran los cambios del proveedor. Desea continuar?"
        : "Se creara un nuevo proveedor para compras y reposicion. Desea continuar?",
      confirmLabel: isEditing ? "Actualizar" : "Crear proveedor",
      tone: "primary",
    });
    if (!ok) return;
    const supplierData = { name, contactInfo, address };

    try {
      if (isEditing) {
        await ApiService.updateSupplier(supplierId, supplierData);
        showMessage("Proveedor actualizado correctamente");
      } else {
        await ApiService.addSupplier(supplierData);
        showMessage("Proveedor agregado correctamente");
      }
      navigate("/supplier");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo guardar el proveedor."
      );
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="saas-kicker">Abastecimiento</p>
          <h1 className="saas-title mt-1">
            {isEditing ? "Editar proveedor" : "Agregar proveedor"}
          </h1>
          <p className="mt-2 text-sm text-[#647084]">
            Registra informacion de contacto para compras y reposicion.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
            {message}
          </p>
        )}

        <section className="saas-surface p-7">
          <div className="mb-6 border-b border-[#d8dee8] pb-4">
            <p className="text-sm font-bold text-[#172033]">Datos del proveedor</p>
            <p className="mt-1 text-sm text-[#647084]">
              Mantener estos datos actualizados mejora el flujo de abastecimiento.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <ValidatedField label="Nombre del proveedor" value={name} onChange={setName} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el nombre del proveedor." placeholder="Ingrese el nombre del proveedor" />
            <ValidatedField label="Celular / contacto" value={contactInfo} onChange={setContactInfo} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el contacto del proveedor." placeholder="Numero de contacto" />
            <ValidatedField label="Direccion" value={address} onChange={setAddress} required validator={(value) => !isBlank(value)} errorMessage="Ingrese la direccion del proveedor." placeholder="Direccion del proveedor" />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/supplier")}
                className="rounded-md border border-[#cfd6e2] bg-white px-5 py-2 text-sm font-bold text-[#465366] hover:bg-[#f8fafc]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="saas-button-primary px-5 py-2 text-sm"
              >
                {isEditing ? "Guardar cambios" : "Agregar proveedor"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
};

export default AddEditSupplierPage;

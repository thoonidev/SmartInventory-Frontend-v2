import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { firstValidationError, isBlank } from "../utils/validation";
import { ValidatedField } from "../component/FormControls";
import { useConfirm } from "../component/confirmContext";

const AddEditCustomerPage = () => {
  const { customerId } = useParams();
  const [name, setName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    if (customerId) {
      setIsEditing(true);
      const fetchCustomer = async () => {
        try {
          const customerData = await ApiService.getCustomerById(customerId);
          if (customerData.status === 200) {
            setName(customerData.customer.name || "");
            setDocumentNumber(customerData.customer.documentNumber || "");
            setContactInfo(customerData.customer.contactInfo || "");
            setAddress(customerData.customer.address || "");
          }
        } catch (error) {
          showMessage(error.response?.data?.message || "Error al obtener el cliente.");
        }
      };
      fetchCustomer();
    }
  }, [customerId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = firstValidationError([
      { valid: !isBlank(name), message: "Ingrese el nombre del cliente." },
      { valid: !documentNumber || /^(\d{8}|\d{11})$/.test(documentNumber.trim()), message: "El documento debe tener 8 digitos (DNI) u 11 digitos (RUC)." },
      { valid: !isBlank(contactInfo), message: "Ingrese el contacto del cliente." },
    ]);
    if (validationMessage) {
      showMessage(validationMessage);
      return;
    }
    const ok = await confirm({
      title: isEditing ? "Actualizar cliente" : "Crear cliente",
      message: isEditing
        ? "Se guardaran los cambios del cliente. Desea continuar?"
        : "Se creara un nuevo cliente para ventas y devoluciones. Desea continuar?",
      confirmLabel: isEditing ? "Actualizar" : "Crear cliente",
      tone: "primary",
    });
    if (!ok) return;
    const customerData = { name, documentNumber, contactInfo, address, customerStatus: "ACTIVE" };

    try {
      if (isEditing) {
        await ApiService.updateCustomer(customerId, customerData);
      } else {
        await ApiService.addCustomer(customerData);
      }
      navigate("/customer");
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudo guardar el cliente.");
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="saas-kicker">Comercial</p>
          <h1 className="saas-title mt-1">
            {isEditing ? "Editar cliente" : "Agregar cliente"}
          </h1>
          <p className="mt-2 text-sm text-[#647084]">
            Centraliza datos de clientes para ventas, devoluciones y reportes.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
            {message}
          </p>
        )}

        <section className="saas-surface p-7">
          <div className="mb-6 border-b border-[#d8dee8] pb-4">
            <p className="text-sm font-bold text-[#172033]">Datos del cliente</p>
            <p className="mt-1 text-sm text-[#647084]">
              Esta informacion se usa en ventas, despachos y trazabilidad.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <ValidatedField label="Nombre del cliente" value={name} onChange={setName} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el nombre del cliente." />
            <ValidatedField label="RUC / DNI" value={documentNumber} onChange={setDocumentNumber} validator={(value) => !value || /^(\d{8}|\d{11})$/.test(value.trim())} errorMessage="El documento debe tener 8 digitos (DNI) u 11 digitos (RUC)." inputMode="numeric" />
            <ValidatedField label="Celular / contacto" value={contactInfo} onChange={setContactInfo} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el contacto del cliente." />
            <ValidatedField label="Direccion" value={address} onChange={setAddress} />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/customer")}
                className="rounded-md border border-[#cfd6e2] bg-white px-5 py-2 text-sm font-bold text-[#465366] hover:bg-[#f8fafc]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="saas-button-primary px-5 py-2 text-sm"
              >
                {isEditing ? "Guardar cambios" : "Agregar cliente"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
};

export default AddEditCustomerPage;

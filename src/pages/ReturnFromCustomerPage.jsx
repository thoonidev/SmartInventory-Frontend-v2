import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import TransactionDocumentForm from "../component/TransactionDocumentForm";
import ApiService from "../service/ApiService";
import { useConfirm } from "../component/confirmContext";

const ReturnFromCustomerPage = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [items, setItems] = useState([]);
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnCondition, setReturnCondition] = useState("SELLABLE");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, customerData, warehouseData] = await Promise.all([
          ApiService.getAllProducts(),
          ApiService.getAllCustomers(),
          ApiService.getWarehouses(),
        ]);
        setProducts(productData.products || []);
        setCustomers(customerData.customers || []);
        setWarehouses(warehouseData.warehouses || []);
      } catch (error) {
        showMessage(error.response?.data?.message || "No se pudieron cargar los datos.");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!customerId || items.length === 0 || !returnReason || !returnCondition) {
      showMessage("Seleccione cliente, productos, motivo y condicion.");
      return;
    }
    if (items.some((item) => Number(item.quantity) <= 0)) {
      showMessage("Cada producto debe tener una cantidad mayor a cero.");
      return;
    }
    const ok = await confirm({
      title: "Registrar devolucion de cliente",
      message: "La devolucion entrara a revision y puede crear un caso de calidad si el producto no vuelve a stock. Desea continuar?",
      confirmLabel: "Registrar devolucion",
      tone: "primary",
    });
    if (!ok) {
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.returnFromCustomer({
        customerId,
        warehouseLocation,
        items,
        description,
        note,
        returnReason,
        returnCondition,
      });
      showMessage(response.message || "Devolucion de cliente registrada y enviada a revision.");
      resetForm();
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudo registrar la devolucion.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerId("");
    setWarehouseLocation("");
    setItems([]);
    setDescription("");
    setNote("");
    setReturnReason("");
    setReturnCondition("SELLABLE");
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <Layout>
      <TransactionDocumentForm
        mode="customerReturn"
        products={products}
        customers={customers}
        customerId={customerId}
        warehouses={warehouses}
        warehouseLocation={warehouseLocation}
        items={items}
        description={description}
        note={note}
        returnReason={returnReason}
        returnCondition={returnCondition}
        message={message}
        loading={loading}
        onSupplierChange={() => {}}
        onCustomerChange={setCustomerId}
        onWarehouseChange={setWarehouseLocation}
        onItemsChange={setItems}
        onDescriptionChange={setDescription}
        onNoteChange={setNote}
        onReturnReasonChange={setReturnReason}
        onReturnConditionChange={setReturnCondition}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
};

export default ReturnFromCustomerPage;

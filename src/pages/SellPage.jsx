import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import TransactionDocumentForm from "../component/TransactionDocumentForm";
import ApiService from "../service/ApiService";
import { useConfirm } from "../component/confirmContext";

const SellPage = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);
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
        showMessage(
          error.response?.data?.message || "No se pudieron cargar datos de venta."
        );
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!customerId || items.length === 0) {
      showMessage("Seleccione cliente y agregue al menos un producto.");
      return;
    }
    if (items.some((item) => Number(item.quantity) <= 0)) {
      showMessage("Cada producto debe tener una cantidad mayor a cero.");
      return;
    }
    const itemWithoutStock = items.find((item) => {
      const product = products.find((current) => String(current.id) === String(item.productId));
      return product && Number(item.quantity) > Number(product.stockQuantity || 0);
    });
    if (itemWithoutStock) {
      showMessage("No puede vender mas unidades que el stock disponible.");
      return;
    }
    const ok = await confirm({
      title: "Confirmar venta",
      message: "La venta descontara stock inmediatamente. Desea continuar?",
      confirmLabel: "Confirmar venta",
      tone: "success",
    });
    if (!ok) {
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.sellProduct({
        customerId,
        warehouseLocation,
        items,
        description,
        note,
      });
      showMessage(response.message || "Venta registrada correctamente.");
      resetForm();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo registrar la venta."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerId("");
    setWarehouseLocation("");
    setDescription("");
    setNote("");
    setItems([]);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <Layout>
      <TransactionDocumentForm
        mode="sale"
        products={products}
        customers={customers}
        customerId={customerId}
        warehouses={warehouses}
        warehouseLocation={warehouseLocation}
        items={items}
        description={description}
        note={note}
        message={message}
        loading={loading}
        onSupplierChange={() => {}}
        onCustomerChange={setCustomerId}
        onWarehouseChange={setWarehouseLocation}
        onItemsChange={setItems}
        onDescriptionChange={setDescription}
        onNoteChange={setNote}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
};

export default SellPage;

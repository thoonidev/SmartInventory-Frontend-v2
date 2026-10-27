import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import SelectMenu from "../component/SelectMenu";
import { firstValidationError, isBlank, isNonNegativeNumber, isPositiveNumber, isSku } from "../utils/validation";
import { ValidatedField, ValidatedSelect, ValidatedTextArea } from "../component/FormControls";
import { useConfirm } from "../component/confirmContext";

const AddEditProductPage = () => {
  const { productId } = useParams();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStokeQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [reorderQuantity, setReorderQuantity] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [abcClass, setAbcClass] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [categoriesData, warehousesData] = await Promise.all([
          ApiService.getAllCategory(),
          ApiService.getWarehouses(),
        ]);
        setCategories(categoriesData.categories || []);
        setWarehouses(warehousesData.warehouses || []);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error al obtener datos del producto: " + error
        );
      }
    };

    const fetchProductById = async () => {
      if (productId) {
        setIsEditing(true);
        try {
          const productData = await ApiService.getProductById(productId);
          if (productData.status === 200) {
            const product = productData.product;
            setName(product.name || "");
            setSku(product.sku || "");
            setPrice(product.price || "");
            setStokeQuantity(product.stockQuantity || "");
            setCategoryId(product.categoryId || "");
            setDescription(product.description || "");
            setReorderPoint(product.reorderPoint ?? "");
            setReorderQuantity(product.reorderQuantity ?? "");
            setWarehouseLocation(product.warehouseLocation || "");
            setAbcClass(product.abcClass || "");
            setImageUrl(resolveImageUrl(product.imageUrl));
          } else {
            showMessage(productData.message);
          }
        } catch (error) {
          showMessage(
            error.response?.data?.message ||
              "Error al obtener el producto: " + error
          );
        }
      }
    };

    fetchCatalogs();
    fetchProductById();
  }, [productId]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      showMessage("Seleccione una imagen valida: JPG, PNG, WEBP o AVIF.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showMessage("La imagen no debe superar 3 MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const resolveImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) {
      return url;
    }
    return `/${url}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationMessage = firstValidationError([
      { valid: !isBlank(name), message: "Ingrese el nombre del producto." },
      { valid: isSku(sku), message: "Ingrese un SKU valido de 2 a 30 caracteres." },
      { valid: isPositiveNumber(price), message: "El precio debe ser mayor a cero." },
      { valid: isEditing || isNonNegativeNumber(stockQuantity), message: "El stock no puede ser negativo." },
      { valid: !isBlank(categoryId), message: "Seleccione una categoria." },
      { valid: !isBlank(warehouseLocation), message: "Seleccione un almacen o sede." },
      { valid: reorderPoint === "" || isNonNegativeNumber(reorderPoint), message: "El punto de reorden no puede ser negativo." },
      { valid: reorderQuantity === "" || isNonNegativeNumber(reorderQuantity), message: "La cantidad sugerida no puede ser negativa." },
    ]);
    if (validationMessage) {
      showMessage(validationMessage);
      return;
    }
    const ok = await confirm({
      title: isEditing ? "Actualizar producto" : "Crear producto",
      message: isEditing
        ? "Se guardaran los cambios del producto y podrian impactar reportes e inventario. Desea continuar?"
        : "Se creara un nuevo producto para el catalogo operativo. Desea continuar?",
      confirmLabel: isEditing ? "Actualizar" : "Crear producto",
      tone: "primary",
    });
    if (!ok) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("price", price);
    if (!isEditing) formData.append("stockQuantity", stockQuantity);
    formData.append("categoryId", categoryId);
    formData.append("description", description);
    if (reorderPoint !== "") formData.append("reorderPoint", reorderPoint);
    if (reorderQuantity !== "") formData.append("reorderQuantity", reorderQuantity);
    formData.append("warehouseLocation", warehouseLocation);
    if (abcClass) formData.append("abcClass", abcClass);
    if (imageFile) formData.append("imageFile", imageFile);

    try {
      if (isEditing) {
        formData.append("productId", productId);
        await ApiService.updateProduct(formData);
        showMessage("Producto actualizado exitosamente");
      } else {
        await ApiService.addProduct(formData);
        showMessage("Producto guardado exitosamente");
      }
      navigate("/product");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error al guardar el producto: " + error
      );
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="saas-kicker">Inventario</p>
            <h1 className="saas-title mt-1">
              {isEditing ? "Editar producto" : "Agregar producto"}
            </h1>
            <p className="mt-2 text-sm text-[#647084]">
              Define SKU, stock, categoria, reposicion, ubicacion y evidencia visual.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/product")}
            className="self-start rounded-md border border-[#cfd6e2] bg-white px-5 py-2 text-sm font-bold text-[#465366] hover:bg-[#f8fafc]"
          >
            Volver al catalogo
          </button>
        </div>

        {message && (
          <p className="rounded-md border border-[#f3d49a] bg-[#fff8e8] px-4 py-3 text-sm font-semibold text-[#8a5a10]">
            {message}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="saas-surface p-7">
            <div className="mb-6 border-b border-[#d8dee8] pb-4">
              <p className="text-sm font-bold text-[#172033]">Datos principales</p>
              <p className="mt-1 text-sm text-[#647084]">
                Informacion base para operaciones, reportes y trazabilidad.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ValidatedField label="Nombre del producto" value={name} onChange={setName} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el nombre del producto." />
                <ValidatedField label="Codigo / SKU" value={sku} onChange={setSku} required validator={isSku} errorMessage="Ingrese un SKU valido de 2 a 30 caracteres." />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ValidatedField
                  label={isEditing ? "Stock actual" : "Cantidad en stock"}
                  value={stockQuantity}
                  onChange={setStokeQuantity}
                  required={!isEditing}
                  type="number"
                  min="0"
                  disabled={isEditing}
                  validator={isNonNegativeNumber}
                  errorMessage="El stock no puede ser negativo."
                  hint={isEditing ? "El stock cambia desde compras, ventas, devoluciones o ajustes." : ""}
                  inputClassName={isEditing ? "cursor-not-allowed bg-[#eef2f6] text-[#647084]" : ""}
                />
                <ValidatedField label="Precio" value={price} onChange={setPrice} required type="number" min="0.01" step="0.01" validator={isPositiveNumber} errorMessage="El precio debe ser mayor a cero." />
                <SelectMenu
                  label="Clase ABC"
                  value={abcClass}
                  onChange={setAbcClass}
                  options={[
                    ["", "Automatico"],
                    ["A", "A"],
                    ["B", "B"],
                    ["C", "C"],
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ValidatedField
                  label="Punto de reorden"
                  value={reorderPoint}
                  onChange={setReorderPoint}
                  type="number"
                  min="0"
                  validator={(value) => value === "" || isNonNegativeNumber(value)}
                  errorMessage="El punto de reorden no puede ser negativo."
                />
                <ValidatedField
                  label="Cantidad sugerida"
                  value={reorderQuantity}
                  onChange={setReorderQuantity}
                  type="number"
                  min="0"
                  validator={(value) => value === "" || isNonNegativeNumber(value)}
                  errorMessage="La cantidad sugerida no puede ser negativa."
                />
                <ValidatedSelect
                  label="Categoria"
                  value={categoryId}
                  onChange={setCategoryId}
                  required
                  errorMessage="Seleccione una categoria."
                  options={[
                    ["", "Selecciona una categoria"],
                    ...categories.map((category) => [String(category.id), category.name]),
                  ]}
                />
              </div>

              <ValidatedSelect
                label="Almacen o sede"
                value={warehouseLocation}
                onChange={setWarehouseLocation}
                required
                options={[
                  ["", "Selecciona un almacen"],
                  ...warehouses
                    .filter((warehouse) => warehouse.active !== false)
                    .map((warehouse) => [
                      warehouse.code || warehouse.name,
                      `${warehouse.name} - ${warehouse.code || "sin codigo"}`,
                    ]),
                ]}
              />

              <ValidatedTextArea label="Descripcion" value={description} onChange={setDescription} rows={4} />

              <div className="flex justify-end gap-3 border-t border-[#d8dee8] pt-5">
                <button
                  type="button"
                  onClick={() => navigate("/product")}
                  className="rounded-md border border-[#cfd6e2] bg-white px-5 py-2 text-sm font-bold text-[#465366] hover:bg-[#f8fafc]"
                >
                  Cancelar
                </button>
                <button type="submit" className="saas-button-primary px-5 py-2 text-sm">
                  {isEditing ? "Actualizar producto" : "Agregar producto"}
                </button>
              </div>
            </form>
          </section>

          <aside className="saas-surface h-fit p-7">
            <p className="text-sm font-bold text-[#172033]">Imagen del producto</p>
            <p className="mt-1 text-sm text-[#647084]">
              Usa una imagen clara para reconocer el articulo en catalogo.
            </p>

            <label
              htmlFor="image-upload"
              className="mt-5 inline-block cursor-pointer rounded-md border border-[#cfd6e2] bg-white px-4 py-2 text-sm font-bold text-[#123c69] hover:bg-[#f8fafc]"
            >
              Seleccionar archivo
            </label>

            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleImageChange}
              className="hidden"
            />

            {imageFile && (
              <p className="mt-3 text-sm text-[#647084]">
                Archivo seleccionado:{" "}
                <span className="font-semibold text-[#172033]">{imageFile.name}</span>
              </p>
            )}

            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                className="mt-5 h-56 w-full rounded-md border border-[#d8dee8] bg-[#f8fafc] object-contain"
              />
            )}
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default AddEditProductPage;

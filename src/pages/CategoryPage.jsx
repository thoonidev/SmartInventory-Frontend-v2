import React, { useCallback, useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import IconButton from "../component/IconButton";
import { useConfirm } from "../component/confirmContext";
import { ValidatedField } from "../component/FormControls";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const confirm = useConfirm();

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await ApiService.getAllCategory();
      if (response.status === 200) {
        setCategories(response.categories || []);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error al obtener categorias."
      );
    }
  }, [showMessage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const saveCategory = async () => {
    if (!categoryName.trim()) {
      showMessage("El nombre de la categoria es obligatorio");
      return;
    }
    if (categoryName.trim().length > 80) {
      showMessage("El nombre de la categoria no debe superar 80 caracteres.");
      return;
    }
    const ok = await confirm({
      title: isEditing ? "Actualizar categoria" : "Crear categoria",
      message: isEditing
        ? "Se guardara el nuevo nombre de la categoria. Desea continuar?"
        : "Se creara una nueva categoria para clasificar productos. Desea continuar?",
      confirmLabel: isEditing ? "Actualizar" : "Crear categoria",
      tone: "primary",
    });
    if (!ok) return;

    try {
      if (isEditing) {
        await ApiService.updateCategory(editingCategoryId, {
          name: categoryName,
        });
        showMessage("Categoria actualizada correctamente");
      } else {
        await ApiService.createCategory({ name: categoryName });
        showMessage("Categoria creada correctamente");
      }
      setCategoryName("");
      setIsEditing(false);
      setEditingCategoryId(null);
      loadCategories();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo guardar la categoria."
      );
    }
  };

  const handleEditCategory = (category) => {
    setIsEditing(true);
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
  };

  const handleDeleteCategory = async (categoryId) => {
    const ok = await confirm({
      title: "Archivar categoria",
      message: "La categoria dejara de aparecer para nuevas clasificaciones, pero los datos historicos se conservan. Desea continuar?",
      confirmLabel: "Archivar",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await ApiService.deleteCategory(categoryId);
      setCategories((current) =>
        current.filter((category) => category.id !== categoryId)
      );
      showMessage("Categoria archivada correctamente");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo archivar la categoria."
      );
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="saas-kicker">Catalogo</p>
          <h1 className="saas-title mt-1">Categorias</h1>
          <p className="mt-2 text-sm text-[#647084]">
            Clasifica productos para inventario, reportes y analisis ABC.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#bfe1d2] bg-[#edf7f3] px-4 py-3 text-sm font-semibold text-[#2f6f73]">
            {message}
          </p>
        )}

        <section className="saas-surface p-5">
          <p className="mb-4 text-sm font-bold text-[#172033]">
            {isEditing ? "Editar categoria seleccionada" : "Nueva categoria"}
          </p>
          <div className="flex flex-col gap-3 md:flex-row">
            <ValidatedField
              value={categoryName}
              type="text"
              label=""
              placeholder="Nombre de la categoria"
              onChange={setCategoryName}
              required
              validator={(value) => value.trim().length > 0 && value.trim().length <= 80}
              errorMessage="Ingrese una categoria de maximo 80 caracteres."
              className="flex-1"
            />
            <IconButton
              icon={isEditing ? "save" : "add"}
              label={isEditing ? "Actualizar categoria" : "Agregar categoria"}
              onClick={saveCategory}
              variant="primary"
            />
            {isEditing && (
              <IconButton
                icon="cancel"
                label="Cancelar edicion"
                onClick={() => {
                  setIsEditing(false);
                  setEditingCategoryId(null);
                  setCategoryName("");
                }}
              />
            )}
          </div>
        </section>

        {categories.length > 0 ? (
          <div className="saas-surface saas-table-scroll">
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-5 py-3 text-left font-bold text-[#526071]">
                    Categoria
                  </th>
                  <th className="px-5 py-3 text-right font-bold text-[#526071]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-[#f8fafc]">
                    <td className="px-5 py-4 font-bold text-[#172033]">
                      {category.name}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <IconButton
                        icon="edit"
                        label="Editar categoria"
                        onClick={() => handleEditCategory(category)}
                        className="mr-2"
                      />
                      <IconButton
                        icon="delete"
                        label="Archivar categoria"
                        onClick={() => handleDeleteCategory(category.id)}
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
            No hay categorias registradas.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;

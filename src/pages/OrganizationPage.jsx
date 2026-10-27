import React, { useCallback, useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { userRoleLabels } from "../constants/translations";
import IconButton from "../component/IconButton";
import { useConfirm } from "../component/confirmContext";
import { ValidatedField, ValidatedSelect } from "../component/FormControls";
import { firstValidationError, isBlank, isEmail, isPeruvianMobile, isPeruvianRuc } from "../utils/validation";

const emptyUser = {
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  role: "MANAGER",
  active: true,
};

const OrganizationPage = () => {
  const [organization, setOrganization] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState(emptyUser);
  const [newUser, setNewUser] = useState(emptyUser);
  const [message, setMessage] = useState("");
  const confirm = useConfirm();

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [orgResponse, usersResponse] = await Promise.all([
        ApiService.getCurrentOrganization(),
        ApiService.getCurrentOrganizationUsers(),
      ]);
      setOrganization(orgResponse.organization || null);
      setUsers(usersResponse.users || []);
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "No se pudo cargar la informacion de la empresa."
      );
    }
  }, [showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOrganizationChange = (field, value) => {
    setOrganization((current) => ({ ...current, [field]: value }));
  };

  const saveOrganization = async () => {
    const validationMessage = firstValidationError([
      { valid: organization?.name && !isBlank(organization.name), message: "Ingrese el nombre de la empresa." },
      { valid: isPeruvianRuc(organization?.ruc || ""), message: "Ingrese un RUC peruano valido." },
    ]);
    if (validationMessage) {
      showMessage(validationMessage);
      return;
    }
    const ok = await confirm({
      title: "Guardar empresa",
      message: "Se actualizaran los datos fiscales y de identificacion del espacio de trabajo. Desea continuar?",
      confirmLabel: "Guardar",
      tone: "primary",
    });
    if (!ok) return;
    try {
      const response = await ApiService.updateCurrentOrganization(organization);
      ApiService.saveOrganization(response.organization || organization);
      showMessage("Empresa actualizada correctamente");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo actualizar la empresa."
      );
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user.id);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      password: "",
      role: user.role || "MANAGER",
      active: user.active !== false,
    });
  };

  const cancelEditUser = () => {
    setEditingUser(null);
    setUserForm(emptyUser);
  };

  const saveUser = async () => {
    const validationMessage = firstValidationError([
      { valid: !isBlank(userForm.name), message: "Ingrese el nombre del usuario." },
      { valid: isEmail(userForm.email), message: "Ingrese un email valido." },
      { valid: !userForm.phoneNumber || isPeruvianMobile(userForm.phoneNumber), message: "Ingrese un celular peruano valido." },
    ]);
    if (validationMessage) {
      showMessage(validationMessage);
      return;
    }
    const ok = await confirm({
      title: "Guardar usuario",
      message: "Se actualizaran los datos y permisos del usuario. Desea continuar?",
      confirmLabel: "Guardar",
      tone: "primary",
    });
    if (!ok) return;
    try {
      await ApiService.updateUser(editingUser, userForm);
      showMessage("Usuario actualizado correctamente");
      cancelEditUser();
      loadData();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo actualizar el usuario."
      );
    }
  };

  const createUser = async () => {
    const validationMessage = firstValidationError([
      { valid: !isBlank(newUser.name), message: "Ingrese el nombre del usuario." },
      { valid: isEmail(newUser.email), message: "Ingrese un email valido." },
      { valid: newUser.password.length >= 8, message: "La contrasena debe tener al menos 8 caracteres." },
      { valid: isPeruvianMobile(newUser.phoneNumber), message: "Ingrese un celular peruano valido." },
    ]);
    if (validationMessage) {
      showMessage(validationMessage);
      return;
    }
    const ok = await confirm({
      title: "Crear usuario",
      message: "Se creara un nuevo acceso para esta empresa con el rol seleccionado. Desea continuar?",
      confirmLabel: "Crear usuario",
      tone: "success",
    });
    if (!ok) return;

    try {
      await ApiService.registerUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        organizationId: organization?.id,
      });
      showMessage("Usuario creado correctamente");
      setNewUser(emptyUser);
      loadData();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo crear el usuario."
      );
    }
  };

  const toggleUserActive = async (user) => {
    const nextActive = user.active === false;
    const ok = await confirm({
      title: nextActive ? "Activar usuario" : "Desactivar usuario",
      message: nextActive
        ? "El usuario recuperara acceso al sistema. Desea continuar?"
        : "El usuario dejara de poder acceder al sistema. Desea continuar?",
      confirmLabel: nextActive ? "Activar" : "Desactivar",
      tone: nextActive ? "success" : "danger",
    });
    if (!ok) return;
    try {
      await ApiService.updateUser(user.id, { active: nextActive });
      loadData();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo cambiar el estado."
      );
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="saas-kicker">Empresa y equipo</p>
          <h1 className="saas-title mt-1">Empresa y usuarios</h1>
          <p className="mt-2 text-sm text-[#647084]">
            Administra el espacio de trabajo, datos fiscales, usuarios, roles y estado de acceso.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#bfe1d2] bg-[#edf7f3] px-4 py-3 text-sm font-semibold text-[#2f6f73]">
            {message}
          </p>
        )}

        {organization && (
          <section className="saas-surface p-6">
            <div className="flex flex-col gap-3 border-b border-[#d8dee8] pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#172033]">Datos de la empresa</h2>
                <p className="mt-1 text-sm text-[#647084]">
                  Informacion del espacio de trabajo activo.
                </p>
              </div>
              <span className="w-fit rounded border border-[#bfd7ef] bg-[#e8f1fb] px-3 py-1 text-xs font-bold text-[#123c69]">
                PLAN {organization.plan === "FREE" ? "GRATUITO" : organization.plan}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <TextInput
                label="Nombre"
                value={organization.name || ""}
                onChange={(value) => handleOrganizationChange("name", value)}
              />
              <TextInput
                label="RUC"
                value={organization.ruc || ""}
                onChange={(value) => handleOrganizationChange("ruc", value)}
              />
              <TextInput label="Plan" value={organization.plan === "FREE" ? "Gratuito" : organization.plan || "Gratuito"} disabled />
            </div>
            <button
              type="button"
              onClick={saveOrganization}
              className="saas-button-primary mt-5 px-4 py-2 text-sm"
            >
              Guardar empresa
            </button>
          </section>
        )}

        <section className="saas-surface p-6">
          <div className="border-b border-[#d8dee8] pb-4">
            <h2 className="text-xl font-bold text-[#172033]">Usuarios de la empresa</h2>
            <p className="mt-1 text-sm text-[#647084]">
              Alta de usuarios y control de permisos por rol.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 rounded-md border border-[#d8dee8] bg-[#f8fafc] p-4 md:grid-cols-6">
            <UserInput value={newUser.name} placeholder="Nombre" validator={(value) => !isBlank(value)} errorMessage="Nombre obligatorio" onChange={(value) => setNewUser((current) => ({ ...current, name: value }))} />
            <UserInput value={newUser.email} placeholder="Email" type="email" validator={isEmail} errorMessage="Email invalido" onChange={(value) => setNewUser((current) => ({ ...current, email: value }))} />
            <UserInput value={newUser.password} placeholder="Contrasena" type="password" validator={(value) => value.length >= 8} errorMessage="Minimo 8 caracteres" onChange={(value) => setNewUser((current) => ({ ...current, password: value }))} />
            <UserInput value={newUser.phoneNumber} placeholder="Celular" validator={isPeruvianMobile} errorMessage="Celular invalido" onChange={(value) => setNewUser((current) => ({ ...current, phoneNumber: value }))} />
            <RoleSelect value={newUser.role} onChange={(value) => setNewUser((current) => ({ ...current, role: value }))} />
            <button
              type="button"
              onClick={createUser}
              className="saas-button-primary px-4 py-2 text-sm"
            >
              Crear usuario
            </button>
          </div>

          <div className="saas-table-scroll mt-5">
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  {["Usuario", "Email", "Rol", "Estado", "Ultimo login", "Acciones"].map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f8fafc]">
                    <td className="px-5 py-4 font-bold text-[#172033]">
                      {editingUser === user.id ? (
                        <InlineInput value={userForm.name} validator={(value) => !isBlank(value)} onChange={(value) => setUserForm((current) => ({ ...current, name: value }))} />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#647084]">
                      {editingUser === user.id ? (
                        <InlineInput value={userForm.email} validator={isEmail} onChange={(value) => setUserForm((current) => ({ ...current, email: value }))} />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#647084]">
                      {editingUser === user.id ? (
                        <RoleSelect value={userForm.role} onChange={(value) => setUserForm((current) => ({ ...current, role: value }))} compact />
                      ) : (
                        userRoleLabels[user.role] || user.role
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded border px-3 py-1 text-xs font-bold ${
                          user.active === false
                            ? "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c]"
                            : "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]"
                        }`}
                      >
                        {user.active === false ? "Inactivo" : "Activo"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#647084]">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString("es-PE") : "-"}
                    </td>
                    <td className="px-5 py-4">
                      {editingUser === user.id ? (
                        <div className="flex gap-2">
                          <ActionButton onClick={saveUser}>Guardar</ActionButton>
                          <ActionButton onClick={cancelEditUser} muted>Cancelar</ActionButton>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <ActionButton onClick={() => startEditUser(user)}>Editar</ActionButton>
                          <ActionButton onClick={() => toggleUserActive(user)} muted>
                            {user.active === false ? "Activar" : "Desactivar"}
                          </ActionButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
};

const TextInput = ({ label, value, onChange, disabled = false }) => (
  <ValidatedField
    label={label}
    value={value}
    disabled={disabled}
    onChange={(next) => onChange?.(next)}
    required={!disabled}
    validator={(next) => disabled || (label === "RUC" ? isPeruvianRuc(next) : !isBlank(next))}
    errorMessage={label === "RUC" ? "Ingrese un RUC valido." : "Este dato es obligatorio."}
    inputClassName="disabled:bg-[#f8fafc] disabled:text-[#647084]"
  />
);

const UserInput = ({ value, onChange, placeholder, type = "text", validator, errorMessage }) => (
  <ValidatedField
    label=""
    value={value}
    type={type}
    placeholder={placeholder}
    onChange={onChange}
    required
    validator={validator}
    errorMessage={errorMessage}
    inputClassName="h-10"
  />
);

const InlineInput = ({ value, onChange, validator }) => (
  <ValidatedField
    label=""
    value={value}
    onChange={onChange}
    required
    validator={validator}
    errorMessage="Dato invalido"
    inputClassName="h-9 px-2"
  />
);

const RoleSelect = ({ value, onChange, compact = false }) => (
  compact ? <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`${compact ? "h-9" : "h-10"} rounded-md border border-[#cfd6e2] bg-white px-3 text-sm outline-none focus:border-[#123c69]`}
  >
    <option value="ADMIN">Administrador</option>
    <option value="MANAGER">Supervisor</option>
    <option value="VIEWER">Consulta</option>
  </select>
  : <ValidatedSelect
      value={value}
      onChange={onChange}
      required
      options={[
        ["ADMIN", "Administrador"],
        ["MANAGER", "Supervisor"],
        ["VIEWER", "Consulta"],
      ]}
    />
);

const ActionButton = ({ children, onClick, muted = false }) => (
  <IconButton
    icon={children === "Guardar" ? "save" : children === "Cancelar" ? "cancel" : children === "Editar" ? "edit" : "refresh"}
    label={children}
    onClick={onClick}
    variant={muted ? "neutral" : "primary"}
  />
);

export default OrganizationPage;

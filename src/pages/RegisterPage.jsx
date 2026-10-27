import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";
import { firstValidationError, isBlank, isEmail, isPeruvianMobile, isPeruvianRuc } from "../utils/validation";
import { ValidatedField } from "../component/FormControls";

const RegisterPage = () => {
  const [organizationName, setOrganizationName] = useState("");
  const [ruc, setRuc] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPhoneNumber, setAdminPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationMessage = firstValidationError([
      { valid: !isBlank(organizationName), message: "Ingrese el nombre de la empresa." },
      { valid: isPeruvianRuc(ruc), message: "Ingrese un RUC peruano valido de 11 digitos." },
      { valid: !isBlank(adminName), message: "Ingrese el nombre del responsable." },
      { valid: isEmail(adminEmail), message: "Ingrese un correo valido." },
      { valid: adminPassword.length >= 8, message: "La contrasena debe tener al menos 8 caracteres." },
      { valid: isPeruvianMobile(adminPhoneNumber), message: "Ingrese un celular peruano valido." },
    ]);
    if (validationMessage) {
      showMessage(validationMessage);
      return;
    }
    try {
      const registerData = {
        organizationName,
        ruc,
        adminName,
        adminEmail,
        adminPassword,
        adminPhoneNumber,
      };
      await ApiService.registerOrganization(registerData);
      setMessage("Empresa registrada correctamente");
      navigate("/login");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error al registrar empresa: " + error
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
    <div className="min-h-screen bg-[#f4f6f8] px-5 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="saas-surface p-7">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-[#123c69] text-sm font-black text-white">
            SI
          </div>
          <p className="saas-kicker mt-8">Nueva empresa</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-[#172033]">
            Crea el espacio de trabajo de tu empresa.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#647084]">
            El registro prepara el espacio de trabajo y la cuenta responsable
            para iniciar la gestion de inventario.
          </p>

          <div className="mt-8 space-y-3">
            {[
              ["01", "Empresa y RUC"],
              ["02", "Responsable de la cuenta"],
              ["03", "Plan gratuito"],
            ].map(([step, label]) => (
              <div key={step} className="flex items-center gap-3 rounded-md border border-[#d8dee8] p-3">
                <span className="grid h-8 w-8 place-items-center rounded bg-[#e8f1fb] text-xs font-bold text-[#123c69]">
                  {step}
                </span>
                <span className="text-sm font-semibold text-[#344055]">{label}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="saas-surface p-7">
          <div className="border-b border-[#d8dee8] pb-5">
            <p className="saas-kicker">Configuracion inicial</p>
            <h2 className="mt-2 text-2xl font-bold text-[#172033]">
              Registrar empresa
            </h2>
            <p className="mt-2 text-sm text-[#647084]">
              Todas las empresas empiezan con el plan gratuito y pueden escalar desde Mi plan.
            </p>
          </div>

          {message && (
            <div className="mt-5 rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
              {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ValidatedField className="md:col-span-2" label="Nombre de la empresa" value={organizationName} onChange={setOrganizationName} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el nombre de la empresa." placeholder="Comercial Lima SAC" />
            <ValidatedField label="RUC" value={ruc} onChange={setRuc} required validator={isPeruvianRuc} errorMessage="Ingrese un RUC peruano valido de 11 digitos." placeholder="20123456789" inputMode="numeric" pattern="(10|15|17|20)[0-9]{9}" maxLength={11} />
            <ValidatedField label="Responsable de la cuenta" value={adminName} onChange={setAdminName} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el nombre del responsable." placeholder="Nombre completo" />
            <ValidatedField label="Correo del responsable" type="email" value={adminEmail} onChange={setAdminEmail} required validator={isEmail} errorMessage="Ingrese un correo valido." placeholder="correo@empresa.com" />
            <ValidatedField label="Contrasena" type="password" value={adminPassword} onChange={setAdminPassword} required validator={(value) => value.length >= 8} errorMessage="La contrasena debe tener al menos 8 caracteres." placeholder="Minimo recomendado: 8 caracteres" minLength={8} />
            <ValidatedField className="md:col-span-2" label="Celular del responsable" value={adminPhoneNumber} onChange={setAdminPhoneNumber} required validator={isPeruvianMobile} errorMessage="Ingrese un celular peruano valido." placeholder="+51 999 999 999" inputMode="tel" />

            <button type="submit" className="saas-button-primary h-11 md:col-span-2">
              Crear espacio de trabajo
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#647084]">
            Ya tienes cuenta?{" "}
            <a href="/login" className="font-bold text-[#123c69] hover:underline">
              Iniciar sesion
            </a>
          </p>
        </main>
      </div>
    </div>
  );
};

export default RegisterPage;

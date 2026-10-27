import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";
import { firstValidationError, isEmail } from "../utils/validation";
import { ValidatedField } from "../component/FormControls";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationMessage = firstValidationError([
      { valid: isEmail(email), message: "Ingrese un correo valido." },
      { valid: password.trim().length > 0, message: "Ingrese su contrasena." },
    ]);
    if (validationMessage) {
      showMessage(validationMessage);
      return;
    }
    try {
      const loginData = { email, password };
      const res = await ApiService.loginUser(loginData);

      if (res.status === 200) {
        ApiService.saveToken(res.token);
        ApiService.saveRole(res.role);
        ApiService.saveOrganization(res.organization);
        setMessage(res.message);
        navigate("/dashboard");
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error al iniciar sesion: " + error
      );
      console.log(error);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <div className="grid min-h-screen bg-[#f4f6f8] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden border-r border-[#d8dee8] bg-[#10253d] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <Link to="/" className="mb-12 flex w-fit items-center gap-3 rounded-md transition hover:opacity-90">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-white text-sm font-black text-[#123c69]">
              SI
            </div>
            <div>
              <p className="text-sm font-bold">SmartInventory Cloud</p>
              <p className="text-xs text-[#b7c3d4]">Gestion operativa en la nube</p>
            </div>
          </Link>

          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase text-[#93b7df]">
              Control empresarial
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight tracking-normal">
              Inventario, compras y trazabilidad en un solo espacio de trabajo.
            </h1>
            <p className="mt-6 text-base leading-7 text-[#c9d4e3]">
              Accede a operaciones, reportes, alertas logisticas, auditoria y
              control de datos desde una plataforma preparada para equipos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["Multiempresa", "Auditoria", "Reportes"].map((item) => (
            <div key={item} className="rounded-md border border-white/15 bg-white/5 p-3">
              <p className="text-xs font-semibold text-[#d7e2f0]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 block w-fit rounded-md transition hover:opacity-90 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-[#123c69] text-sm font-black text-white">
              SI
            </div>
            <p className="mt-3 text-sm font-bold text-[#172033]">
              SmartInventory Cloud
            </p>
          </Link>

          <div className="saas-surface p-7">
            <p className="saas-kicker">Acceso seguro</p>
            <h2 className="mt-2 text-2xl font-bold text-[#172033]">
              Inicia sesion en tu empresa
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#647084]">
              Usa tus credenciales para entrar al panel operativo de inventario.
            </p>

            {message && (
              <div className="mt-5 rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
                {message}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <ValidatedField label="Correo corporativo" type="email" placeholder="correo@empresa.com" value={email} onChange={setEmail} required validator={isEmail} errorMessage="Ingrese un correo valido." />
              <ValidatedField label="Contrasena" type="password" placeholder="Ingresa tu contrasena" value={password} onChange={setPassword} required validator={(value) => value.trim().length > 0} errorMessage="Ingrese su contrasena." />

              <button type="submit" className="saas-button-primary h-11 w-full">
                Entrar al sistema
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[#647084]">
              No tienes espacio de trabajo?{" "}
              <a href="/register" className="font-bold text-[#123c69] hover:underline">
                Crear empresa
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

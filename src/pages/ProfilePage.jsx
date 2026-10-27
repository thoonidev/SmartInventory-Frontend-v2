import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { userRoleLabels } from "../constants/translations";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await ApiService.getLoggedInUsesInfo();
        setUser(userInfo);
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Error al obtener informacion del usuario."
        );
      }
    };
    fetchUserInfo();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="saas-kicker">Cuenta</p>
          <h1 className="saas-title mt-1">Perfil</h1>
          <p className="mt-2 text-sm text-[#647084]">
            Informacion del usuario autenticado y su contexto empresarial.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
            {message}
          </p>
        )}

        {user && (
          <section className="saas-surface overflow-hidden">
            <div className="border-b border-[#d8dee8] p-7">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-md bg-[#123c69] text-lg font-black text-white">
                  {user.name?.slice(0, 2)?.toUpperCase() || "US"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#172033]">{user.name}</h2>
                  <p className="mt-1 text-sm text-[#647084]">
                    {user.organization?.name || user.organizationName || "Empresa asignada"}
                  </p>
                </div>
              </div>
            </div>

            <dl className="divide-y divide-[#eef2f6]">
              {[
                ["Email", user.email],
                ["Celular", user.phoneNumber],
                ["Rol", userRoleLabels[user.role] || user.role],
                ["Estado", user.active === false ? "Inactivo" : "Activo"],
                [
                  "Ultimo login",
                  user.lastLogin ? new Date(user.lastLogin).toLocaleString("es-PE") : "-",
                ],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-1 gap-1 px-7 py-4 sm:grid-cols-3">
                  <dt className="text-sm font-semibold text-[#647084]">{label}</dt>
                  <dd className="text-sm font-bold text-[#172033] sm:col-span-2">
                    {value || "-"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;

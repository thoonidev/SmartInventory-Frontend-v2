import React, { useCallback, useMemo, useState } from "react";
import { ConfirmContext } from "./confirmContext";

export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        title: options.title || "Confirmar accion",
        message: options.message || "Desea continuar?",
        confirmLabel: options.confirmLabel || "Confirmar",
        cancelLabel: options.cancelLabel || "Cancelar",
        tone: options.tone || "primary",
        resolve,
      });
    });
  }, []);

  const close = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  const value = useMemo(() => ({ confirm }), [confirm]);
  const toneClasses = {
    primary: "bg-[#123c69] hover:bg-[#0d2d4f]",
    danger: "bg-[#9b2c2c] hover:bg-[#7f1f1f]",
    success: "bg-[#2f6f73] hover:bg-[#285f62]",
  };

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#172033]/45 px-4 backdrop-blur-sm">
          <section className="saas-confirm-enter w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${
                dialog.tone === "danger"
                  ? "bg-[#fff4f4] text-[#9b2c2c]"
                  : dialog.tone === "success"
                  ? "bg-[#edf7f3] text-[#2f6f73]"
                  : "bg-[#e8f1fb] text-[#123c69]"
              }`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={dialog.tone === "danger" ? "M12 9v4M12 17h.01M10.3 4.4 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0z" : "M9 12l2 2 4-4M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"} />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#172033]">{dialog.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#647084]">{dialog.message}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-md border border-[#cfd6e2] bg-white px-4 py-2 text-sm font-bold text-[#465366] hover:bg-[#f8fafc]"
              >
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`rounded-md px-4 py-2 text-sm font-bold text-white ${toneClasses[dialog.tone] || toneClasses.primary}`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

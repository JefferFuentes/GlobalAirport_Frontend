import { useEffect, useRef } from "react";
import {
  ClipboardCheck,
  X,
  Info,
  UserRound,
  Plane,
  Armchair,
  Ticket,
} from "lucide-react";

export default function RegistrarCheckInModal({
  reservacion,
  onCerrar,
  onConfirmar,
  procesando = false,
  error = "",
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog.showModal();

    return () => dialog.close();
  }, []);

  function confirmar(e) {
    e.preventDefault();

    if (procesando) return;

    onConfirmar();
  }

  const datos = [
    {
      titulo: "Código de reservación",
      valor: reservacion.codigo,
      icono: Ticket,
    },
    {
      titulo: "Pasajero",
      valor: reservacion.pasajero?.nombreCompleto,
      icono: UserRound,
    },
    {
      titulo: "Número de documento",
      valor: reservacion.pasajero?.numeroDocumento,
      icono: UserRound,
    },
    {
      titulo: "Vuelo",
      valor: reservacion.vuelo?.numeroVuelo,
      icono: Plane,
    },
    {
      titulo: "Asiento",
      valor: reservacion.asiento?.numero,
      icono: Armchair,
    },
    {
      titulo: "Clase",
      valor: reservacion.asiento?.clase,
      icono: Ticket,
    },
  ];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-checkin"
      onCancel={(e) => {
        e.preventDefault();

        if (!procesando) onCerrar();
      }}
      className="fixed inset-0 m-auto max-h-[90vh]
                 w-[calc(100%-2rem)] max-w-xl
                 overflow-y-auto rounded-2xl bg-white
                 p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      <form onSubmit={confirmar} className="p-6">

        {/* Encabezado */}
        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
            <ClipboardCheck size={26} />
          </div>

          <div className="flex-1">
            <h2
              id="titulo-checkin"
              className="text-xl font-bold text-[#0C2D57]"
            >
              Registrar check-in
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Verificá la información del pasajero antes
              de confirmar el check-in.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-slate-400
                       hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* Información de la reservación */}
        <div className="mb-5 rounded-xl border
                        border-slate-200 bg-slate-50 p-4">

          <h3 className="mb-4 text-sm font-bold text-[#0C2D57]">
            Información de la reservación
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">

            {datos.map(({ titulo, valor, icono: Icono }) => (
              <div key={titulo} className="flex items-start gap-3">

                <div className="rounded-lg border border-slate-200
                                bg-white p-2 text-sky-600">
                  <Icono size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    {titulo}
                  </p>

                  <p className="break-words text-sm font-semibold
                                text-[#0C2D57]">
                    {valor ?? "No disponible"}
                  </p>
                </div>

              </div>
            ))}

          </div>

          {/* Estado de la reservación */}
          <div className="mt-5 flex items-center justify-between
                          border-t border-slate-200 pt-4">

            <span className="text-sm text-slate-500">
              Estado actual
            </span>

            <span className="inline-flex items-center gap-1.5
                             rounded-full border border-emerald-200
                             bg-emerald-50 px-3 py-1 text-xs
                             font-semibold text-emerald-700">

              <span className="h-1.5 w-1.5 rounded-full bg-current" />

              Confirmada

            </span>

          </div>

        </div>

        {/* Información sobre el check-in */}
        <div className="mb-5 flex items-start gap-3
                        rounded-xl border border-sky-200
                        bg-sky-50 p-4">

          <Info
            size={20}
            className="shrink-0 text-sky-600"
          />

          <div>
            <p className="text-sm font-semibold text-sky-800">
              Confirmación de check-in
            </p>

            <p className="mt-1 text-sm text-sky-700">
              Al confirmar, la reservación cambiará a
              Check-in realizado y se generará
              automáticamente el código de abordaje.
            </p>
          </div>

        </div>

        {/* Mensaje de error */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200
                       bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-wrap justify-end gap-3
                        border-t border-slate-100 pt-5">

          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="rounded-xl border border-slate-200
                       px-5 py-2.5 text-sm font-semibold
                       text-slate-600 hover:bg-slate-50
                       disabled:opacity-50"
          >
            Volver
          </button>

          <button
            type="submit"
            disabled={procesando}
            className="flex items-center justify-center gap-2
                       rounded-xl bg-[#0284C7] px-5 py-2.5
                       text-sm font-semibold text-white
                       hover:bg-sky-700
                       disabled:cursor-not-allowed
                       disabled:opacity-50"
          >
            <ClipboardCheck size={18} />

            {procesando
              ? "Registrando check-in..."
              : "Confirmar check-in"}
          </button>

        </div>

      </form>
    </dialog>
  );
}
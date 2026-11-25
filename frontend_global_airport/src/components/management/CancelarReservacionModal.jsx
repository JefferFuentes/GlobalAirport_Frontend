import { useEffect, useRef, useState } from "react";
import { TicketX, X, AlertTriangle } from "lucide-react";

export default function CancelarReservacionModal({
  reservacion,
  onCerrar,
  onConfirmar,
  procesando = false,
  error = "",
}) {
  const dialogRef = useRef(null);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog.showModal();

    return () => dialog.close();
  }, []);

  function confirmar(e) {
    e.preventDefault();

    if (!motivo.trim() || procesando) return;

    onConfirmar(motivo.trim());
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-cancelacion"
      onCancel={(e) => {
        e.preventDefault();

        if (!procesando) onCerrar();
      }}
      className="fixed inset-0 m-auto max-h-[90vh]
                 w-[calc(100%-2rem)] max-w-lg
                 overflow-y-auto rounded-2xl bg-white
                 p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      <form onSubmit={confirmar} className="p-6">

        {/* Encabezado */}
        <div className="mb-5 flex items-start gap-3">

          <div className="rounded-xl bg-red-100 p-3 text-red-600">
            <TicketX size={26} />
          </div>

          <div className="flex-1">
            <h2
              id="titulo-cancelacion"
              className="text-xl font-bold text-[#0C2D57]"
            >
              Cancelar reservación
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Indicá el motivo de la cancelación.
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
        <div className="mb-5 grid grid-cols-2 gap-4
                        rounded-xl border border-slate-100
                        bg-slate-50 p-4">

          <div>
            <p className="text-xs text-slate-500">
              Código de reservación
            </p>

            <p className="break-all text-sm font-semibold text-[#0C2D57]">
              {reservacion.codigo}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Pasajero
            </p>

            <p className="text-sm font-semibold text-[#0C2D57]">
              {reservacion.pasajero?.nombreCompleto || "Sin pasajero"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Vuelo
            </p>

            <p className="text-sm font-semibold text-[#0C2D57]">
              {reservacion.vuelo?.numeroVuelo || "Sin vuelo"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Asiento
            </p>

            <p className="text-sm font-semibold text-[#0C2D57]">
              {reservacion.asiento?.numero || "Sin asiento"}
            </p>
          </div>

          <div className="col-span-2 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Estado actual
            </p>

            <span className="rounded-full bg-emerald-100
                             px-3 py-1 text-xs font-semibold
                             text-emerald-700">
              Confirmada
            </span>
          </div>

        </div>

        {/* Motivo de cancelación */}
        <div className="mb-5">

          <label
            htmlFor="motivo-cancelacion"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Motivo de cancelación
            <span className="ml-1 text-red-500">*</span>
          </label>

          <textarea
            id="motivo-cancelacion"
            required
            rows={4}
            value={motivo}
            disabled={procesando}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Escribí el motivo de la cancelación..."
            className="w-full resize-none rounded-xl border
                       border-slate-200 p-3 text-sm outline-none
                       focus:border-sky-500 focus:ring-2
                       focus:ring-sky-100"
          />

          <p className="mt-1 text-xs text-slate-500">
            Este motivo quedará registrado en el sistema.
          </p>

        </div>

        {/* Advertencia */}
        <div className="mb-5 flex items-start gap-3
                        rounded-xl border border-amber-200
                        bg-amber-50 p-4">

          <AlertTriangle
            size={20}
            className="shrink-0 text-amber-600"
          />

          <p className="text-sm text-amber-800">
            La reservación permanecerá en el historial y
            el asiento volverá a estar disponible.
          </p>

        </div>

        {/* Error */}
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
        <div className="flex justify-end gap-3 border-t
                        border-slate-100 pt-5">

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
            disabled={procesando || !motivo.trim()}
            className="rounded-xl bg-red-600 px-5 py-2.5
                       text-sm font-semibold text-white
                       hover:bg-red-700
                       disabled:cursor-not-allowed
                       disabled:opacity-50"
          >
            {procesando
              ? "Cancelando..."
              : "Confirmar cancelación"}
          </button>

        </div>

      </form>
    </dialog>
  );
}
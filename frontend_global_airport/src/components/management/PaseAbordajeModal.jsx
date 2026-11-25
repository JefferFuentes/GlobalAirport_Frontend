import { useEffect, useRef } from "react";

import {
  Plane,
  X,
  Printer,
  TicketCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const etiquetasClase = {
  ECONOMICA: "Económica",
  EJECUTIVA: "Ejecutiva",
  PRIMERA_CLASE: "Primera clase",
};

function formatearFecha(fecha) {
  if (!fecha) return "No disponible";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "No disponible";
  }

  return valor.toLocaleDateString("es-CR", {
    timeZone: "America/Costa_Rica",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatearHora(fecha) {
  if (!fecha) return "--:--";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "--:--";
  }

  return valor.toLocaleTimeString("es-CR", {
    timeZone: "America/Costa_Rica",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function Campo({
  etiqueta,
  valor,
  destacado = false,
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {etiqueta}
      </p>

      <p
        className={`
          break-words font-bold text-[#0C2D57]
          ${destacado ? "text-2xl" : "text-sm"}
        `}
      >
        {valor ?? "No disponible"}
      </p>
    </div>
  );
}

export default function PaseAbordajeModal({
  checkIn,
  onCerrar,
  onImprimir,
  cargando = false,
  error = "",
}) {
  const dialogRef = useRef(null);
  const paseRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog.showModal();

    return () => {
      dialog.close();
    };
  }, []);

  const reservacion = checkIn?.reservacion;
  const pasajero = reservacion?.pasajero;
  const vuelo = reservacion?.vuelo;
  const asiento = reservacion?.asiento;

  const origen = vuelo?.aeropuertoOrigen;
  const destino = vuelo?.aeropuertoDestino;

  const clase =
    etiquetasClase[asiento?.clase] ||
    asiento?.clase ||
    "No disponible";

  const responsable =
    checkIn?.empleado?.usuario?.nombreCompleto;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="pase-abordaje-titulo"
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
      className="
        fixed inset-0 m-auto
        max-h-[92vh] w-[95%] max-w-5xl
        overflow-hidden rounded-2xl
        border border-slate-200
        bg-white p-0 shadow-2xl
        backdrop:bg-slate-950/50
        backdrop:backdrop-blur-sm
      "
    >
      <div className="flex max-h-[92vh] flex-col">

        {/* Encabezado del modal */}
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
              <TicketCheck size={25} />
            </div>

            <div>
              <h2
                id="pase-abordaje-titulo"
                className="text-lg font-bold text-[#0C2D57]"
              >
                Pase de abordaje
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Documento de abordaje del pasajero.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar pase de abordaje"
            className="
              rounded-lg p-2 text-slate-400
              transition-colors
              hover:bg-slate-100 hover:text-slate-600
            "
          >
            <X size={22} />
          </button>

        </header>

        {/* Contenido del modal */}
        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4 sm:p-6">

          {/* Cargando */}
          {cargando && (
            <div
              role="status"
              className="flex flex-col items-center justify-center gap-3 py-16"
            >
              <Loader2
                size={32}
                className="animate-spin text-sky-600"
              />

              <p className="text-sm text-slate-500">
                Consultando pase de abordaje...
              </p>
            </div>
          )}

          {/* Error */}
          {!cargando && error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <AlertCircle
                size={20}
                className="shrink-0 text-red-600"
              />

              <div>
                <p className="font-semibold text-red-700">
                  No se pudo cargar el pase de abordaje
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Sin información */}
          {!cargando &&
            !error &&
            (!checkIn || !reservacion) && (
              <div className="py-12 text-center text-sm text-slate-500">
                No hay información del pase de abordaje
                disponible.
              </div>
            )}

          {/* Documento imprimible */}
          {!cargando &&
            !error &&
            checkIn &&
            reservacion && (

              <div
                ref={paseRef}
                className="
                  pase-abordaje
                  mx-auto w-full min-w-[760px]
                  overflow-hidden rounded-2xl
                  border border-slate-300 bg-white
                  shadow-sm
                "
              >

                {/* Encabezado del boleto */}
                <div className="flex items-center justify-between gap-4 bg-[#0C2D57] px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-white/10 p-3">
                      <Plane
                        size={30}
                        className="text-white"
                      />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Global Airport
                      </h2>

                      <p className="mt-1 text-[10px] font-semibold tracking-widest text-sky-200">
                        PASE DE ABORDAJE / BOARDING PASS
                      </p>
                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-[10px] uppercase tracking-wide text-sky-200">
                      Clase / Class
                    </p>

                    <p className="text-sm font-bold uppercase text-white">
                      {clase}
                    </p>

                  </div>

                </div>

                {/* Cuerpo horizontal */}
                <div className="grid grid-cols-[7fr_3fr]">

                  {/* Sección principal */}
                  <div className="min-w-0 space-y-4 p-5">

                    {/* Pasajero */}
                    <Campo
                      etiqueta="Pasajero / Passenger"
                      valor={pasajero?.nombreCompleto}
                    />

                    {/* Ruta del vuelo */}
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">

                      {/* Aeropuerto de origen */}
                      <div className="min-w-0 flex-1">

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Origen / From
                        </p>

                        <p className="my-1 text-4xl font-bold text-[#0C2D57]">
                          {origen?.codigoIata || "---"}
                        </p>

                        <p className="break-words text-xs text-slate-500">
                          {origen?.nombre || "No disponible"}
                        </p>

                        <p className="mt-2 text-xl font-bold text-sky-600">
                          {formatearHora(
                            vuelo?.salidaProgramada
                          )}
                        </p>

                      </div>

                      {/* Separador de ruta */}
                      <div className="flex shrink-0 items-center gap-2">

                        <div className="w-6 border-t-2 border-dashed border-slate-300" />

                        <div className="rounded-full bg-sky-100 p-3">
                          <Plane
                            size={24}
                            className="text-sky-600"
                          />
                        </div>

                        <div className="w-6 border-t-2 border-dashed border-slate-300" />

                      </div>

                      {/* Aeropuerto de destino */}
                      <div className="min-w-0 flex-1 text-right">

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Destino / To
                        </p>

                        <p className="my-1 text-4xl font-bold text-[#0C2D57]">
                          {destino?.codigoIata || "---"}
                        </p>

                        <p className="break-words text-xs text-slate-500">
                          {destino?.nombre || "No disponible"}
                        </p>

                        <p className="mt-2 text-xl font-bold text-sky-600">
                          {formatearHora(
                            vuelo?.llegadaProgramada
                          )}
                        </p>

                      </div>

                    </div>

                    <p className="text-center text-[10px] text-slate-500">
                      Horas expresadas en horario de Costa Rica.
                    </p>

                    {/* Información principal del vuelo */}
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-4">

                      <Campo
                        etiqueta="Vuelo / Flight"
                        valor={vuelo?.numeroVuelo}
                      />

                      <Campo
                        etiqueta="Fecha de salida / Date"
                        valor={formatearFecha(
                          vuelo?.salidaProgramada
                        )}
                      />

                      <Campo
                        etiqueta="Asiento / Seat"
                        valor={asiento?.numero}
                        destacado
                      />

                      <Campo
                        etiqueta="Clase / Class"
                        valor={clase}
                      />

                      <Campo
                        etiqueta="Reservación / Booking"
                        valor={reservacion?.codigo}
                      />

                      <Campo
                        etiqueta="Fecha de llegada / Arrival"
                        valor={formatearFecha(
                          vuelo?.llegadaProgramada
                        )}
                      />

                    </div>

                    {/* Código de abordaje */}
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                        Código de abordaje / Boarding code
                      </p>

                      <p className="mt-1 break-all font-mono text-base font-bold tracking-wide text-[#0C2D57]">
                        {checkIn.codigoAbordaje}
                      </p>

                    </div>

                    {/* Información del check-in */}
                    <div className="grid grid-cols-2 gap-3">

                      <Campo
                        etiqueta="Check-in registrado"
                        valor={
                          `${formatearFecha(
                            checkIn.creadoEn
                          )} - ${formatearHora(
                            checkIn.creadoEn
                          )}`
                        }
                      />

                      {responsable && (
                        <Campo
                          etiqueta="Atendido por"
                          valor={responsable}
                        />
                      )}

                    </div>

                  </div>

                  {/* Talón lateral */}
                  <div className="relative min-w-0 border-l-2 border-dashed border-slate-300 bg-slate-50 p-5">

                    {/* Simulación de perforaciones */}
                    <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full border-b border-slate-300 bg-slate-100" />

                    <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full border-t border-slate-300 bg-slate-100" />

                    <div className="space-y-4">

                      <div className="flex items-center gap-2 text-sky-600">

                        <TicketCheck size={18} />

                        <p className="text-xs font-bold tracking-wide">
                          BOARDING PASS
                        </p>

                      </div>

                      <Campo
                        etiqueta="Pasajero / Passenger"
                        valor={pasajero?.nombreCompleto}
                      />

                      <Campo
                        etiqueta="Vuelo / Flight"
                        valor={vuelo?.numeroVuelo}
                      />

                      {/* Ruta resumida */}
                      <div className="flex items-center justify-between gap-2">

                        <p className="text-2xl font-bold text-[#0C2D57]">
                          {origen?.codigoIata || "---"}
                        </p>

                        <Plane
                          size={20}
                          className="shrink-0 text-sky-600"
                        />

                        <p className="text-2xl font-bold text-[#0C2D57]">
                          {destino?.codigoIata || "---"}
                        </p>

                      </div>

                      <Campo
                        etiqueta="Fecha / Date"
                        valor={formatearFecha(
                          vuelo?.salidaProgramada
                        )}
                      />

                      <Campo
                        etiqueta="Salida / Departure"
                        valor={formatearHora(
                          vuelo?.salidaProgramada
                        )}
                      />

                      {/* Asiento destacado */}
                      <div className="rounded-xl border border-sky-200 bg-sky-100 p-4 text-center">

                        <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">
                          Asiento / Seat
                        </p>

                        <p className="mt-1 text-4xl font-bold text-[#0C2D57]">
                          {asiento?.numero || "--"}
                        </p>

                      </div>

                      <Campo
                        etiqueta="Clase / Class"
                        valor={clase}
                      />

                      <Campo
                        etiqueta="Reservación / Booking"
                        valor={reservacion?.codigo}
                      />

                    </div>

                  </div>

                </div>

                {/* Pie del boleto */}
                <footer className="flex items-center justify-between gap-3 bg-[#0C2D57] px-5 py-3">

                  <p className="text-xs text-white">
                    Global Airport · Gracias por viajar con nosotros.
                  </p>

                  <div className="flex shrink-0 items-center gap-2 text-emerald-300">

                    <CheckCircle2 size={16} />

                    <p className="text-xs font-semibold">
                      Check-in realizado
                    </p>

                  </div>

                </footer>

              </div>
            )}
        </div>

        {/* Botones del modal */}
        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">

          <button
            type="button"
            onClick={onCerrar}
            className="
              rounded-lg border border-slate-300
              px-5 py-2.5 text-sm font-semibold
              text-slate-600 transition-colors
              hover:bg-slate-50
            "
          >
            Cerrar
          </button>

          <button
            type="button"
            disabled={
              cargando ||
              Boolean(error) ||
              !reservacion ||
              !onImprimir
            }
            onClick={() =>
              onImprimir?.(paseRef.current)
            }
            className="
              flex items-center justify-center gap-2
              rounded-lg bg-sky-600 px-5 py-2.5
              text-sm font-semibold text-white
              transition-colors hover:bg-sky-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Printer size={18} />

            Imprimir pase de abordaje
          </button>

        </footer>

      </div>
    </dialog>
  );
}
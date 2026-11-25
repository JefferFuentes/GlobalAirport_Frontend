import { useEffect, useRef } from "react";

import {
  X,
  Plane,
  ReceiptText,
  Printer,
  UserRound,
  CreditCard,
  CalendarDays,
  Armchair,
  AlertCircle,
  Loader2,
} from "lucide-react";

const etiquetasEstado = {
  CONFIRMADA: "Confirmada",
  CHECK_IN: "Check-in realizado",
  CANCELADA: "Cancelada",
};

const estilosEstado = {
  CONFIRMADA: "bg-emerald-100 text-emerald-700",
  CHECK_IN: "bg-sky-100 text-sky-700",
  CANCELADA: "bg-red-100 text-red-700",
};

const etiquetasClase = {
  ECONOMICA: "Económica",
  EJECUTIVA: "Ejecutiva",
  PRIMERA_CLASE: "Primera clase",
};

const etiquetasPago = {
  TARJETA: "Tarjeta",
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  SINPE: "SINPE Móvil",
};

const etiquetasDocumento = {
  CEDULA: "Cédula",
  PASAPORTE: "Pasaporte",
  DIMEX: "DIMEX",
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

function formatearMonto(monto) {
  if (monto === null || monto === undefined || monto === "") {
    return "No disponible";
  }

  const valor = Number(monto);

  if (!Number.isFinite(valor)) {
    return "No disponible";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function Campo({ etiqueta, valor }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-slate-500">
        {etiqueta}
      </p>

      <p className="break-words text-sm font-semibold text-[#0C2D57]">
        {valor ?? "No disponible"}
      </p>
    </div>
  );
}

function TituloSeccion({ icono: Icono, titulo }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icono size={18} className="text-sky-600" />

      <h3 className="text-sm font-bold text-[#0C2D57]">
        {titulo}
      </h3>
    </div>
  );
}

export default function ComprobanteReservacionModal({
  comprobante,
  onCerrar,
  onImprimir,
  cargando = false,
  error = "",
}) {
  const dialogRef = useRef(null);
  const comprobanteRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog.showModal();

    return () => {
      dialog.close();
    };
  }, []);

  const pasajero = comprobante?.pasajero;
  const vuelo = comprobante?.vuelo;
  const asiento = comprobante?.asiento;

  const origen = vuelo?.aeropuertoOrigen;
  const destino = vuelo?.aeropuertoDestino;

  const cancelada = comprobante?.estado === "CANCELADA";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="comprobante-titulo"
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
      className="
        fixed inset-0 m-auto
        max-h-[92vh] w-11/12 max-w-2xl
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
              <ReceiptText size={24} />
            </div>

            <div>
              <h2
                id="comprobante-titulo"
                className="text-lg font-bold text-[#0C2D57]"
              >
                Comprobante de reservación
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Información de la reservación y del pago.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar comprobante"
            className="
              rounded-lg p-2 text-slate-400
              transition-colors
              hover:bg-slate-100 hover:text-slate-600
            "
          >
            <X size={22} />
          </button>
        </header>

        {/* Contenido desplazable */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5 sm:p-6">

          {/* Indicador de carga */}
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
                Consultando comprobante de reservación...
              </p>
            </div>
          )}

          {/* Mensaje de error */}
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
                  No se pudo cargar el comprobante
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Comprobante no disponible */}
          {!cargando && !error && !comprobante && (
            <div className="py-12 text-center text-sm text-slate-500">
              No hay información del comprobante disponible.
            </div>
          )}

          {/* Documento imprimible */}
          {!cargando && !error && comprobante && (
            <div
              ref={comprobanteRef}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >

              {/* Encabezado del documento */}
              <div className="bg-[#0C2D57] px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/10 p-3">
                    <Plane size={30} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      Global Airport
                    </h2>

                    <p className="mt-1 text-xs font-medium tracking-widest text-sky-200">
                      COMPROBANTE DE RESERVACIÓN
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">

                {/* Código y estado */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500">
                      CÓDIGO DE RESERVACIÓN
                    </p>

                    <p className="break-all text-xl font-bold text-[#0C2D57]">
                      {comprobante.codigo}
                    </p>
                  </div>

                  <span
                    className={`
                      rounded-full px-3 py-1.5
                      text-xs font-semibold
                      ${
                        estilosEstado[comprobante.estado] ||
                        "bg-slate-100 text-slate-600"
                      }
                    `}
                  >
                    {etiquetasEstado[comprobante.estado] ||
                      comprobante.estado}
                  </span>
                </div>

                {/* Advertencia de cancelación */}
                {cancelada && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-red-700">
                      <AlertCircle size={18} />

                      <p className="text-sm font-bold">
                        Reservación cancelada
                      </p>
                    </div>

                    <p className="mb-3 text-sm text-red-600">
                      Esta reservación ya no es válida para viajar.
                    </p>

                    <div className="space-y-2">
                      <p className="text-sm text-red-700">
                        <strong>Fecha de cancelación: </strong>

                        {formatearFecha(
                          comprobante.canceladaEn
                        )}
                      </p>

                      <p className="break-words text-sm text-red-700">
                        <strong>Motivo: </strong>

                        {comprobante.motivoCancelacion ||
                          "No especificado"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Información del pasajero */}
                <section className="border-t border-slate-200 pt-5">
                  <TituloSeccion
                    icono={UserRound}
                    titulo="Información del pasajero"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Campo
                        etiqueta="Nombre completo"
                        valor={pasajero?.nombreCompleto}
                      />
                    </div>

                    <Campo
                      etiqueta="Tipo de documento"
                      valor={
                        etiquetasDocumento[
                          pasajero?.tipoDocumento
                        ] || pasajero?.tipoDocumento
                      }
                    />

                    <Campo
                      etiqueta="Número de documento"
                      valor={pasajero?.numeroDocumento}
                    />
                  </div>
                </section>

                {/* Información del vuelo */}
                <section className="border-t border-slate-200 pt-5">
                  <TituloSeccion
                    icono={Plane}
                    titulo="Información del vuelo"
                  />

                  <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">

                      {/* Origen */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-500">
                          ORIGEN
                        </p>

                        <p className="my-1 text-3xl font-bold text-[#0C2D57]">
                          {origen?.codigoIata || "---"}
                        </p>

                        <p className="break-words text-xs text-slate-500">
                          {origen?.nombre || "No disponible"}
                        </p>

                        <p className="mt-2 font-semibold text-sky-600">
                          {formatearHora(
                            vuelo?.salidaProgramada
                          )}
                        </p>
                      </div>

                      {/* Separador */}
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="hidden w-5 border-t-2 border-dashed border-slate-300 sm:block" />

                        <div className="rounded-full bg-sky-100 p-3 text-sky-600">
                          <Plane size={22} />
                        </div>

                        <div className="hidden w-5 border-t-2 border-dashed border-slate-300 sm:block" />
                      </div>

                      {/* Destino */}
                      <div className="min-w-0 flex-1 text-right">
                        <p className="text-xs font-semibold text-slate-500">
                          DESTINO
                        </p>

                        <p className="my-1 text-3xl font-bold text-[#0C2D57]">
                          {destino?.codigoIata || "---"}
                        </p>

                        <p className="break-words text-xs text-slate-500">
                          {destino?.nombre || "No disponible"}
                        </p>

                        <p className="mt-2 font-semibold text-sky-600">
                          {formatearHora(
                            vuelo?.llegadaProgramada
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-center text-[11px] text-slate-500">
                      Horas expresadas en horario de Costa Rica.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Campo
                      etiqueta="Número de vuelo"
                      valor={vuelo?.numeroVuelo}
                    />

                    <Campo
                      etiqueta="Fecha de salida"
                      valor={formatearFecha(
                        vuelo?.salidaProgramada
                      )}
                    />

                    <Campo
                      etiqueta="Fecha de llegada"
                      valor={formatearFecha(
                        vuelo?.llegadaProgramada
                      )}
                    />

                    <Campo
                      etiqueta="Estado del vuelo"
                      valor={vuelo?.estado}
                    />
                  </div>
                </section>

                {/* Información del asiento */}
                <section className="border-t border-slate-200 pt-5">
                  <TituloSeccion
                    icono={Armchair}
                    titulo="Información del asiento"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Campo
                      etiqueta="Número de asiento"
                      valor={asiento?.numero}
                    />

                    <Campo
                      etiqueta="Clase"
                      valor={
                        etiquetasClase[asiento?.clase] ||
                        asiento?.clase
                      }
                    />
                  </div>
                </section>

                {/* Información del pago */}
                <section className="border-t border-slate-200 pt-5">
                  <TituloSeccion
                    icono={CreditCard}
                    titulo="Información del pago"
                  />

                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <Campo
                      etiqueta="Método de pago"
                      valor={
                        etiquetasPago[comprobante.metodoPago] ||
                        comprobante.metodoPago
                      }
                    />

                    <Campo
                      etiqueta="Moneda"
                      valor="Dólares estadounidenses (USD)"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-sky-700">
                        {cancelada
                          ? "Monto original"
                          : "Monto total"}
                      </p>

                      <p className="mt-1 text-xs text-sky-600">
                        USD
                      </p>
                    </div>

                    <p className="text-3xl font-bold text-[#0C2D57]">
                      {formatearMonto(comprobante.monto)}
                    </p>
                  </div>

                  {cancelada && (
                    <p className="mt-3 text-xs text-slate-500">
                      El monto mostrado corresponde a la
                      reservación original y no acredita
                      la realización de un reembolso.
                    </p>
                  )}
                </section>

                {/* Fecha de reservación */}
                <section className="border-t border-slate-200 pt-5">
                  <TituloSeccion
                    icono={CalendarDays}
                    titulo="Información de la reservación"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Campo
                      etiqueta="Fecha de reservación"
                      valor={formatearFecha(
                        comprobante.fechaReservacion
                      )}
                    />

                    <Campo
                      etiqueta="Hora de reservación"
                      valor={formatearHora(
                        comprobante.fechaReservacion
                      )}
                    />
                  </div>
                </section>

                {/* Pie del documento */}
                <footer className="border-t border-dashed border-slate-300 pt-5 text-center">
                  <p className="text-sm font-semibold text-[#0C2D57]">
                    Gracias por elegir Global Airport.
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Este documento es un comprobante de
                    reservación y no sustituye el pase de
                    abordaje.
                  </p>
                </footer>
              </div>
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
              !comprobante ||
              !onImprimir
            }
            onClick={() =>
              onImprimir?.(comprobanteRef.current)
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

            Imprimir comprobante
          </button>
        </footer>
      </div>
    </dialog>
  );
}
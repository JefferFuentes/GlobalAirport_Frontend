import { useMemo, useState } from "react";

import {
  Search,
  UserRound,
  UserRoundPlus,
  UserRoundSearch,
  CheckCircle2,
  CreditCard,
  X,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarDocumento(valor) {
  return normalizarTexto(valor)
    .replace(/[\s-]/g, "");
}

function obtenerIniciales(nombre) {
  return String(nombre ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

function obtenerTipoDocumento(tipo) {
  const tipos = {
    CEDULA: "Cédula",
    PASAPORTE: "Pasaporte",
    RESIDENCIA: "Residencia",
  };

  return tipos[tipo] || tipo || "Documento";
}

function ocultarDocumento(documento) {

  const valor = String(documento ?? "").trim();

  if (!valor) {
    return "No registrado";
  }

  if (valor.length <= 4) {
    return "•".repeat(valor.length);
  }

  return (
    "•".repeat(valor.length - 4) +
    valor.slice(-4)
  );
}

export default function SelectorPasajeros({
  pasajeros = [],
  pasajeroId = "",
  onSeleccionar,
  onRegistrar,
  cargando = false,
  error = "",
  disabled = false,
}) {
  const [busqueda, setBusqueda] = useState("");

  // =====================================
  // PASAJERO SELECCIONADO
  // =====================================

  const pasajeroSeleccionado = useMemo(() => {
    return pasajeros.find(
      (pasajero) =>
        String(pasajero.id) === String(pasajeroId)
    ) || null;
  }, [pasajeros, pasajeroId]);

  // =====================================
  // FILTRAR PASAJEROS
  // =====================================

  const pasajerosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);
    const documento = normalizarDocumento(busqueda);

    if (!texto) return [];

    return pasajeros
      .filter((pasajero) => {
        const nombre = normalizarTexto(
          pasajero.nombreCompleto
        );

        const numeroDocumento = normalizarDocumento(
          pasajero.numeroDocumento
        );

        return (
          nombre.includes(texto) ||
          (
            documento !== "" &&
            numeroDocumento.includes(documento)
          )
        );
      })
      .sort((a, b) =>
        String(a.nombreCompleto ?? "").localeCompare(
          String(b.nombreCompleto ?? ""),
          "es"
        )
      );
  }, [pasajeros, busqueda]);

  const resultadosVisibles = pasajerosFiltrados.slice(
    0,
    20
  );

  // =====================================
  // SELECCIONAR PASAJERO
  // =====================================

  function seleccionarPasajero(pasajero) {
    if (disabled || cargando) return;

    onSeleccionar(pasajero.id);

    setBusqueda("");
  }

  // =====================================
  // CAMBIAR PASAJERO
  // =====================================

  function cambiarPasajero() {
    if (disabled) return;

    onSeleccionar("");

    setBusqueda("");
  }

  // =====================================
  // REGISTRAR NUEVO PASAJERO
  // =====================================

  function registrarPasajero() {
    if (
      disabled ||
      cargando ||
      error ||
      !busqueda.trim() ||
      pasajerosFiltrados.length > 0
    ) {
      return;
    }

    onRegistrar(busqueda.trim());
  }

  // =====================================
  // INTERFAZ
  // =====================================

  return (
    <section className="space-y-3">

      {/* ENCABEZADO */}

      <div className="flex items-center gap-2">

        <UserRound
          size={19}
          className="text-sky-600"
        />

        <h3 className="text-sm font-semibold text-[#0C2D57]">
          Información del pasajero
          <span className="ml-1 text-red-500">*</span>
        </h3>

      </div>

      {/* PASAJERO SELECCIONADO */}

      {pasajeroSeleccionado ? (

        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">

          <div className="flex flex-wrap items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">

              {obtenerIniciales(
                pasajeroSeleccionado.nombreCompleto
              )}

            </div>

            <div className="min-w-0 flex-1">

              <div className="mb-1 flex items-center gap-1.5">

                <CheckCircle2
                  size={15}
                  className="text-emerald-600"
                />

                <span className="text-xs font-medium text-emerald-600">
                  Pasajero seleccionado
                </span>

              </div>

              <p className="break-words text-sm font-semibold text-[#0C2D57]">

                {pasajeroSeleccionado.nombreCompleto}

              </p>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">

                <CreditCard size={13} />

                <span className="break-all">

                  {obtenerTipoDocumento(
                    pasajeroSeleccionado.tipoDocumento
                  )}

                  {": "}

                  {ocultarDocumento(
                    pasajeroSeleccionado.numeroDocumento
                  )}

                </span>

              </div>

            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={cambiarPasajero}
              className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            >

              Cambiar

            </button>

          </div>

        </div>

      ) : (

        <>

          {/* BARRA DE BÚSQUEDA */}

          <div className="relative">

            <Search
              size={19}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              aria-label="Buscar pasajero por nombre o documento"
              autoComplete="off"
              value={busqueda}
              disabled={disabled || cargando || !!error}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
              placeholder="Buscar por nombre o número de documento..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
            />

            {busqueda && (

              <button
                type="button"
                aria-label="Limpiar búsqueda"
                disabled={disabled}
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >

                <X size={16} />

              </button>

            )}

          </div>

          {/* ESTADO DE CARGA */}

          {cargando ? (

            <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200">

              <LoaderCircle
                size={27}
                className="animate-spin text-sky-500"
              />

              <p className="text-sm text-slate-500">
                Cargando pasajeros...
              </p>

            </div>

          ) : error ? (

            /* ERROR DE CONSULTA */

            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >

              <AlertCircle
                size={20}
                className="shrink-0 text-red-600"
              />

              <div>

                <p className="text-sm font-semibold text-red-700">
                  No fue posible consultar los pasajeros
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {error}
                </p>

              </div>

            </div>

          ) : !busqueda.trim() ? (

            /* ESTADO INICIAL */

            <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-5 text-center">

              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-500">

                <UserRoundSearch size={25} />

              </div>

              <p className="text-sm font-semibold text-[#0C2D57]">
                Buscar un pasajero
              </p>

              <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                Ingresá el nombre o número de documento
                para verificar si el pasajero ya está registrado.
              </p>

            </div>

          ) : pasajerosFiltrados.length > 0 ? (

            /* RESULTADOS DE BÚSQUEDA */

            <div className="overflow-hidden rounded-xl border border-slate-200">

              <div
                aria-live="polite"
                className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"
              >

                <p className="text-xs font-semibold text-slate-600">
                  Resultados de búsqueda
                </p>

                <span className="text-xs font-medium text-sky-700">

                  {pasajerosFiltrados.length}

                  {" encontrados"}

                </span>

              </div>

              <div className="max-h-[260px] divide-y divide-slate-100 overflow-y-auto">

                {resultadosVisibles.map((pasajero) => (

                  <div
                    key={pasajero.id}
                    className="flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-sky-50/50"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">

                      {obtenerIniciales(
                        pasajero.nombreCompleto
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="break-words text-sm font-semibold text-[#0C2D57]">

                        {pasajero.nombreCompleto}

                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">

                        {obtenerTipoDocumento(
                          pasajero.tipoDocumento
                        )}

                        {": "}

                        {ocultarDocumento(
                          pasajero.numeroDocumento
                        )}

                      </p>

                      <p className="mt-1 text-xs text-slate-400">

                        {pasajero.nacionalidad}

                      </p>

                    </div>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        seleccionarPasajero(pasajero)
                      }
                      className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition hover:border-sky-600 hover:bg-sky-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      Seleccionar

                    </button>

                  </div>

                ))}

              </div>

              {pasajerosFiltrados.length > 20 && (

                <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">

                  Se muestran los primeros 20 resultados.
                  Especificá más la búsqueda.

                </div>

              )}

            </div>

          ) : (

            /* PASAJERO NO ENCONTRADO */

            <div className="flex min-h-[210px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">

              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600">

                <UserRoundSearch size={28} />

              </div>

              <h4 className="text-sm font-semibold text-[#0C2D57]">
                No se encontraron pasajeros
              </h4>

              <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                Verificá el número de documento ingresado.
                Si el pasajero todavía no está registrado,
                podés registrarlo para continuar.
              </p>

              <button
                type="button"
                disabled={disabled}
                onClick={registrarPasajero}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <UserRoundPlus size={17} />

                Registrar nuevo pasajero

              </button>

            </div>

          )}

        </>

      )}

      {/* INFORMACIÓN ADICIONAL */}

      <p className="text-xs leading-relaxed text-slate-500">

        {pasajeroSeleccionado
          ? "La reservación quedará asociada al pasajero seleccionado."
          : "Es necesario seleccionar un pasajero registrado para continuar con la reservación."}

      </p>

    </section>
  );
}
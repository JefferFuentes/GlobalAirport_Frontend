import { useState, useRef, useEffect } from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  Plane,
  Building2,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  LogOut,
  LoaderCircle,
  AlertCircle,
  Info,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function SelectAirport() {

  const navigate = useNavigate();

  const {
    usuario,
    rol,
    aeropuertos,
    aeropuertoActivo,
    autenticado,
    cargando,
    requiereSeleccionAeropuerto,
    cambiandoAeropuerto,
    cambiarAeropuerto,
    cerrarSesion,
  } = useAuth();

  // =====================================
  // ESTADOS
  // =====================================

  const [seleccionado, setSeleccionado] =
    useState(null);

  const [error, setError] = useState("");

  const operacionEnCurso = useRef(false);

  const componenteActivo = useRef(false);

  useEffect(() => {
    componenteActivo.current = true;

    return () => {
      componenteActivo.current = false;
    };
  }, []);

  // =====================================
  // CONTEXTO DE SELECCIÓN
  // =====================================

  const listaAeropuertos = Array.isArray(aeropuertos)
    ? aeropuertos
    : [];

  const seleccionInicial =
    requiereSeleccionAeropuerto ||
    !aeropuertoActivo?.id;

  const esCambioAeropuerto = !seleccionInicial;

  const puedeCambiar =
    rol === "ADMIN_AEROPUERTO" &&
    listaAeropuertos.length > 1;

  const aeropuertoSeleccionado =
    listaAeropuertos.find(
      (aeropuerto) =>
        String(aeropuerto.id) === String(seleccionado)
    );

  const seleccionEsAeropuertoActual =
    Boolean(aeropuertoSeleccionado) &&
    String(aeropuertoSeleccionado.id) ===
      String(aeropuertoActivo?.id);

  const procesando = cambiandoAeropuerto;

  const puedeContinuar =
    Boolean(aeropuertoSeleccionado) &&
    !procesando &&
    (
      seleccionInicial ||
      !seleccionEsAeropuertoActual
    );

  // =====================================
  // VALIDAR SESIÓN
  // =====================================

  if (cargando) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">

        <LoaderCircle
          size={36}
          className="animate-spin text-sky-600"
        />

        <p className="text-sm text-slate-600">
          Verificando sesión...
        </p>

      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol !== "ADMIN_AEROPUERTO") {
    return <Navigate to="/home" replace />;
  }

  if (!seleccionInicial && !puedeCambiar) {
    return <Navigate to="/home" replace />;
  }

  // =====================================
  // SELECCIONAR AEROPUERTO
  // =====================================

  function handleSeleccionar(aeropuertoId) {

    if (procesando || operacionEnCurso.current) {
      return;
    }

    const aeropuerto = listaAeropuertos.find(
      (item) =>
        String(item.id) === String(aeropuertoId)
    );

    if (!aeropuerto) {
      setError(
        "El aeropuerto seleccionado no está disponible."
      );

      return;
    }

    if (
      esCambioAeropuerto &&
      String(aeropuerto.id) ===
        String(aeropuertoActivo?.id)
    ) {
      return;
    }

    setSeleccionado(aeropuerto.id);

    setError("");
  }

  // =====================================
  // CONFIRMAR SELECCIÓN
  // =====================================

  async function handleContinuar() {

    if (
      !puedeContinuar ||
      operacionEnCurso.current
    ) {
      return;
    }

    operacionEnCurso.current = true;

    setError("");

    try {

      await cambiarAeropuerto(
        aeropuertoSeleccionado.id
      );

      if (!componenteActivo.current) return;

      navigate("/home", {
        replace: true,
      });

    } catch (err) {

      if (!componenteActivo.current) return;

      setError(
        err.message ||
          "No se pudo seleccionar el aeropuerto."
      );

    } finally {

      operacionEnCurso.current = false;

    }
  }

  // =====================================
  // CANCELAR CAMBIO
  // =====================================

  function handleCancelar() {

    if (
      seleccionInicial ||
      procesando ||
      operacionEnCurso.current
    ) {
      return;
    }

    navigate("/home", {
      replace: true,
    });
  }

  // =====================================
  // CERRAR SESIÓN
  // =====================================

  function handleCerrarSesion() {

    if (procesando || operacionEnCurso.current) {
      return;
    }

    cerrarSesion();

    navigate("/login", {
      replace: true,
    });
  }

  // =====================================
  // INTERFAZ
  // =====================================

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">

      {/* LOGOTIPO */}

      <div className="mb-8 flex items-center gap-3">

        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white">

          <Plane className="h-7 w-7" />

        </span>

        <span className="text-2xl font-extrabold text-[#0C2D57]">

          Global{" "}

          <span className="text-sky-600">
            Airport
          </span>

        </span>

      </div>

      {/* CONTENEDOR PRINCIPAL */}

      <section className="w-full max-w-xl rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">

        {/* ENCABEZADO */}

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">

            {esCambioAeropuerto ? (

              <ArrowLeftRight size={30} />

            ) : (

              <Building2 size={30} />

            )}

          </div>

          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1.5 text-sm font-semibold text-sky-800">

            {usuario?.nombreCompleto}

          </span>

          <h1 className="mt-4 text-2xl font-extrabold text-[#0C2D57]">

            {esCambioAeropuerto
              ? "Cambiar aeropuerto"
              : "Seleccioná un aeropuerto"}

          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">

            {esCambioAeropuerto
              ? "Seleccioná el aeropuerto desde el cual deseás continuar gestionando las operaciones."
              : "Elegí el aeropuerto desde el cual vas a gestionar las operaciones."}

          </p>

        </div>

        {/* AEROPUERTO ACTUAL */}

        {esCambioAeropuerto && (

          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">

              <Building2 size={23} />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-xs font-semibold text-emerald-700">

                Aeropuerto activo actualmente

              </p>

              <p className="mt-1 font-semibold text-[#0C2D57]">

                {aeropuertoActivo?.nombre}

              </p>

              <p className="text-xs text-emerald-700">

                {aeropuertoActivo?.codigoIata}

              </p>

            </div>

            <CheckCircle2
              size={22}
              className="shrink-0 text-emerald-600"
            />

          </div>

        )}

        {/* MENSAJE DE ERROR */}

        {error && (

          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >

            <AlertCircle
              size={19}
              className="shrink-0"
            />

            <span>{error}</span>

          </div>

        )}

        {/* ENCABEZADO DE AEROPUERTOS */}

        <div className="mb-3 flex items-center justify-between">

          <h2 className="text-sm font-semibold text-[#0C2D57]">

            Aeropuertos asignados

          </h2>

          <span className="text-xs text-slate-500">

            {listaAeropuertos.length} disponibles

          </span>

        </div>

        {/* SIN AEROPUERTOS ASIGNADOS */}

        {listaAeropuertos.length === 0 && (

          <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">

            <AlertCircle
              size={32}
              className="text-amber-600"
            />

            <h3 className="font-semibold text-amber-800">

              No tenés aeropuertos asignados

            </h3>

            <p className="text-sm leading-relaxed text-amber-700">

              Contactá al administrador general para
              solicitar una asignación antes de
              continuar utilizando el sistema.

            </p>

          </div>

        )}

        {/* LISTADO DE AEROPUERTOS */}

        <div className="max-h-[380px] space-y-3 overflow-y-auto">

          {listaAeropuertos.map((aeropuerto) => {

            const activo =
              String(seleccionado) ===
              String(aeropuerto.id);

            const esAeropuertoActual =
              esCambioAeropuerto &&
              String(aeropuertoActivo?.id) ===
                String(aeropuerto.id);

            return (

              <button
                key={aeropuerto.id}
                type="button"
                disabled={
                  procesando ||
                  esAeropuertoActual
                }
                aria-pressed={activo}
                onClick={() =>
                  handleSeleccionar(aeropuerto.id)
                }
                className={`
                  flex w-full items-center gap-4
                  rounded-xl border-2 p-4 text-left
                  transition
                  disabled:cursor-not-allowed
                  ${
                    esAeropuertoActual
                      ? "border-emerald-200 bg-emerald-50/50"
                      : activo
                        ? "border-sky-500 bg-sky-50"
                        : "border-slate-200 hover:border-sky-300 hover:bg-slate-50"
                  }
                `}
              >

                {/* ICONO */}

                <span
                  className={`
                    flex h-12 w-12 shrink-0
                    items-center justify-center rounded-xl
                    ${
                      esAeropuertoActual
                        ? "bg-emerald-100 text-emerald-600"
                        : activo
                          ? "bg-sky-100 text-sky-600"
                          : "bg-slate-100 text-slate-500"
                    }
                  `}
                >

                  <Building2 className="h-6 w-6" />

                </span>

                {/* INFORMACIÓN */}

                <div className="min-w-0 flex-1">

                  <h3 className="font-bold text-[#0C2D57]">

                    {aeropuerto.nombre}

                  </h3>

                  <p className="mt-1 text-sm text-slate-500">

                    {aeropuerto.codigoIata} ·{" "}
                    {aeropuerto.ciudad},{" "}
                    {aeropuerto.pais}

                  </p>

                  {esAeropuertoActual && (

                    <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">

                      Aeropuerto actual

                    </span>

                  )}

                </div>

                {/* INDICADOR */}

                {esAeropuertoActual ? (

                  <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />

                ) : activo ? (

                  <CheckCircle2 className="h-6 w-6 shrink-0 text-sky-600" />

                ) : (

                  <Circle className="h-6 w-6 shrink-0 text-slate-300" />

                )}

              </button>

            );
          })}

        </div>

        {/* INFORMACIÓN DEL CAMBIO */}

        {esCambioAeropuerto && (

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">

            <Info
              size={18}
              className="mt-0.5 shrink-0 text-sky-600"
            />

            <p className="text-xs leading-relaxed text-sky-800">

              Al cambiar de aeropuerto, los módulos
              actualizarán su contexto operativo según
              el aeropuerto seleccionado y los permisos
              de tu cuenta.

            </p>

          </div>

        )}

        {/* RESUMEN DE SELECCIÓN */}

        {aeropuertoSeleccionado &&
          !seleccionEsAeropuertoActual && (

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="text-xs font-medium text-slate-500">

                Aeropuerto seleccionado

              </p>

              <p className="mt-1 text-sm font-semibold text-[#0C2D57]">

                {aeropuertoSeleccionado.nombre}{" "}
                ({aeropuertoSeleccionado.codigoIata})

              </p>

            </div>

          )}

        {/* CONFIRMAR */}

        <button
          type="button"
          onClick={handleContinuar}
          disabled={!puedeContinuar}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-4 font-bold text-white transition hover:bg-[#0C2D57] disabled:cursor-not-allowed disabled:opacity-50"
        >

          {procesando ? (

            <>

              <LoaderCircle className="h-5 w-5 animate-spin" />

              {esCambioAeropuerto
                ? "Cambiando aeropuerto..."
                : "Seleccionando aeropuerto..."}

            </>

          ) : (

            <>

              {esCambioAeropuerto
                ? "Confirmar cambio"
                : "Continuar"}

              <ArrowRight className="h-5 w-5" />

            </>

          )}

        </button>

        {/* CANCELAR CAMBIO */}

        {esCambioAeropuerto && (

          <button
            type="button"
            onClick={handleCancelar}
            disabled={procesando}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <ArrowLeft size={18} />

            Cancelar cambio

          </button>

        )}

        {/* CERRAR SESIÓN */}

        <button
          type="button"
          onClick={handleCerrarSesion}
          disabled={procesando}
          className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >

          <LogOut className="h-4 w-4" />

          Cerrar sesión

        </button>

      </section>

      {/* FOOTER */}

      <p className="mt-8 text-center text-xs text-slate-400">

        © {new Date().getFullYear()} Global Airport.
        Todos los derechos reservados.

      </p>

    </main>
  );
}
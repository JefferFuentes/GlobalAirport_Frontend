import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Plane,
  Building2,
  CheckCircle2,
  Circle,
  ArrowRight,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function SelectAirport() {
  const navigate = useNavigate();

  const {
    usuario,
    aeropuertos,
    autenticado,
    cargando,
    requiereSeleccionAeropuerto,
    cambiarAeropuerto,
    cerrarSesion,
  } = useAuth();

  const [seleccionado, setSeleccionado] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (!requiereSeleccionAeropuerto) {
    return <Navigate to="/Home" replace />;
  }

  async function handleContinuar() {
    if (!seleccionado || procesando) return;

    setProcesando(true);
    setError("");

    try {
      await cambiarAeropuerto(seleccionado);

      navigate("/Home", { replace: true });
    } catch (err) {
      setError(
        err.message || "No se pudo seleccionar el aeropuerto."
      );
    } finally {
      setProcesando(false);
    }
  }

  function handleCerrarSesion() {
    cerrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-10">

      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white">
          <Plane className="h-7 w-7" />
        </span>

        <span className="text-2xl font-extrabold text-[#0C2D57]">
          Global <span className="text-sky-600">Airport</span>
        </span>
      </div>

      {/* Contenedor principal */}
      <section className="w-full max-w-xl rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">

        {/* Encabezado */}
        <div className="mb-8 text-center">
          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1.5 text-sm font-semibold text-sky-800">
            {usuario?.nombreCompleto}
          </span>

          <h1 className="mt-4 text-2xl font-extrabold text-[#0C2D57]">
            Seleccioná un aeropuerto
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Elegí el aeropuerto desde el cual vas a gestionar
            las operaciones.
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Aeropuertos disponibles */}
        <div className="space-y-3">
          {aeropuertos.map((aeropuerto) => {
            const activo = seleccionado === aeropuerto.id;

            return (
              <button
                key={aeropuerto.id}
                type="button"
                disabled={procesando}
                aria-pressed={activo}
                onClick={() => {
                  setSeleccionado(aeropuerto.id);
                  setError("");
                }}
                className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${
                  activo
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 hover:border-sky-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    activo
                      ? "bg-sky-100 text-sky-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Building2 className="h-6 w-6" />
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-[#0C2D57]">
                    {aeropuerto.nombre}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {aeropuerto.codigoIata} · {aeropuerto.ciudad},{" "}
                    {aeropuerto.pais}
                  </p>
                </div>

                {activo ? (
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-sky-600" />
                ) : (
                  <Circle className="h-6 w-6 shrink-0 text-slate-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* Continuar */}
        <button
          type="button"
          onClick={handleContinuar}
          disabled={!seleccionado || procesando}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-4 font-bold text-white transition hover:bg-[#0C2D57] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {procesando ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Seleccionando aeropuerto...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Cerrar sesión */}
        <button
          type="button"
          onClick={handleCerrarSesion}
          disabled={procesando}
          className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-600 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </section>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-slate-400">
        © 2026 Global Airport. Todos los derechos reservados.
      </p>
    </main>
  );
}
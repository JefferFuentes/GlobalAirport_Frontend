import { useEffect, useState } from "react";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Plane,
  Menu,
  X,
  LogOut,
  Building2,
  ChevronDown,
  ArrowLeftRight,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  obtenerMenuAgrupado,
  obtenerModuloPorRuta,
} from "../../config/navigation";

// =====================================
// ETIQUETAS DE ROLES
// =====================================

const etiquetasRoles = {
  ADMIN_GENERAL: "Administrador general",
  ADMIN_AEROPUERTO: "Administrador de aeropuerto",
  EMPLEADO: "Empleado",
};

// =====================================
// FUNCIONES AUXILIARES
// =====================================

function obtenerIniciales(nombre) {
  return String(nombre ?? "Usuario")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase();
}

// =====================================
// COMPONENTE PRINCIPAL
// =====================================

export default function Layout() {
  const {
    usuario,
    rol,
    aeropuertos,
    aeropuertoActivo,
    cerrarSesion,
  } = useAuth();

  const contextoOperativoKey = [
    usuario?.id ?? "sin-usuario",
    rol ?? "sin-rol",
    aeropuertoActivo?.id ?? "global",
  ].join("-");

  const navigate = useNavigate();
  const location = useLocation();

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const [perfilAbierto, setPerfilAbierto] =
    useState(false);

  const accesoGlobal = rol === "ADMIN_GENERAL";

  const puedeCambiarAeropuerto =
    rol === "ADMIN_AEROPUERTO" &&
    (aeropuertos?.length ?? 0) > 1;

  // =====================================
  // CONFIGURACIÓN DE NAVEGACIÓN
  // =====================================

  const menu = obtenerMenuAgrupado(rol);

  const moduloActual = obtenerModuloPorRuta(
    location.pathname
  );

  const tituloActual =
    moduloActual?.titulo ?? "Global Airport";

  // =====================================
  // CERRAR MENÚ AL CAMBIAR DE RUTA
  // =====================================

  useEffect(() => {
    setMenuAbierto(false);
    setPerfilAbierto(false);
  }, [location.pathname]);

  // =====================================
  // CERRAR SESIÓN
  // =====================================

  function manejarCerrarSesion() {
    cerrarSesion();

    navigate("/login", {
      replace: true,
    });
  }

  // =====================================
  // CAMBIAR AEROPUERTO
  // =====================================

  function manejarCambiarAeropuerto() {
    if (!puedeCambiarAeropuerto) return;

    setPerfilAbierto(false);
    setMenuAbierto(false);

    navigate("/seleccionar-aeropuerto");
  }

  // =====================================
  // INTERFAZ
  // =====================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* FONDO DEL MENÚ MÓVIL */}

      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* MENÚ LATERAL */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          bg-[#0C2D57] text-white
          transition-transform duration-300
          lg:translate-x-0
          ${menuAbierto
            ? "translate-x-0"
            : "-translate-x-full"
          }
        `}
      >

        {/* LOGOTIPO */}

        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4">

          <NavLink
            to="/home"
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500">

              <Plane size={25} />

            </div>

            <div>

              <h1 className="text-xl font-bold tracking-tight text-white!">
                Global <span className="text-sky-300!">Airport</span>
              </h1>

              <p className="text-xs text-sky-200">
                Sistema de gestión
              </p>

            </div>

          </NavLink>

          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >

            <X size={20} />

          </button>

        </div>

        {/* CONTEXTO OPERATIVO */}

        <div className="shrink-0 px-3 py-3">

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sky-300">

                {accesoGlobal ? (
                  <ShieldCheck size={21} />
                ) : (
                  <Building2 size={21} />
                )}

              </div>

              <div className="min-w-0">

                <p className="text-xs text-sky-200">

                  {accesoGlobal
                    ? "Alcance administrativo"
                    : "Aeropuerto activo"}

                </p>

                <p className="truncate text-sm font-semibold">

                  {accesoGlobal
                    ? "Acceso global"
                    : aeropuertoActivo?.nombre ??
                    "Sin aeropuerto activo"}

                </p>

                {!accesoGlobal &&
                  aeropuertoActivo?.codigoIata && (

                    <p className="text-xs text-sky-300">

                      {aeropuertoActivo.codigoIata}

                    </p>

                  )}

              </div>

            </div>

            {puedeCambiarAeropuerto && (

              <button
                type="button"
                onClick={manejarCambiarAeropuerto}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-sky-100 transition hover:bg-white/20"
              >

                <ArrowLeftRight size={15} />

                Cambiar aeropuerto

              </button>

            )}

          </div>

        </div>

        {/* NAVEGACIÓN DINÁMICA */}

        {/* NAVEGACIÓN DINÁMICA */}

        <nav
          aria-label="Menú principal"
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-2"
        >
          {menu.map((categoria) => (

            <section key={categoria.id}>

              {/* ETIQUETA DE CATEGORÍA */}

              <div className="mb-1.5 flex items-center gap-2 px-2">

                <h2 className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-sky-300!">
                  {categoria.titulo}
                </h2>

                <div className="h-px flex-1 bg-sky-300/25" />

              </div>

              {/* OPCIONES DEL MENÚ */}

              <div className="space-y-0.5">

                {categoria.modulos.map((modulo) => {

                  const Icono = modulo.icono;

                  return (

                    <NavLink
                      key={modulo.id}
                      to={modulo.ruta}
                      end
                      className={({ isActive }) => `
                flex items-center gap-3
                rounded-lg px-3 py-2
                text-[13px] font-medium
                transition-colors
                ${isActive
                          ? "bg-sky-600 text-white! shadow-sm"
                          : "text-slate-200! hover:bg-white/10 hover:text-white!"
                        }
              `}
                    >

                      <Icono
                        size={17}
                        className="shrink-0"
                      />

                      <span className="leading-tight">
                        {modulo.titulo}
                      </span>

                    </NavLink>

                  );
                })}

              </div>

            </section>

          ))}
        </nav>

        
        {/* PIE DEL MENÚ */}

        <div className="shrink-0 border-t border-white/10 p-4">

          <button
            type="button"
            onClick={manejarCerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-200 transition hover:bg-red-500/15 hover:text-red-200"
          >

            <LogOut size={19} />

            Cerrar sesión

          </button>

          <p className="mt-3 text-center text-[11px] text-sky-200/60">

            Global Airport © {new Date().getFullYear()}

          </p>

        </div>

      </aside>

      {/* CONTENEDOR PRINCIPAL */}

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-72">

        {/* ENCABEZADO SUPERIOR */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">

          <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6">

            {/* TÍTULO */}

            <div className="flex min-w-0 items-center gap-3">

              <button
                type="button"
                aria-label="Abrir menú"
                aria-expanded={menuAbierto}
                onClick={() => setMenuAbierto(true)}
                className="rounded-lg p-2 text-[#0C2D57] hover:bg-slate-100 lg:hidden"
              >

                <Menu size={24} />

              </button>

              <div className="min-w-0">

                <h2 className="truncate text-lg font-semibold text-[#0C2D57] sm:text-xl">

                  {tituloActual}

                </h2>

                <p className="hidden text-xs text-slate-500 sm:block">

                  Sistema de gestión aeroportuaria

                </p>

              </div>

            </div>

            {/* INFORMACIÓN DEL USUARIO */}

            <div className="relative shrink-0">

              <button
                type="button"
                aria-expanded={perfilAbierto}
                onClick={() =>
                  setPerfilAbierto((prev) => !prev)
                }
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">

                  {obtenerIniciales(
                    usuario?.nombreCompleto
                  )}

                </div>

                <div className="hidden text-left sm:block">

                  <p className="max-w-52 truncate text-sm font-semibold text-[#0C2D57]">

                    {usuario?.nombreCompleto ??
                      "Usuario"}

                  </p>

                  <p className="text-xs text-slate-500">

                    {etiquetasRoles[rol] ?? rol}

                  </p>

                </div>

                <ChevronDown
                  size={16}
                  className={`
                    text-slate-400 transition-transform
                    ${perfilAbierto
                      ? "rotate-180"
                      : ""
                    }
                  `}
                />

              </button>

              {/* MENÚ DEL PERFIL */}

              {perfilAbierto && (

                <>

                  <button
                    type="button"
                    aria-label="Cerrar menú de usuario"
                    onClick={() =>
                      setPerfilAbierto(false)
                    }
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">

                    <div className="border-b border-slate-100 p-4">

                      <div className="mb-2 flex items-center gap-2 text-sky-600">

                        <UserRound size={17} />

                        <span className="text-xs font-semibold uppercase">
                          Mi cuenta
                        </span>

                      </div>

                      <p className="text-sm font-semibold text-[#0C2D57]">

                        {usuario?.nombreCompleto}

                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">

                        {usuario?.correo}

                      </p>

                      <p className="mt-2 text-xs font-medium text-sky-600">

                        {etiquetasRoles[rol] ?? rol}

                      </p>

                    </div>

                    {puedeCambiarAeropuerto && (

                      <button
                        type="button"
                        onClick={manejarCambiarAeropuerto}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50"
                      >

                        <ArrowLeftRight size={17} />

                        Cambiar aeropuerto

                      </button>

                    )}

                    <button
                      type="button"
                      onClick={manejarCerrarSesion}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >

                      <LogOut size={17} />

                      Cerrar sesión

                    </button>

                  </div>

                </>

              )}

            </div>

          </div>

        </header>

        {/* CONTENIDO DE CADA MÓDULO */}

        <main className="min-w-0 flex-1">

          <Outlet key={contextoOperativoKey} />

        </main>

      </div>

    </div>
  );
}
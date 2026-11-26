import { Link } from "react-router-dom";

import {
  Plane,
  Building2,
  ShieldCheck,
  ArrowRight,
  LayoutGrid,
  UserRound,
  Info,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  obtenerInicioAgrupado,
  obtenerModulosInicio,
} from "../config/navigation";

// =====================================
// ETIQUETAS DE ROLES
// =====================================

const etiquetasRoles = {
  ADMIN_GENERAL: "Administrador general",
  ADMIN_AEROPUERTO: "Administrador de aeropuerto",
  EMPLEADO: "Empleado",
};

// =====================================
// COMPONENTE TARJETA DE MÓDULO
// =====================================

function TarjetaModulo({ modulo }) {
  const Icono = modulo.icono;

  return (
    <Link
      to={modulo.ruta}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
    >

      {/* ICONO */}

      <div
        className={`
          mb-5 flex h-14 w-14 items-center
          justify-center rounded-xl
          ${modulo.color}
        `}
      >

        <Icono size={28} />

      </div>

      {/* INFORMACIÓN DEL MÓDULO */}

      <h3 className="mb-2 text-lg font-semibold text-[#0C2D57]">

        {modulo.titulo}

      </h3>

      <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-500">

        {modulo.descripcion}

      </p>

      {/* ENLACE */}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">

        <span className="text-sm font-semibold text-sky-600">

          Acceder al módulo

        </span>

        <ArrowRight
          size={19}
          className="text-sky-600 transition-transform group-hover:translate-x-1"
        />

      </div>

    </Link>
  );
}

// =====================================
// COMPONENTE PRINCIPAL
// =====================================

export default function Home() {
  const {
    usuario,
    rol,
    aeropuertoActivo,
  } = useAuth();

  const accesoGlobal = rol === "ADMIN_GENERAL";

  const categorias = obtenerInicioAgrupado(rol);

  const modulos = obtenerModulosInicio(rol);

  const primerNombre =
    usuario?.nombreCompleto
      ?.trim()
      .split(/\s+/)[0] || "Usuario";

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-[1600px] space-y-8">

        {/* BIENVENIDA */}

        <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#0C2D57] via-[#0369A1] to-[#0284C7] p-6 text-white shadow-lg shadow-sky-900/10 sm:p-9">

          {/* ELEMENTOS DECORATIVOS */}

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />

          <Plane
            size={220}
            strokeWidth={0.7}
            className="pointer-events-none absolute -bottom-12 -right-8 -rotate-20 text-white/15"
          />

          <div className="relative z-10 max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-sky-100">

              <Plane size={15} />

              Sistema de gestión aeroportuaria

            </div>

            {/* SALUDO */}

            <h1 className="text-4xl font-extrabold tracking-tight text-white! drop-shadow-md sm:text-5xl">
              ¡Bienvenido,{" "}
              <span className="text-[#BAE6FD]!">
                {primerNombre}!
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-sky-100 sm:text-base">

              Gestioná las operaciones aeroportuarias
              desde una plataforma centralizada,
              segura y organizada.

            </p>

            {/* ROL DEL USUARIO */}

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-white">

              <ShieldCheck size={17} />

              {etiquetasRoles[rol] ?? rol}

            </div>

          </div>

        </section>
        {/* INFORMACIÓN GENERAL */}

        <section className="grid gap-4 md:grid-cols-3">

          {/* ROL */}

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">

              <UserRound size={24} />

            </div>

            <div className="min-w-0">

              <p className="text-xs font-medium text-slate-500">

                Rol de usuario

              </p>

              <p className="mt-1 text-sm font-semibold text-[#0C2D57]">

                {etiquetasRoles[rol] ?? rol}

              </p>

            </div>

          </div>

          {/* ALCANCE OPERATIVO */}

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

              {accesoGlobal ? (

                <ShieldCheck size={24} />

              ) : (

                <Building2 size={24} />

              )}

            </div>

            <div className="min-w-0">

              <p className="text-xs font-medium text-slate-500">

                {accesoGlobal
                  ? "Alcance administrativo"
                  : "Aeropuerto activo"}

              </p>

              <p className="mt-1 text-sm font-semibold text-[#0C2D57]">

                {accesoGlobal
                  ? "Acceso global"
                  : aeropuertoActivo?.nombre ??
                  "Sin aeropuerto activo"}

              </p>

              {!accesoGlobal &&
                aeropuertoActivo?.codigoIata && (

                  <p className="mt-1 text-xs text-sky-600">

                    {aeropuertoActivo.codigoIata}

                  </p>

                )}

            </div>

          </div>

          {/* MÓDULOS DISPONIBLES */}

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">

              <LayoutGrid size={24} />

            </div>

            <div>

              <p className="text-xs font-medium text-slate-500">

                Módulos disponibles

              </p>

              <p className="mt-1 text-2xl font-bold text-[#0C2D57]">

                {modulos.length}

              </p>

            </div>

          </div>

        </section>

        {/* ENCABEZADO DE MÓDULOS */}

        <section>

          <h2 className="text-2xl font-bold text-[#0C2D57]">

            Módulos del sistema

          </h2>

          <p className="mt-1 text-sm text-slate-500">

            Seleccioná el módulo que necesitás utilizar.

          </p>

        </section>

        {/* MÓDULOS AGRUPADOS */}

        {categorias.map((categoria) => (

          <section
            key={categoria.id}
            className="space-y-4"
          >

            <div className="flex items-center gap-3">

              <h2 className="text-lg font-semibold text-[#0C2D57]">

                {categoria.titulo}

              </h2>

              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">

                {categoria.modulos.length}

              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

              {categoria.modulos.map((modulo) => (

                <TarjetaModulo
                  key={modulo.id}
                  modulo={modulo}
                />

              ))}

            </div>

          </section>

        ))}

        {/* SIN MÓDULOS AUTORIZADOS */}

        {modulos.length === 0 && (

          <section className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center">

            <Info
              size={36}
              className="text-slate-300"
            />

            <h3 className="font-semibold text-[#0C2D57]">

              No hay módulos disponibles

            </h3>

            <p className="max-w-md text-sm text-slate-500">

              Tu cuenta no tiene módulos autorizados.
              Contactá al administrador del sistema.

            </p>

          </section>

        )}

        {/* PIE DE PÁGINA */}

        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">

          Global Airport · Sistema de gestión aeroportuaria

        </footer>

      </div>

    </div>
  );
}
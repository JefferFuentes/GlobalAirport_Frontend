import {
  LayoutDashboard,
  Users,
  Contact,
  Building2,
  ShieldCheck,
  UserRound,
  PlaneTakeoff,
  Ticket,
  ContactRound,
  ChartNoAxesCombined,
} from "lucide-react";

import { tienePermiso } from "./permissions";

// =====================================
// CATEGORÍAS DE NAVEGACIÓN
// =====================================

export const categoriasNavegacion = [
  {
    id: "general",
    titulo: "General",
  },
  {
    id: "administracion",
    titulo: "Administración",
  },
  {
    id: "operaciones",
    titulo: "Operaciones",
  },
  {
    id: "analisis",
    titulo: "Análisis",
  },
];

// =====================================
// CONFIGURACIÓN DE MÓDULOS
// =====================================

export const modulosNavegacion = [

  // ===================================
  // GENERAL
  // ===================================

  {
    id: "inicio",
    modulo: "inicio",
    categoria: "general",
    titulo: "Inicio",
    descripcion:
      "Accedé al panel principal del sistema.",
    ruta: "/home",
    icono: LayoutDashboard,
    color: "bg-sky-100 text-sky-600",
    mostrarEnMenu: true,
    mostrarEnInicio: false,
  },

  // ===================================
  // ADMINISTRACIÓN
  // ===================================

  {
    id: "usuarios",
    modulo: "usuarios",
    categoria: "administracion",
    titulo: "Usuarios",
    descripcion:
      "Administrá las cuentas, roles y estados de los usuarios del sistema.",
    ruta: "/usuarios",
    icono: Users,
    color: "bg-blue-100 text-blue-600",
    mostrarEnMenu: true,
    mostrarEnInicio: true,
  },

  {
    id: "empleados",
    modulo: "empleados",
    categoria: "administracion",
    titulo: "Empleados",
    descripcion:
      "Gestioná la información personal y laboral de los empleados.",
    ruta: "/empleados",
    icono: Contact,
    color: "bg-indigo-100 text-indigo-600",
    mostrarEnMenu: true,
    mostrarEnInicio: true,
  },

  {
    id: "aeropuertos",
    modulo: "aeropuertos",
    categoria: "administracion",
    titulo: "Aeropuertos",
    descripcion:
      "Consultá y administrá la información de los aeropuertos.",
    ruta: "/aeropuertos",
    icono: Building2,
    color: "bg-cyan-100 text-cyan-600",
    mostrarEnMenu: true,
    mostrarEnInicio: true,
  },

  {
    id: "asignaciones-administradores",
    modulo: "asignacionesAdministradores",
    categoria: "administracion",
    titulo: "Asignación de administradores",
    descripcion:
      "Gestioná la asignación de administradores a los aeropuertos.",
    ruta: "/asignaciones-administradores",
    icono: ShieldCheck,
    color: "bg-violet-100 text-violet-600",
    mostrarEnMenu: true,
    mostrarEnInicio: true,
  },

  // ===================================
  // OPERACIONES
  // ===================================

  {
    id: "pasajeros",
    modulo: "pasajeros",
    categoria: "operaciones",
    titulo: "Pasajeros",
    descripcion:
      "Registrá pasajeros y consultá su información e historial de reservaciones.",
    ruta: "/pasajeros",
    icono: UserRound,
    color: "bg-teal-100 text-teal-600",
    mostrarEnMenu: true,
    mostrarEnInicio: true,
  },

  {
    id: "vuelos",
    modulo: "vuelos",
    categoria: "operaciones",
    titulo: "Vuelos",
    descripcion:
      "Consultá y gestioná la programación y operación de los vuelos.",
    ruta: "/vuelos",
    icono: PlaneTakeoff,
    color: "bg-sky-100 text-sky-600",
    mostrarEnMenu: true,
    mostrarEnInicio: true,
  },

  {
    id: "reservaciones",
    modulo: "reservaciones",
    categoria: "operaciones",
    titulo: "Reservaciones",
    descripcion:
      "Gestioná reservaciones, asientos, comprobantes y procesos de check-in.",
    ruta: "/reservaciones",
    icono: Ticket,
    color: "bg-emerald-100 text-emerald-600",
    mostrarEnMenu: true,
    mostrarEnInicio: true,
  },

  {
    id: "pilotos",
    modulo: "pilotos",
    categoria: "operaciones",
    titulo: "Pilotos",
    descripcion:
      "Consultá y administrá la información de los pilotos.",
    ruta: "/pilotos",
    icono: ContactRound,
    color: "bg-blue-100 text-blue-600",
    mostrarEnMenu: true,
    mostrarEnInicio: true,
  },

  // ===================================
  // ANÁLISIS
  // ===================================

  {
    id: "reportes",
    modulo: "reportes",
    categoria: "analisis",
    titulo: "Reportes e indicadores",
    descripcion:
      "Consultá reportes operativos, estadísticas e indicadores gerenciales.",
    ruta: "/reportes",
    icono: ChartNoAxesCombined,
    color: "bg-indigo-100 text-indigo-600",
    mostrarEnMenu: true,
    mostrarEnInicio: true,
  },
];

// =====================================
// OBTENER MÓDULOS AUTORIZADOS
// =====================================

export function obtenerModulosAutorizados(rol) {
  if (!rol) return [];

  return modulosNavegacion.filter((modulo) =>
    tienePermiso(
      rol,
      modulo.modulo,
      "consultar"
    )
  );
}

// =====================================
// OBTENER MÓDULOS DEL MENÚ LATERAL
// =====================================

export function obtenerModulosMenu(rol) {
  return obtenerModulosAutorizados(rol).filter(
    (modulo) => modulo.mostrarEnMenu
  );
}

// =====================================
// OBTENER MENÚ AGRUPADO POR CATEGORÍAS
// =====================================

export function obtenerMenuAgrupado(rol) {
  const modulos = obtenerModulosMenu(rol);

  return categoriasNavegacion
    .map((categoria) => ({
      ...categoria,

      modulos: modulos.filter(
        (modulo) =>
          modulo.categoria === categoria.id
      ),
    }))
    .filter(
      (categoria) => categoria.modulos.length > 0
    );
}

// =====================================
// OBTENER MÓDULOS DE LA PÁGINA DE INICIO
// =====================================

export function obtenerModulosInicio(rol) {
  return obtenerModulosAutorizados(rol).filter(
    (modulo) => modulo.mostrarEnInicio
  );
}

// =====================================
// OBTENER MÓDULOS DE INICIO AGRUPADOS
// =====================================

export function obtenerInicioAgrupado(rol) {
  const modulos = obtenerModulosInicio(rol);

  return categoriasNavegacion
    .map((categoria) => ({
      ...categoria,

      modulos: modulos.filter(
        (modulo) =>
          modulo.categoria === categoria.id
      ),
    }))
    .filter(
      (categoria) => categoria.modulos.length > 0
    );
}

// =====================================
// OBTENER MÓDULO POR IDENTIFICADOR
// =====================================

export function obtenerModuloPorId(id) {
  return (
    modulosNavegacion.find(
      (modulo) => modulo.id === id
    ) ?? null
  );
}

// =====================================
// OBTENER MÓDULO POR RUTA
// =====================================

export function obtenerModuloPorRuta(ruta) {
  return (
    modulosNavegacion.find(
      (modulo) => modulo.ruta === ruta
    ) ?? null
  );
}

// =====================================
// VERIFICAR ACCESO A UNA RUTA
// =====================================

export function puedeAccederRuta(rol, ruta) {
  const modulo = obtenerModuloPorRuta(ruta);

  if (!modulo || !rol) {
    return false;
  }

  return tienePermiso(
    rol,
    modulo.modulo,
    "consultar"
  );
}

// =====================================
// RUTAS DE LOS MÓDULOS
// =====================================

export const rutasModulos = modulosNavegacion.map(
  (modulo) => modulo.ruta
);
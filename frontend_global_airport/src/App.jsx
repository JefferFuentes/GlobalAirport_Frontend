import { useEffect } from "react";

import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import "./App.css";

import { useAuth } from "./context/AuthContext";

import {
  rutasModulos,
  puedeAccederRuta,
} from "./config/navigation";

// Componentes compartidos
import ProtectedRoute from "./components/management/ProtectedRoute";
import Layout from "./components/management/Layout";

// Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import Flights from "./pages/FlightsManagement";
import Reservations from "./pages/ReservationsManagement";
import Pilots from "./pages/pilotsManagement";
import SelectAirport from "./pages/SelectAirport";
import UserManagement from "./pages/userManagement";
import AirportManagement from "./pages/airportManagement";
import PassengerManagement from "./pages/passengerManagement";
import EmployeeManagement from "./pages/employeeManagement";
import AirportAdministrators from "./pages/airportAdministrators";

// =====================================
// RUTAS VÁLIDAS DEL SISTEMA
// =====================================

const rutasValidas = [
  "/",
  "/login",
  "/seleccionar-aeropuerto",
  ...rutasModulos,
];

// =====================================
// PANTALLA DE CARGA
// =====================================

function CargandoSesion() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm font-medium text-slate-600">
        Verificando sesión...
      </p>
    </div>
  );
}

// =====================================
// GUARDAR LA ÚLTIMA RUTA AUTORIZADA
// =====================================

function GuardarUltimaRuta() {
  const location = useLocation();

  const {
    autenticado,
    cargando,
    rol,
    aeropuertoActivo,
    requiereSeleccionAeropuerto,
  } = useAuth();

  useEffect(() => {
    if (cargando || !autenticado || !rol) {
      return;
    }

    const tieneContextoOperativo =
      rol === "ADMIN_GENERAL" ||
      (
        Boolean(aeropuertoActivo?.id) &&
        !requiereSeleccionAeropuerto
      );

    if (!tieneContextoOperativo) {
      return;
    }

    if (puedeAccederRuta(rol, location.pathname)) {
      sessionStorage.setItem(
        "ultimaRuta",
        location.pathname
      );
    }
  }, [
    location.pathname,
    autenticado,
    cargando,
    rol,
    aeropuertoActivo?.id,
    requiereSeleccionAeropuerto,
  ]);

  return null;
}

// =====================================
// REDIRECCIÓN DE RUTAS INEXISTENTES
// =====================================

function RedireccionRutaInvalida() {
  const {
    autenticado,
    cargando,
    rol,
    aeropuertoActivo,
    requiereSeleccionAeropuerto,
  } = useAuth();

  if (cargando) {
    return <CargandoSesion />;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (
    rol === "ADMIN_AEROPUERTO" &&
    (
      requiereSeleccionAeropuerto ||
      !aeropuertoActivo?.id
    )
  ) {
    return (
      <Navigate
        to="/seleccionar-aeropuerto"
        replace
      />
    );
  }

  const ultimaRuta =
    sessionStorage.getItem("ultimaRuta");

  const rutaAutorizada =
    ultimaRuta &&
    rutasValidas.includes(ultimaRuta) &&
    puedeAccederRuta(rol, ultimaRuta);

  return (
    <Navigate
      to={rutaAutorizada ? ultimaRuta : "/home"}
      replace
    />
  );
}

// =====================================
// PROTECCIÓN DE RUTAS PÚBLICAS
// =====================================

function PublicRoute({ children }) {
  const {
    autenticado,
    cargando,
    rol,
    requiereSeleccionAeropuerto,
    aeropuertoActivo,
  } = useAuth();

  if (cargando) {
    return <CargandoSesion />;
  }

  if (!autenticado) {
    return children;
  }

  if (
    rol === "ADMIN_AEROPUERTO" &&
    (
      requiereSeleccionAeropuerto ||
      !aeropuertoActivo?.id
    )
  ) {
    return (
      <Navigate
        to="/seleccionar-aeropuerto"
        replace
      />
    );
  }

  return <Navigate to="/home" replace />;
}

// =====================================
// PROTECCIÓN DE SELECCIÓN DE AEROPUERTO
// =====================================

function AirportSelectionRoute({ children }) {
  const {
    autenticado,
    cargando,
    rol,
    aeropuertos,
    aeropuertoActivo,
    requiereSeleccionAeropuerto,
  } = useAuth();

  if (cargando) {
    return <CargandoSesion />;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol !== "ADMIN_AEROPUERTO") {
    return <Navigate to="/home" replace />;
  }

  const cantidadAeropuertos =
    aeropuertos?.length ?? 0;

  // Permitir selección inicial
  const necesitaSeleccionar =
    requiereSeleccionAeropuerto ||
    !aeropuertoActivo?.id;

  // Permitir cambiar de aeropuerto
  const puedeCambiar =
    cantidadAeropuertos > 1;

  if (!necesitaSeleccionar && !puedeCambiar) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

// =====================================
// COMPONENTE PRINCIPAL
// =====================================

function App() {
  return (
    <>
      <GuardarUltimaRuta />

      <Routes>

        {/* RUTA INICIAL */}

        <Route
          path="/"
          element={
            <Navigate to="/login" replace />
          }
        />

        {/* AUTENTICACIÓN */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* SELECCIÓN DE AEROPUERTO */}

        <Route
          path="/seleccionar-aeropuerto"
          element={
            <AirportSelectionRoute>
              <SelectAirport />
            </AirportSelectionRoute>
          }
        />

        {/* RUTAS PROTEGIDAS */}

        <Route element={<ProtectedRoute />}>

          <Route element={<Layout />}>

            {/* INICIO */}

            <Route
              element={
                <ProtectedRoute modulo="inicio" />
              }
            >
              <Route
                path="/home"
                element={<Home />}
              />
            </Route>

            {/* USUARIOS */}

            <Route
              element={
                <ProtectedRoute modulo="usuarios" />
              }
            >
              <Route
                path="/usuarios"
                element={<UserManagement />}
              />
            </Route>

            {/* EMPLEADOS */}

            <Route
              element={
                <ProtectedRoute modulo="empleados" />
              }
            >
              <Route
                path="/empleados"
                element={<EmployeeManagement />}
              />
            </Route>

            {/* AEROPUERTOS */}

            <Route
              element={
                <ProtectedRoute modulo="aeropuertos" />
              }
            >
              <Route
                path="/aeropuertos"
                element={<AirportManagement />}
              />
            </Route>

            {/* ASIGNACIÓN DE ADMINISTRADORES */}

            <Route
              element={
                <ProtectedRoute
                  modulo="asignacionesAdministradores"
                />
              }
            >
              <Route
                path="/asignaciones-administradores"
                element={<AirportAdministrators />}
              />
            </Route>

            {/* PASAJEROS */}

            <Route
              element={
                <ProtectedRoute modulo="pasajeros" />
              }
            >
              <Route
                path="/pasajeros"
                element={<PassengerManagement />}
              />
            </Route>

            {/* VUELOS */}

            <Route
              element={
                <ProtectedRoute modulo="vuelos" />
              }
            >
              <Route
                path="/vuelos"
                element={<Flights />}
              />
            </Route>

            {/* RESERVACIONES */}

            <Route
              element={
                <ProtectedRoute modulo="reservaciones" />
              }
            >
              <Route
                path="/reservaciones"
                element={<Reservations />}
              />
            </Route>

            {/* PILOTOS */}

            <Route
              element={
                <ProtectedRoute modulo="pilotos" />
              }
            >
              <Route
                path="/pilotos"
                element={<Pilots />}
              />
            </Route>

            {/* REPORTES E INDICADORES */}

            <Route
              element={
                <ProtectedRoute modulo="reportes" />
              }
            >
              <Route
                path="/reportes"
                element={<Reports />}
              />
            </Route>

          </Route>

        </Route>

        {/* RUTAS INEXISTENTES */}

        <Route
          path="*"
          element={<RedireccionRutaInvalida />}
        />

      </Routes>
    </>
  );
}

export default App;
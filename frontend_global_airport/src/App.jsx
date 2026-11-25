import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/management/ProtectedRoute";

import Layout from "./components/management/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import Flights from "./pages/FlightsManagement";
import Reservations from "./pages/ReservationsManagement";
import Pilots from "./pages/pilotsManagement";
import SelectAirport from "./pages/SelectAirport";

// Rutas válidas del sistema
const rutasValidas = [
  "/login",
  "/seleccionar-aeropuerto",
  "/Home",
  "/reportes",
  "/vuelos",
  "/reservaciones",
  "/pilotos",
];

// Guardar la última ruta válida
function GuardarUltimaRuta() {
  const location = useLocation();
  const { autenticado, cargando } = useAuth();

  useEffect(() => {
    if (cargando) return;

    if (
      rutasValidas.includes(location.pathname) &&
      (autenticado || location.pathname === "/login")
    ) {
      sessionStorage.setItem(
        "ultimaRuta",
        location.pathname
      );
    }
  }, [location.pathname, autenticado, cargando]);

  return null;
}

// Redirigir cuando la ruta no existe
function RedireccionRutaInvalida() {
  const {
    autenticado,
    cargando,
    requiereSeleccionAeropuerto,
    accesoGlobal,
    aeropuertoActivo,
  } = useAuth();

  if (cargando) return null;

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (requiereSeleccionAeropuerto) {
    return (
      <Navigate to="/seleccionar-aeropuerto" replace />
    );
  }

  if (!accesoGlobal && !aeropuertoActivo) {
    return <Navigate to="/login" replace />;
  }

  const ultimaRuta = sessionStorage.getItem("ultimaRuta");

  const destino =
    rutasValidas.includes(ultimaRuta) &&
      ultimaRuta !== "/login" &&
      ultimaRuta !== "/seleccionar-aeropuerto"
      ? ultimaRuta
      : "/Home";

  return <Navigate to={destino} replace />;
}

// Evitar volver al Login si ya existe una sesión
function PublicRoute({ children }) {
  const {
    autenticado,
    cargando,
    requiereSeleccionAeropuerto,
    accesoGlobal,
    aeropuertoActivo,
  } = useAuth();

  if (cargando) return null;

  if (autenticado) {
    if (requiereSeleccionAeropuerto) {
      return (
        <Navigate to="/seleccionar-aeropuerto" replace />
      );
    }

    if (accesoGlobal || aeropuertoActivo) {
      return <Navigate to="/Home" replace />;
    }
  }

  return children;
}

function App() {
  return (
    <>
      <GuardarUltimaRuta />

      <Routes>

        {/* Ruta inicial */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Autenticación */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Selección de aeropuerto */}
        <Route
          path="/seleccionar-aeropuerto"
          element={<SelectAirport />}
        />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            {/* Inicio */}
            <Route element={<ProtectedRoute modulo="inicio" />}>
              <Route path="/Home" element={<Home />} />
            </Route>

            {/* Vuelos */}
            <Route element={<ProtectedRoute modulo="vuelos" />}>
              <Route path="/vuelos" element={<Flights />} />
            </Route>

            {/* Reservaciones */}
            <Route element={<ProtectedRoute modulo="reservaciones" />}>
              <Route path="/reservaciones" element={<Reservations />} />
            </Route>

            {/* Pilotos */}
            <Route element={<ProtectedRoute modulo="pilotos" />}>
              <Route path="/pilotos" element={<Pilots />} />
            </Route>

            {/* Reportes e indicadores */}
            <Route element={<ProtectedRoute modulo="reportes" />}>
              <Route path="/reportes" element={<Reports />} />
            </Route>

          </Route>
        </Route>

        {/* Rutas inexistentes */}
        <Route
          path="*"
          element={<RedireccionRutaInvalida />}
        />

      </Routes>
    </>
  );
}

export default App;
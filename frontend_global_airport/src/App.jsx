
import { Routes, Route } from "react-router-dom";

import LandingPage from "../LandingPage";
import Home from "./Home";
import Login from "./Login";
import SignUp from "./SignUp";
import Reports from "./Reports";
import Flights from "./FlightsManagement";
import Reservations from "./ReservationsManagement";
import Pilots from "./pilotsManagement";

function App() {
  return (
    <Routes>
      {/* Página principal */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/Home" element={<Home />} />

      {/* Autenticación */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<SignUp />} />

      {/* Módulos del sistema */}
      <Route path="/reportes" element={<Reports />} />
      <Route path="/vuelos" element={<Flights />} />
      <Route path="/reservaciones" element={<Reservations />} />
      <Route path="/pilotos" element={<Pilots />} />

      {/* Página para rutas inexistentes */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <h1 className="text-5xl font-bold text-[#0C2D57]">
              404
            </h1>

            <p className="mt-3 text-lg text-slate-600">
              La página que buscás no existe.
            </p>

            <a
              href="/Home"
              className="mt-5 rounded-xl bg-[#0C2D57] px-5 py-3 font-semibold text-white hover:bg-[#0284C7]"
            >
              Volver al inicio
            </a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;

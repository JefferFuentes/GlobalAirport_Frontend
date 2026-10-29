
import { Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom"

import Layout from "./Layout";
import LandingPage from "../LandingPage";
import Home from "./home";
import Login from "./Login";
import SignUp from "./signUp";
import Reports from "./reports";
import Flights from "./flightsManagement";
import Reservations from "./reservationsManagement";
import Pilots from "./pilotsManagement";
//import Users from "./userManagement";
//import Airports from "./airportManagement";
//import Passengers from "./passegerManagement";

function App() {
  return (
    <Routes>
      {/* Página pública */}
      <Route path="/" element={<LandingPage />} />

      {/* Autenticación */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<SignUp />} />

      {/* Todas estas páginas comparten Layout */}
      <Route element={<Layout />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/vuelos" element={<Flights />} />
        <Route path="/reservaciones" element={<Reservations />} />
        <Route path="/pilotos" element={<Pilots />} />

        {/* Descomentá estas rutas cuando creés los componentes */}
        {/* <Route path="/usuarios" element={<Users />} /> */}
        {/* <Route path="/aeropuertos" element={<Airports />} /> */}
        {/* <Route path="/pasajeros" element={<Passengers />} /> */}
      </Route>

      {/* Página 404 */}
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
            <Link to="/Home"
              className="mt-5 rounded-xl bg-[#0C2D57] px-5 py-3 font-semibold text-white hover:bg-[#0284C7]"
            >
              Volver al inicio
            </Link>
          </div>
        }
      />
    </Routes>
  );
}

export default App;

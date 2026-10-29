
import { useState } from "react";
import {
  Plane,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // Aquí conectarás el formulario con tu API de autenticación.
    console.log("Iniciar sesión:", { correo, password });
  }

  return (
    <main className="flex min-h-screen bg-white">
      {/* Panel visual */}
      <section className="relative hidden overflow-hidden bg-[#0C2D57] lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=85')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-[#0C2D57]/95 via-blue-900/75 to-sky-700/50" />

        <a href="/" className="relative z-10 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white">
            <Plane className="h-7 w-7" />
          </span>
          <span className="text-2xl font-extrabold text-white">
            Global <span className="text-sky-300">Airport</span>
          </span>
        </a>

        <div className="relative z-10 max-w-xl py-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-300">
            Gestión aeroportuaria inteligente
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white xl:text-5xl">
            Todo el aeropuerto, conectado en un solo lugar.
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            Administra vuelos, pasajeros, reservaciones y operaciones desde
            una plataforma diseñada para simplificar tu trabajo.
          </p>
        </div>

        <p className="relative z-10 text-sm text-blue-200">
          © 2026 Global Airport. Todos los derechos reservados.
        </p>
      </section>

      {/* Formulario */}
      <section className="flex w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <a
            href="/"
            className="mb-10 flex items-center justify-center gap-2 lg:hidden"
          >
            <Plane className="h-8 w-8 text-sky-600" />
            <span className="text-xl font-extrabold text-[#0C2D57]">
              Global <span className="text-sky-600">Airport</span>
            </span>
          </a>

          <div className="mb-8">
            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1.5 text-sm font-bold text-sky-800">
              Bienvenido de nuevo
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-[#0C2D57] sm:text-4xl">
              Iniciar sesión
            </h2>
            <p className="mt-3 leading-6 text-slate-500">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="correo"
                className="mb-2 block text-sm font-bold text-[#0C2D57]"
              >
                Correo electrónico
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                <Mail className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-[#0C2D57]"
              >
                Contraseña
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                <LockKeyhole className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={
                    mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className="shrink-0 text-slate-400 hover:text-sky-600"
                >
                  {mostrarPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a
                href="/recuperar-password"
                className="text-sm font-semibold text-sky-700 hover:text-blue-950"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <a href = "/Home"
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-sky-600 px-5 py-4 font-bold leading-5 text-white shadow-md transition hover:bg-[#0C2D57] focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              Ingresar
              <ArrowRight className="h-5 w-5" />
            </a>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            ¿Todavía no tienes una cuenta?{" "}
            <a
              href="/registro"
              className="font-bold text-sky-700 hover:text-blue-950"
            >
              Regístrate aquí
            </a>
          </p>

          <p className="mt-10 text-center text-xs text-slate-400">
            Acceso sujeto a los permisos asignados por el sistema.
          </p>
        </div>
      </section>
    </main>
  );
}

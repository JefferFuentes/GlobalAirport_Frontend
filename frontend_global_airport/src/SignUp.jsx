
import { useState } from "react";
import {
  Plane,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Aquí conectarás el formulario con tu endpoint de registro.
    console.log("Registrar usuario:", { nombre, correo, password });
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
            Únete a Global Airport
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white xl:text-5xl">
            Una gestión aeroportuaria más conectada y eficiente.
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            Accede a las herramientas que facilitan la administración de
            vuelos, pasajeros, reservaciones y operaciones.
          </p>

          <div className="mt-8 flex items-center gap-3 text-sm text-blue-100">
            <ShieldCheck className="h-6 w-6 shrink-0 text-sky-300" />
            <span>Tu acceso dependerá de los permisos asignados por el sistema.</span>
          </div>
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
            className="mb-8 flex items-center justify-center gap-2 lg:hidden"
          >
            <Plane className="h-8 w-8 text-sky-600" />
            <span className="text-xl font-extrabold text-[#0C2D57]">
              Global <span className="text-sky-600">Airport</span>
            </span>
          </a>

          <div className="mb-7">
            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1.5 text-sm font-bold text-sky-800">
              Crear cuenta
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-[#0C2D57] sm:text-4xl">
              Regístrate
            </h2>
            <p className="mt-3 leading-6 text-slate-500">
              Completa tus datos para solicitar el registro en la plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-bold text-[#0C2D57]"
              >
                Nombre completo
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                <UserRound className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  id="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

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
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
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

            <div>
              <label
                htmlFor="confirmarPassword"
                className="mb-2 block text-sm font-bold text-[#0C2D57]"
              >
                Confirmar contraseña
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                <LockKeyhole className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  id="confirmarPassword"
                  type={mostrarPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-sky-600 px-5 py-4 font-bold leading-5 text-white shadow-md transition hover:bg-[#0C2D57] focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              Crear cuenta
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="font-bold text-sky-700 hover:text-blue-950"
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

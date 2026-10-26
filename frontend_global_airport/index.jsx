
import { ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">
            Global Airport
          </h1>

          <div className="hidden md:flex gap-8 text-gray-600">
            <a href="#features">Acerca de nosotros</a>
            <a href="#benefits">Misión</a>
            <a href="#contact">Visión</a>
          </div>

          <button className="bg-sky-500 text-white px-5 py-2 rounded-lg hover:bg-sky-600 transition">
            Ingresar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 text-white">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl">
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
              Plataforma Inteligente
            </span>

            <h1 className="text-4xl md:text-6xl font-bold mt-6 leading-tight">
              Impulsa tu negocio con soluciones digitales modernas
            </h1>

            <p className="mt-6 text-xl text-blue-100">
              Automatiza procesos, analiza información en tiempo real y toma
              mejores decisiones desde una única plataforma.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold">
                Solicitar Demo
              </button>

              <a
                href="#features"
                className="border border-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                Ver más
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
            ¿Por qué elegirnos?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">

              <h3 className="text-2xl font-semibold mb-3">
                Automatización
              </h3>

              <p className="text-gray-600">
                Reduce tareas repetitivas y mejora la eficiencia operativa.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">

              <h3 className="text-2xl font-semibold mb-3">
                Analítica Avanzada
              </h3>

              <p className="text-gray-600">
                Obtén métricas en tiempo real para respaldar tus decisiones.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">

              <h3 className="text-2xl font-semibold mb-3">
                Seguridad
              </h3>

              <p className="text-gray-600">
                Protección de datos y acceso seguro para toda tu organización.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-5xl font-bold text-blue-900">10K+</h3>
              <p className="text-gray-600 mt-2">Usuarios</p>
            </div>

            <div>
              <h3 className="text-5xl font-bold text-blue-900">99.9%</h3>
              <p className="text-gray-600 mt-2">Disponibilidad</p>
            </div>

            <div>
              <h3 className="text-5xl font-bold text-blue-900">150+</h3>
              <p className="text-gray-600 mt-2">Empresas</p>
            </div>

            <div>
              <h3 className="text-5xl font-bold text-blue-900">24/7</h3>
              <p className="text-gray-600 mt-2">Soporte</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="benefits"
        className="py-24 bg-gradient-to-r from-blue-900 to-sky-500 text-white text-center"
      >
        <div className="container mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Lleva tu organización al siguiente nivel
          </h2>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Descubre una nueva forma de gestionar información y optimizar
            procesos empresariales.
          </p>

          <button className="mt-8 bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:scale-105 transition">
            Comenzar ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-blue-950 text-blue-200 py-8">
        <div className="container mx-auto px-8 text-center">
          © 2026 Global Airport. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

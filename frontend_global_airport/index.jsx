import {
  ArrowRight,
  Plane,
  Settings,
  ChartNoAxesColumnIncreasing,
  ShieldCheck,
  Users,
  Clock,
  Headset,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Settings,
      title: "Automatización",
      description:
        "Reduce tareas repetitivas y mejora la eficiencia operativa del aeropuerto.",
    },
    {
      icon: ChartNoAxesColumnIncreasing,
      title: "Analítica avanzada",
      description:
        "Consulta métricas e información para tomar mejores decisiones.",
    },
    {
      icon: ShieldCheck,
      title: "Seguridad",
      description:
        "Protege la información y administra los accesos de forma segura.",
    },
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Usuarios" },
    { icon: Clock, value: "99.9%", label: "Disponibilidad" },
    { icon: Plane, value: "70+", label: "Aeropuertos" },
    { icon: Headset, value: "24/7", label: "Soporte" },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-700">
      {/* Navegación */}
      <header className="absolute left-0 top-0 z-20 w-full px-4 pt-5 md:px-8 md:pt-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-lg backdrop-blur-md md:px-8">
          <a
            href="#inicio"
            className="flex shrink-0 items-center gap-3 text-2xl font-extrabold tracking-tight text-blue-950 md:text-3xl"
          >
            <Plane className="h-8 w-8 -rotate-12 text-sky-500" />
            <span>
              Global <span className="text-sky-500">Airport</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-semibold text-blue-950 md:flex">
            <a href="#nosotros" className="transition hover:text-sky-500">
              Acerca de nosotros
            </a>
            <a href="#mision" className="transition hover:text-sky-500">
              Misión
            </a>
            <a href="#vision" className="transition hover:text-sky-500">
              Visión
            </a>
          </div>

          <a
            href="#contacto"
            className="shrink-0 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800"
          >
            Ingresar
          </a>
        </nav>
      </header>

      {/* Portada con imagen de aeropuerto */}
      <section
        id="inicio"
        className="relative flex min-h-[620px] items-center bg-cover bg-center pt-32 md:min-h-[700px]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=85')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-blue-950/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-bold text-blue-900">
              <Plane className="h-4 w-4 text-sky-600" />
              Global Airport
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight text-blue-950 sm:text-5xl md:text-6xl">
              Gestión de aeropuertos{" "}
              <span className="text-sky-600">de manera ordenada</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700 md:text-xl">
              Automatiza procesos, analiza información en tiempo real y toma
              mejores decisiones desde una única plataforma.
            </p>

            <a
              href="#nosotros"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-sky-600 px-8 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-800"
            >
              Comenzar ahora
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-blue-950 via-sky-500 to-sky-200" />
      </section>

      {/* Características */}
      <section id="nosotros" className="bg-sky-50 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.3em] text-sky-600">
              Soluciones
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight text-blue-950 md:text-4xl">
              ¿Por qué elegir Global Airport?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Tecnología, eficiencia y seguridad para la gestión aeroportuaria.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-sky-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
                    <Icon className="h-9 w-9 text-sky-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-blue-950">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-sky-600">
              Nuestra propuesta
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-blue-950 md:text-4xl">
              Una gestión más eficiente
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="text-center">
                  <Icon className="mx-auto mb-4 h-10 w-10 text-sky-600" />
                  <p className="text-4xl font-extrabold tracking-tight text-blue-950 md:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-base text-slate-600 md:text-lg">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Las cifras son ilustrativas; sustitúyelas por datos reales de tu
            proyecto antes de publicar.
          </p>
        </div>
      </section>

      {/* Misión */}
      <section
        id="mision"
        className="relative overflow-hidden bg-blue-950 px-6 py-20 text-white md:py-24"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900/95 to-sky-800/70" />

        <div className="relative mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-sky-300">
              Nuestra misión
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
              Lleva tu aeropuerto al{" "}
              <span className="text-sky-300">siguiente nivel</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Facilitar la administración aeroportuaria mediante herramientas
              tecnológicas que centralicen la información, optimicen los
              procesos y apoyen la toma de decisiones.
            </p>

            <a
              href="#vision"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 font-bold text-blue-950 transition hover:bg-sky-100"
            >
              Conoce nuestra visión
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm md:p-10">
            <Plane className="mb-6 h-12 w-12 text-sky-300" />
            <h3 className="text-2xl font-bold">Conectamos operaciones</h3>
            <p className="mt-4 leading-7 text-blue-100">
              Una plataforma diseñada para reunir los procesos y la información
              en un solo lugar, con una experiencia clara y organizada para sus
              usuarios.
            </p>
          </div>
        </div>
      </section>

      {/* Visión */}
      <section id="vision" className="bg-white px-6 py-20 text-center md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-sky-600">
            Nuestra visión
          </p>

          <h2 className="mt-4 text-3xl font-extrabold text-blue-950 md:text-4xl">
            El futuro de la gestión aeroportuaria
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Convertirnos en una solución tecnológica de referencia para una
            gestión aeroportuaria más moderna, conectada, segura y eficiente.
          </p>
        </div>
      </section>

      {/* Pie de página */}
      <footer id="contacto" className="bg-[#0b1f3a] px-6 py-10 text-blue-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <a
            href="#inicio"
            className="flex items-center gap-3 text-xl font-extrabold text-white"
          >
            <Plane className="h-7 w-7 text-sky-400" />
            Global Airport
          </a>

          <p className="text-sm text-blue-200">
            © 2026 Global Airport. Todos los derechos reservados.
          </p>

          <a
            href="#inicio"
            className="text-sm font-semibold transition hover:text-sky-300"
          >
            Volver arriba ↑
          </a>
        </div>
      </footer>
    </main>
  );
}
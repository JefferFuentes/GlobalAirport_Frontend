import { Armchair, CheckCircle2, Loader2 } from "lucide-react";

export default function SelectorAsientos({
  asientos = [],
  asientoSeleccionado,
  onSeleccionar,
  cargando = false,
  deshabilitado = false,
}) {
  const disponibles = asientos.filter(
    (a) => a.disponible === true
  ).length;

  const ocupados = asientos.filter(
    (a) => a.disponible === false
  ).length;

  const seleccionado = asientos.find(
    (a) => String(a.id) === String(asientoSeleccionado)
  );

  function obtenerEstilo(asiento) {
    if (!asiento.disponible) {
      return "border-red-200 bg-red-50 text-red-600 cursor-not-allowed";
    }

    if (String(asiento.id) === String(asientoSeleccionado)) {
      return "border-sky-700 bg-sky-600 text-white ring-2 ring-sky-200";
    }

    return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      {/* Encabezado */}
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-sky-100 p-3 text-sky-700">
          <Armchair size={24} />
        </div>

        <div>
          <h3 className="font-bold text-[#0C2D57]">
            Selección de asiento
          </h3>

          <p className="text-sm text-slate-500">
            Seleccioná uno de los asientos disponibles.
          </p>
        </div>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
          <Loader2 size={20} className="animate-spin" />
          Cargando asientos...
        </div>
      ) : asientos.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
          No hay asientos para mostrar.
        </div>
      ) : (
        <>

          {/* Indicadores */}
          <div className="mb-6 grid grid-cols-3 gap-3">

            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">
                {disponibles}
              </p>
              <p className="text-xs text-emerald-600">
                Disponibles
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3 text-center">
              <p className="text-2xl font-bold text-red-700">
                {ocupados}
              </p>
              <p className="text-xs text-red-600">
                Ocupados
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-center">
              <p className="text-2xl font-bold text-[#0C2D57]">
                {asientos.length}
              </p>
              <p className="text-xs text-slate-500">
                Totales
              </p>
            </div>

          </div>

          {/* Cuadrícula de asientos */}
          <div className="max-h-[380px] overflow-y-auto rounded-xl bg-slate-50 p-4">

            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">

              {asientos.map((asiento) => (
                <button
                  key={asiento.id}
                  type="button"
                  disabled={
                    !asiento.disponible || deshabilitado
                  }
                  aria-pressed={
                    String(asiento.id) ===
                    String(asientoSeleccionado)
                  }
                  title={`${asiento.numero} - ${asiento.clase} - ${
                    asiento.disponible
                      ? "Disponible"
                      : "Ocupado"
                  }`}
                  onClick={() =>
                    onSeleccionar(String(asiento.id))
                  }
                  className={`
                    flex aspect-square flex-col
                    items-center justify-center gap-1
                    rounded-xl border-2
                    transition-all
                    disabled:cursor-not-allowed
                    ${obtenerEstilo(asiento)}
                  `}
                >
                  <Armchair size={22} />

                  <span className="text-xs font-bold">
                    {asiento.numero}
                  </span>
                </button>
              ))}

            </div>

          </div>

          {/* Leyenda */}
          <div className="mt-5 flex flex-wrap justify-center gap-5 text-xs text-slate-600">

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border border-emerald-200 bg-emerald-100" />
              Disponible
            </div>

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border border-red-200 bg-red-100" />
              Ocupado
            </div>

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-sky-600" />
              Seleccionado
            </div>

          </div>

          {/* Información del asiento seleccionado */}
          {seleccionado && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">

              <CheckCircle2
                size={24}
                className="text-sky-600"
              />

              <div>
                <p className="text-xs text-sky-700">
                  Asiento seleccionado
                </p>

                <p className="text-lg font-bold text-[#0C2D57]">
                  {seleccionado.numero}
                </p>

                <p className="text-sm text-slate-500">
                  Clase: {seleccionado.clase}
                </p>
              </div>

            </div>
          )}

        </>
      )}

    </div>
  );
}
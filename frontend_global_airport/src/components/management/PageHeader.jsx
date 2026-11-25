import { Plus, RefreshCw } from "lucide-react";

export default function PageHeader({
  icono: Icono,
  titulo,
  descripcion,
  onActualizar,
  onNuevo,
  textoBoton,
}) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

      {/* Información del módulo */}
      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
          <Icono size={28} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-[#0C2D57]">
            {titulo}
          </h1>

          <p className="mt-1 text-slate-500">
            {descripcion}
          </p>
        </div>

      </div>

      {/* Acciones del módulo */}
      <div className="flex gap-2">

        {onActualizar && (
          <button
            type="button"
            onClick={onActualizar}
            title="Actualizar"
            aria-label="Actualizar"
            className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw size={19} />
          </button>
        )}

        {onNuevo && (
          <button
            type="button"
            onClick={onNuevo}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0C2D57] px-5 py-3 font-semibold text-white hover:bg-[#0284C7]"
          >
            <Plus size={18} />
            {textoBoton}
          </button>
        )}

      </div>

    </header>
  );
}
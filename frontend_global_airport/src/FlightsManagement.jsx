
import { useMemo, useState } from "react";
import { Plane, Plus, Search, Pencil, Trash2, X } from "lucide-react";

const vuelosIniciales = [
  {
    id: 1,
    codigo: "GA-101",
    origen: "Juan Santamaría (SJO)",
    destino: "Aeropuerto de Panamá (PTY)",
    fecha: "2026-11-02",
    hora: "08:30",
    piloto: "Carlos Rodríguez",
    estado: "Programado",
  },
  {
    id: 2,
    codigo: "GA-205",
    origen: "Aeropuerto de Panamá (PTY)",
    destino: "Juan Santamaría (SJO)",
    fecha: "2026-11-02",
    hora: "13:45",
    piloto: "María Fernández",
    estado: "En curso",
  },
];

const formularioVacio = {
  codigo: "",
  origen: "",
  destino: "",
  fecha: "",
  hora: "",
  piloto: "",
  estado: "Programado",
};

const estados = ["Programado", "En curso", "Finalizado", "Cancelado"];

export default function Vuelos() {
  const [vuelos, setVuelos] = useState(vuelosIniciales);
  const [form, setForm] = useState(formularioVacio);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);

  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
  const label = "mb-1.5 block text-sm font-medium text-slate-700";

  const resultados = useMemo(() => {
    return vuelos.filter((v) => {
      const texto =
        `${v.codigo} ${v.origen} ${v.destino} ${v.piloto}`.toLowerCase();

      return (
        texto.includes(busqueda.toLowerCase()) &&
        (filtroEstado === "Todos" || v.estado === filtroEstado)
      );
    });
  }, [vuelos, busqueda, filtroEstado]);

  function cancelar() {
    setForm(formularioVacio);
    setEditando(null);
    setMostrarForm(false);
  }

  function guardar(e) {
    e.preventDefault();

    if (form.origen.trim() === form.destino.trim()) {
      alert("El origen y destino deben ser diferentes.");
      return;
    }

    if (editando !== null) {
      setVuelos((actuales) =>
        actuales.map((v) =>
          v.id === editando ? { ...form, id: editando } : v
        )
      );
    } else {
      setVuelos((actuales) => [
        ...actuales,
        { ...form, id: Date.now() },
      ]);
    }

    cancelar();
  }

  function editar(vuelo) {
    setForm({
      codigo: vuelo.codigo,
      origen: vuelo.origen,
      destino: vuelo.destino,
      fecha: vuelo.fecha,
      hora: vuelo.hora,
      piloto: vuelo.piloto,
      estado: vuelo.estado,
    });

    setEditando(vuelo.id);
    setMostrarForm(true);
  }

  function eliminar(id) {
    if (confirm("¿Deseás eliminar este vuelo?")) {
      setVuelos((actuales) => actuales.filter((v) => v.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Plane size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
                Global Airport
              </p>
              <h1 className="text-3xl font-bold text-[#0C2D57]">
                Gestión de vuelos
              </h1>
              <p className="mt-1 text-slate-500">
                Administrá rutas, horarios y estados de los vuelos.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cancelar();
              setMostrarForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0C2D57] px-5 py-3 font-semibold text-white hover:bg-[#0284C7]"
          >
            <Plus size={18} /> Nuevo vuelo
          </button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Total de vuelos", vuelos.length],
            ["Programados", vuelos.filter((v) => v.estado === "Programado").length],
            ["En curso", vuelos.filter((v) => v.estado === "En curso").length],
          ].map(([titulo, valor]) => (
            <div key={titulo} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{titulo}</p>
              <p className="mt-2 text-3xl font-bold text-[#0C2D57]">{valor}</p>
            </div>
          ))}
        </div>

        {mostrarForm && (
          <form onSubmit={guardar} className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0C2D57]">
                {editando !== null ? "Editar vuelo" : "Registrar vuelo"}
              </h2>
              <button type="button" onClick={cancelar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={label}>Código del vuelo</label>
                <input required className={input} placeholder="Ej. GA-301" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
              </div>

              <div>
                <label className={label}>Aeropuerto de origen</label>
                <input required className={input} placeholder="Ej. Juan Santamaría (SJO)" value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} />
              </div>

              <div>
                <label className={label}>Aeropuerto de destino</label>
                <input required className={input} placeholder="Ej. Panamá (PTY)" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} />
              </div>

              <div>
                <label className={label}>Fecha</label>
                <input required type="date" className={input} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
              </div>

              <div>
                <label className={label}>Hora</label>
                <input required type="time" className={input} value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
              </div>

              <div>
                <label className={label}>Piloto asignado</label>
                <input required className={input} placeholder="Nombre del piloto" value={form.piloto} onChange={(e) => setForm({ ...form, piloto: e.target.value })} />
              </div>

              <div>
                <label className={label}>Estado</label>
                <select className={input} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  {estados.map((estado) => <option key={estado}>{estado}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={cancelar} className="rounded-xl border px-5 py-2.5 font-semibold text-slate-600">
                Cancelar
              </button>
              <button className="rounded-xl bg-[#0284C7] px-5 py-2.5 font-semibold text-white hover:bg-sky-700">
                {editando !== null ? "Guardar cambios" : "Registrar vuelo"}
              </button>
            </div>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código, aeropuerto o piloto..."
                className={`${input} pl-10`}
              />
            </div>

            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={`${input} md:max-w-52`}>
              <option>Todos</option>
              {estados.map((estado) => <option key={estado}>{estado}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {["Vuelo", "Origen", "Destino", "Fecha y hora", "Piloto", "Estado", "Acciones"].map((titulo) => (
                    <th key={titulo} className="px-5 py-4">{titulo}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {resultados.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-[#0C2D57]">{v.codigo}</td>
                    <td className="px-5 py-4">{v.origen}</td>
                    <td className="px-5 py-4">{v.destino}</td>
                    <td className="px-5 py-4">{v.fecha}<br />{v.hora}</td>
                    <td className="px-5 py-4">{v.piloto}</td>
                    <td className="px-5 py-4">{v.estado}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => editar(v)} title="Editar" className="rounded-lg p-2 text-sky-700 hover:bg-sky-50">
                          <Pencil size={17} />
                        </button>
                        <button onClick={() => eliminar(v.id)} title="Eliminar" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {resultados.length === 0 && (
              <p className="p-8 text-center text-slate-500">No se encontraron vuelos.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

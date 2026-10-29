
import { useMemo, useState } from "react";
import { Ticket, Plus, Search, Pencil, Trash2, X } from "lucide-react";

const reservacionesIniciales = [
  {
    id: 1,
    codigo: "RES-1001",
    pasajero: "Ana Morales",
    vuelo: "GA-101",
    fecha: "2026-11-02",
    asiento: "12A",
    estado: "Confirmada",
  },
  {
    id: 2,
    codigo: "RES-1002",
    pasajero: "José Vargas",
    vuelo: "GA-205",
    fecha: "2026-11-02",
    asiento: "08C",
    estado: "Pendiente",
  },
];

const formularioVacio = {
  codigo: "",
  pasajero: "",
  vuelo: "",
  fecha: "",
  asiento: "",
  estado: "Confirmada",
};

const estados = ["Confirmada", "Pendiente", "Cancelada"];

export default function Reservaciones() {
  const [reservaciones, setReservaciones] = useState(reservacionesIniciales);
  const [form, setForm] = useState(formularioVacio);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);

  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
  const label = "mb-1.5 block text-sm font-medium text-slate-700";

  const resultados = useMemo(() => {
    return reservaciones.filter((r) => {
      const texto =
        `${r.codigo} ${r.pasajero} ${r.vuelo} ${r.asiento}`.toLowerCase();

      return (
        texto.includes(busqueda.toLowerCase()) &&
        (filtroEstado === "Todos" || r.estado === filtroEstado)
      );
    });
  }, [reservaciones, busqueda, filtroEstado]);

  function cancelar() {
    setForm(formularioVacio);
    setEditando(null);
    setMostrarForm(false);
  }

  function guardar(e) {
    e.preventDefault();

    if (editando !== null) {
      setReservaciones((actuales) =>
        actuales.map((r) =>
          r.id === editando ? { ...form, id: editando } : r
        )
      );
    } else {
      setReservaciones((actuales) => [
        ...actuales,
        { ...form, id: Date.now() },
      ]);
    }

    cancelar();
  }

  function editar(reservacion) {
    setForm({
      codigo: reservacion.codigo,
      pasajero: reservacion.pasajero,
      vuelo: reservacion.vuelo,
      fecha: reservacion.fecha,
      asiento: reservacion.asiento,
      estado: reservacion.estado,
    });

    setEditando(reservacion.id);
    setMostrarForm(true);
  }

  function eliminar(id) {
    if (confirm("¿Deseás eliminar esta reservación?")) {
      setReservaciones((actuales) =>
        actuales.filter((r) => r.id !== id)
      );
    }
  }

  return (
    <>
     <header className="border-b border-sky-100 bg-white px-5 py-5">
        <h1 className="text-2xl font-bold text-[#0C2D57]">
          Reservaciones
        </h1>
      </header>
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Ticket size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
                Global Airport
              </p>
              <h1 className="text-3xl font-bold text-[#0C2D57]">
                Gestión de reservaciones
              </h1>
              <p className="mt-1 text-slate-500">
                Administrá las reservaciones de los pasajeros.
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
            <Plus size={18} /> Nueva reservación
          </button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Total de reservaciones", reservaciones.length],
            ["Confirmadas", reservaciones.filter((r) => r.estado === "Confirmada").length],
            ["Pendientes", reservaciones.filter((r) => r.estado === "Pendiente").length],
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
                {editando !== null ? "Editar reservación" : "Registrar reservación"}
              </h2>
              <button type="button" onClick={cancelar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={label}>Código de reservación</label>
                <input required className={input} placeholder="Ej. RES-1003" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
              </div>

              <div>
                <label className={label}>Nombre del pasajero</label>
                <input required className={input} placeholder="Nombre completo" value={form.pasajero} onChange={(e) => setForm({ ...form, pasajero: e.target.value })} />
              </div>

              <div>
                <label className={label}>Código del vuelo</label>
                <input required className={input} placeholder="Ej. GA-301" value={form.vuelo} onChange={(e) => setForm({ ...form, vuelo: e.target.value })} />
              </div>

              <div>
                <label className={label}>Fecha</label>
                <input required type="date" className={input} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
              </div>

              <div>
                <label className={label}>Asiento</label>
                <input required className={input} placeholder="Ej. 14B" value={form.asiento} onChange={(e) => setForm({ ...form, asiento: e.target.value.toUpperCase() })} />
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
                {editando !== null ? "Guardar cambios" : "Registrar reservación"}
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
                placeholder="Buscar por código, pasajero, vuelo o asiento..."
                className={`${input} pl-10`}
              />
            </div>

            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={`${input} md:max-w-52`}>
              <option>Todos</option>
              {estados.map((estado) => <option key={estado}>{estado}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {["Reservación", "Pasajero", "Vuelo", "Fecha", "Asiento", "Estado", "Acciones"].map((titulo) => (
                    <th key={titulo} className="px-5 py-4">{titulo}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {resultados.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-[#0C2D57]">{r.codigo}</td>
                    <td className="px-5 py-4">{r.pasajero}</td>
                    <td className="px-5 py-4">{r.vuelo}</td>
                    <td className="px-5 py-4">{r.fecha}</td>
                    <td className="px-5 py-4">{r.asiento}</td>
                    <td className="px-5 py-4">{r.estado}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => editar(r)} title="Editar" className="rounded-lg p-2 text-sky-700 hover:bg-sky-50">
                          <Pencil size={17} />
                        </button>
                        <button onClick={() => eliminar(r.id)} title="Eliminar" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {resultados.length === 0 && (
              <p className="p-8 text-center text-slate-500">No se encontraron reservaciones.</p>
            )}
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

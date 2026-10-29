
import { useMemo, useState } from "react";
import {
  UserRound,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const pilotosIniciales = [
  {
    id: 1,
    identificacion: "1-1111-1111",
    nombre: "Carlos Rodríguez",
    licencia: "PIL-CR-1025",
    telefono: "8888-1111",
    correo: "carlos.rodriguez@globalairport.com",
    estado: "Activo",
  },
  {
    id: 2,
    identificacion: "1-2222-2222",
    nombre: "María Fernández",
    licencia: "PIL-CR-2040",
    telefono: "8888-2222",
    correo: "maria.fernandez@globalairport.com",
    estado: "Activo",
  },
];

const formularioVacio = {
  identificacion: "",
  nombre: "",
  licencia: "",
  telefono: "",
  correo: "",
  estado: "Activo",
};

const estados = ["Activo", "Licencia suspendida", "Inactivo"];

export default function Pilotos() {
  const [pilotos, setPilotos] = useState(pilotosIniciales);
  const [form, setForm] = useState(formularioVacio);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);

  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

  const label = "mb-1.5 block text-sm font-medium text-slate-700";

  const resultados = useMemo(() => {
    return pilotos.filter((p) => {
      const texto =
        `${p.identificacion} ${p.nombre} ${p.licencia} ${p.telefono} ${p.correo}`.toLowerCase();

      return (
        texto.includes(busqueda.toLowerCase()) &&
        (filtroEstado === "Todos" || p.estado === filtroEstado)
      );
    });
  }, [pilotos, busqueda, filtroEstado]);

  function cancelar() {
    setForm(formularioVacio);
    setEditando(null);
    setMostrarForm(false);
  }

  function guardar(e) {
    e.preventDefault();

    if (editando !== null) {
      setPilotos((actuales) =>
        actuales.map((p) =>
          p.id === editando ? { ...form, id: editando } : p
        )
      );
    } else {
      setPilotos((actuales) => [
        ...actuales,
        { ...form, id: Date.now() },
      ]);
    }

    cancelar();
  }

  function editar(piloto) {
    setForm({
      identificacion: piloto.identificacion,
      nombre: piloto.nombre,
      licencia: piloto.licencia,
      telefono: piloto.telefono,
      correo: piloto.correo,
      estado: piloto.estado,
    });

    setEditando(piloto.id);
    setMostrarForm(true);
  }

  function eliminar(id) {
    if (confirm("¿Deseás eliminar este piloto?")) {
      setPilotos((actuales) =>
        actuales.filter((p) => p.id !== id)
      );
    }
  }

  return (
    <>
     <header className="border-b border-sky-100 bg-white px-5 py-5">
        <h1 className="text-2xl font-bold text-[#0C2D57]">
         Pilotos
        </h1>
      </header>
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <UserRound size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
                Global Airport
              </p>
              <h1 className="text-3xl font-bold text-[#0C2D57]">
                Gestión de pilotos
              </h1>
              <p className="mt-1 text-slate-500">
                Administrá los datos y el estado laboral de los pilotos.
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
            <Plus size={18} /> Nuevo piloto
          </button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Total de pilotos", pilotos.length],
            ["Activos", pilotos.filter((p) => p.estado === "Activo").length],
            ["Inactivos", pilotos.filter((p) => p.estado === "Inactivo").length],
          ].map(([titulo, valor]) => (
            <div
              key={titulo}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{titulo}</p>
              <p className="mt-2 text-3xl font-bold text-[#0C2D57]">
                {valor}
              </p>
            </div>
          ))}
        </div>

        {mostrarForm && (
          <form
            onSubmit={guardar}
            className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0C2D57]">
                {editando !== null ? "Editar piloto" : "Registrar piloto"}
              </h2>

              <button
                type="button"
                onClick={cancelar}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={label}>Identificación</label>
                <input
                  required
                  className={input}
                  placeholder="Ej. 1-1234-5678"
                  value={form.identificacion}
                  onChange={(e) =>
                    setForm({ ...form, identificacion: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={label}>Nombre completo</label>
                <input
                  required
                  className={input}
                  placeholder="Nombre y apellidos"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={label}>Número de licencia</label>
                <input
                  required
                  className={input}
                  placeholder="Ej. PIL-CR-3001"
                  value={form.licencia}
                  onChange={(e) =>
                    setForm({ ...form, licencia: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={label}>Teléfono</label>
                <input
                  required
                  type="tel"
                  className={input}
                  placeholder="Ej. 8888-1234"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={label}>Correo electrónico</label>
                <input
                  required
                  type="email"
                  className={input}
                  placeholder="piloto@correo.com"
                  value={form.correo}
                  onChange={(e) =>
                    setForm({ ...form, correo: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={label}>Estado laboral</label>
                <select
                  className={input}
                  value={form.estado}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.value })
                  }
                >
                  {estados.map((estado) => (
                    <option key={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelar}
                className="rounded-xl border px-5 py-2.5 font-semibold text-slate-600"
              >
                Cancelar
              </button>

              <button className="rounded-xl bg-[#0284C7] px-5 py-2.5 font-semibold text-white hover:bg-sky-700">
                {editando !== null ? "Guardar cambios" : "Registrar piloto"}
              </button>
            </div>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 md:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, identificación, licencia o contacto..."
                className={`${input} pl-10`}
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={`${input} md:max-w-56`}
            >
              <option>Todos</option>
              {estados.map((estado) => (
                <option key={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {[
                    "Piloto",
                    "Identificación",
                    "Licencia",
                    "Contacto",
                    "Estado laboral",
                    "Acciones",
                  ].map((titulo) => (
                    <th key={titulo} className="px-5 py-4">
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {resultados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#0C2D57]">{p.nombre}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {p.correo}
                      </p>
                    </td>

                    <td className="px-5 py-4">{p.identificacion}</td>
                    <td className="px-5 py-4">{p.licencia}</td>
                    <td className="px-5 py-4">{p.telefono}</td>
                    <td className="px-5 py-4">{p.estado}</td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editar(p)}
                          title="Editar"
                          className="rounded-lg p-2 text-sky-700 hover:bg-sky-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => eliminar(p.id)}
                          title="Eliminar"
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {resultados.length === 0 && (
              <p className="p-8 text-center text-slate-500">
                No se encontraron pilotos.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

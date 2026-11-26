import { useEffect, useRef, useState } from "react";

import {
  UserRoundPlus,
  UserRound,
  CreditCard,
  Globe,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  X,
  Save,
  LoaderCircle,
  AlertCircle,
  Info,
} from "lucide-react";

import { pasajerosService } from "../../services/pasajerosService";

// =====================================
// FUNCIONES AUXILIARES
// =====================================

function normalizarDocumento(valor) {
  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, "");
}

function obtenerFechaActual() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const obtener = (tipo) =>
    partes.find((parte) => parte.type === tipo)?.value;

  return `${obtener("year")}-${obtener("month")}-${obtener("day")}`;
}

function fechaNacimientoValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const valor = new Date(`${fecha}T12:00:00.000Z`);

  if (Number.isNaN(valor.getTime())) {
    return false;
  }

  return (
    valor.toISOString().slice(0, 10) === fecha &&
    fecha >= "1000-01-01" &&
    fecha <= obtenerFechaActual()
  );
}

function crearFormularioInicial(busquedaInicial) {
  const busqueda = String(busquedaInicial ?? "").trim();

  const pareceDocumento =
    /^[A-Za-z0-9\s-]+$/.test(busqueda) &&
    /\d/.test(busqueda);

  return {
    nombreCompleto: pareceDocumento ? "" : busqueda,
    tipoDocumento: "CEDULA",
    numeroDocumento: pareceDocumento
      ? normalizarDocumento(busqueda)
      : "",
    nacionalidad: "",
    fechaNacimiento: "",
    correo: "",
    telefono: "",
    direccion: "",
  };
}

// =====================================
// COMPONENTE PRINCIPAL
// =====================================

export default function RegistrarPasajeroModal({
  busquedaInicial = "",
  pasajeros = [],
  onCerrar,
  onRegistrado,
}) {
  const dialogRef = useRef(null);
  const operacionEnCurso = useRef(false);

  const [form, setForm] = useState(() =>
    crearFormularioInicial(busquedaInicial)
  );

  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // =====================================
  // ABRIR MODAL
  // =====================================

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  // =====================================
  // ACTUALIZAR FORMULARIO
  // =====================================

  function actualizarCampo(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
  }

  // =====================================
  // VALIDAR FORMULARIO
  // =====================================

  function validarFormulario() {
    const nuevosErrores = {};

    const documento = normalizarDocumento(
      form.numeroDocumento
    );

    const correo = form.correo.trim();

    const telefono = form.telefono.trim();

    if (form.nombreCompleto.trim().length < 2) {
      nuevosErrores.nombreCompleto =
        "Ingresá el nombre completo del pasajero.";
    }

    if (
      !["CEDULA", "PASAPORTE", "RESIDENCIA"].includes(
        form.tipoDocumento
      )
    ) {
      nuevosErrores.tipoDocumento =
        "Seleccioná un tipo de documento válido.";
    }

    if (!/^[A-Z0-9]{1,50}$/.test(documento)) {
      nuevosErrores.numeroDocumento =
        "Ingresá un número de documento válido.";
    } else {
      const documentoDuplicado = pasajeros.some(
        (pasajero) =>
          normalizarDocumento(
            pasajero.numeroDocumento
          ) === documento
      );

      if (documentoDuplicado) {
        nuevosErrores.numeroDocumento =
          "Ya existe un pasajero con este documento.";
      }
    }

    if (!form.nacionalidad.trim()) {
      nuevosErrores.nacionalidad =
        "Ingresá la nacionalidad del pasajero.";
    }

    if (!fechaNacimientoValida(form.fechaNacimiento)) {
      nuevosErrores.fechaNacimiento =
        "Ingresá una fecha de nacimiento válida.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      nuevosErrores.correo =
        "Ingresá un correo electrónico válido.";
    }

    if (telefono) {
      const cantidadDigitos = telefono.replace(
        /\D/g,
        ""
      ).length;

      if (
        !/^\+?[\d\s().-]+$/.test(telefono) ||
        cantidadDigitos < 5 ||
        cantidadDigitos > 15
      ) {
        nuevosErrores.telefono =
          "Ingresá un número telefónico válido.";
      }
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  }

  // =====================================
  // REGISTRAR PASAJERO
  // =====================================

  async function registrarPasajero(event) {
    event.preventDefault();
    event.stopPropagation();

    if (operacionEnCurso.current) return;

    setError("");

    if (!validarFormulario()) {
      return;
    }

    operacionEnCurso.current = true;
    setSaving(true);

    let nuevoPasajero;

    try {
      const datos = {
        nombreCompleto: form.nombreCompleto
          .trim()
          .replace(/\s+/g, " "),

        tipoDocumento: form.tipoDocumento,

        numeroDocumento: normalizarDocumento(
          form.numeroDocumento
        ),

        nacionalidad: form.nacionalidad
          .trim()
          .replace(/\s+/g, " "),

        fechaNacimiento: form.fechaNacimiento,

        correo: form.correo
          .trim()
          .toLowerCase(),

        telefono: form.telefono.trim() || null,

        direccion: form.direccion.trim() || null,
      };

      nuevoPasajero =
        await pasajerosService.registrar(datos);

      if (!nuevoPasajero?.id) {
        throw new Error(
          "No se recibió el identificador del pasajero. Actualizá el directorio antes de intentar otro registro."
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "No fue posible registrar el pasajero."
      );

      return;
    } finally {
      operacionEnCurso.current = false;
      setSaving(false);
    }

    // Notificar al formulario de reservaciones.
    onRegistrado(nuevoPasajero);
  }

  // =====================================
  // CERRAR MODAL
  // =====================================

  function cerrarModal() {
    if (operacionEnCurso.current) return;

    onCerrar();
  }

  // =====================================
  // ESTILOS DE CAMPOS
  // =====================================

  function claseCampo(nombre) {
    return `
      w-full rounded-xl border bg-white px-3 py-2.5
      text-sm text-slate-700 outline-none transition
      placeholder:text-slate-400
      disabled:cursor-not-allowed disabled:bg-slate-50
      ${
        errores[nombre]
          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          : "border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      }
    `;
  }

  function mostrarError(nombre) {
    if (!errores[nombre]) return null;

    return (
      <p
        role="alert"
        className="mt-1 text-xs text-red-600"
      >
        {errores[nombre]}
      </p>
    );
  }

  // =====================================
  // INTERFAZ DEL MODAL
  // =====================================

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="registro-pasajero-titulo"
      onCancel={(event) => {
        event.preventDefault();
        cerrarModal();
      }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm"
    >
      <form
        noValidate
        onSubmit={registrarPasajero}
        className="flex max-h-[90vh] flex-col"
      >

        {/* ENCABEZADO */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

              <UserRoundPlus size={25} />

            </div>

            <div>

              <h2
                id="registro-pasajero-titulo"
                className="text-xl font-semibold text-[#0C2D57]"
              >
                Registrar nuevo pasajero
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Completá los datos para continuar con la reservación.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={cerrarModal}
            disabled={saving}
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >

            <X size={22} />

          </button>

        </div>

        {/* CONTENIDO DESPLAZABLE */}

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">

          {/* INFORMACIÓN DEL REGISTRO */}

          <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4">

            <Info
              size={20}
              className="mt-0.5 shrink-0 text-sky-600"
            />

            <p className="text-sm leading-relaxed text-sky-700">
              El pasajero quedará registrado en el sistema
              y se seleccionará automáticamente para
              continuar con la reservación.
            </p>

          </div>

          <fieldset
            disabled={saving}
            className="min-w-0 space-y-6"
          >

            {/* INFORMACIÓN PERSONAL */}

            <section className="space-y-4">

              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">

                <UserRound
                  size={20}
                  className="text-sky-600"
                />

                <h3 className="font-semibold text-[#0C2D57]">
                  Información personal
                </h3>

              </div>

              {/* NOMBRE COMPLETO */}

              <div>

                <label
                  htmlFor="registro-pasajero-nombre"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Nombre completo
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="registro-pasajero-nombre"
                  type="text"
                  name="nombreCompleto"
                  value={form.nombreCompleto}
                  onChange={actualizarCampo}
                  maxLength={191}
                  autoFocus
                  required
                  placeholder="Nombre y apellidos"
                  className={claseCampo("nombreCompleto")}
                />

                {mostrarError("nombreCompleto")}

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* TIPO DE DOCUMENTO */}

                <div>

                  <label
                    htmlFor="registro-pasajero-tipo"
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                  >

                    <CreditCard
                      size={15}
                      className="text-slate-400"
                    />

                    Tipo de documento

                    <span className="text-red-500">*</span>

                  </label>

                  <select
                    id="registro-pasajero-tipo"
                    name="tipoDocumento"
                    value={form.tipoDocumento}
                    onChange={actualizarCampo}
                    required
                    className={claseCampo("tipoDocumento")}
                  >

                    <option value="CEDULA">
                      Cédula
                    </option>

                    <option value="PASAPORTE">
                      Pasaporte
                    </option>

                    <option value="RESIDENCIA">
                      Residencia
                    </option>

                  </select>

                  {mostrarError("tipoDocumento")}

                </div>

                {/* NÚMERO DE DOCUMENTO */}

                <div>

                  <label
                    htmlFor="registro-pasajero-documento"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >

                    Número de documento

                    <span className="ml-1 text-red-500">*</span>

                  </label>

                  <input
                    id="registro-pasajero-documento"
                    type="text"
                    name="numeroDocumento"
                    value={form.numeroDocumento}
                    onChange={actualizarCampo}
                    maxLength={70}
                    required
                    placeholder="Número de identificación"
                    className={claseCampo("numeroDocumento")}
                  />

                  {mostrarError("numeroDocumento")}

                </div>

                {/* NACIONALIDAD */}

                <div>

                  <label
                    htmlFor="registro-pasajero-nacionalidad"
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                  >

                    <Globe
                      size={15}
                      className="text-slate-400"
                    />

                    Nacionalidad

                    <span className="text-red-500">*</span>

                  </label>

                  <input
                    id="registro-pasajero-nacionalidad"
                    type="text"
                    name="nacionalidad"
                    value={form.nacionalidad}
                    onChange={actualizarCampo}
                    maxLength={191}
                    required
                    placeholder="Ej. Costarricense"
                    className={claseCampo("nacionalidad")}
                  />

                  {mostrarError("nacionalidad")}

                </div>

                {/* FECHA DE NACIMIENTO */}

                <div>

                  <label
                    htmlFor="registro-pasajero-fecha"
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                  >

                    <CalendarDays
                      size={15}
                      className="text-slate-400"
                    />

                    Fecha de nacimiento

                    <span className="text-red-500">*</span>

                  </label>

                  <input
                    id="registro-pasajero-fecha"
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={actualizarCampo}
                    min="1000-01-01"
                    max={obtenerFechaActual()}
                    required
                    className={claseCampo("fechaNacimiento")}
                  />

                  {mostrarError("fechaNacimiento")}

                </div>

              </div>

            </section>

            {/* INFORMACIÓN DE CONTACTO */}

            <section className="space-y-4">

              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">

                <Mail
                  size={20}
                  className="text-sky-600"
                />

                <h3 className="font-semibold text-[#0C2D57]">
                  Información de contacto
                </h3>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* CORREO ELECTRÓNICO */}

                <div>

                  <label
                    htmlFor="registro-pasajero-correo"
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                  >

                    <Mail
                      size={15}
                      className="text-slate-400"
                    />

                    Correo electrónico

                    <span className="text-red-500">*</span>

                  </label>

                  <input
                    id="registro-pasajero-correo"
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={actualizarCampo}
                    maxLength={191}
                    required
                    placeholder="correo@ejemplo.com"
                    className={claseCampo("correo")}
                  />

                  {mostrarError("correo")}

                </div>

                {/* TELÉFONO */}

                <div>

                  <label
                    htmlFor="registro-pasajero-telefono"
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                  >

                    <Phone
                      size={15}
                      className="text-slate-400"
                    />

                    Teléfono

                  </label>

                  <input
                    id="registro-pasajero-telefono"
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={actualizarCampo}
                    maxLength={30}
                    placeholder="Ej. +506 8888 8888"
                    className={claseCampo("telefono")}
                  />

                  {mostrarError("telefono")}

                </div>

              </div>

              {/* DIRECCIÓN */}

              <div>

                <label
                  htmlFor="registro-pasajero-direccion"
                  className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
                >

                  <MapPin
                    size={15}
                    className="text-slate-400"
                  />

                  Dirección

                </label>

                <textarea
                  id="registro-pasajero-direccion"
                  name="direccion"
                  value={form.direccion}
                  onChange={actualizarCampo}
                  maxLength={191}
                  rows={3}
                  placeholder="Dirección del pasajero"
                  className={`${claseCampo("direccion")} resize-none`}
                />

                <p className="mt-1 text-right text-xs text-slate-400">

                  {form.direccion.length}/191

                </p>

              </div>

            </section>

          </fieldset>

          {/* MENSAJE DE ERROR DEL BACKEND */}

          {error && (

            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >

              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>

                <p className="text-sm font-semibold text-red-700">
                  No fue posible completar el registro
                </p>

                <p className="mt-1 text-sm text-red-600">

                  {error}

                </p>

              </div>

            </div>

          )}

          <p className="text-xs text-slate-500">

            <span className="text-red-500">*</span>

            {" Campos obligatorios."}

          </p>

        </div>

        {/* PIE DEL MODAL */}

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

          <button
            type="button"
            onClick={cerrarModal}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >

            Cancelar

          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >

            {saving ? (

              <>

                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />

                Registrando...

              </>

            ) : (

              <>

                <Save size={17} />

                Registrar y seleccionar

              </>

            )}

          </button>

        </div>

      </form>

    </dialog>
  );
}
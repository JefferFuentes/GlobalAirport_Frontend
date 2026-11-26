import { useEffect, useMemo, useRef, useState } from "react";
import { Ticket, Plus, Search, TicketX, X, RefreshCw, ClipboardCheck, TicketCheck, ReceiptText, } from "lucide-react";
import { reservacionesService } from "../services/reservacionesService";
import { vuelosService } from "../services/vuelosService";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../config/permissions";
import PageHeader from "../components/management/PageHeader";
import StatCard from "../components/management/StatCard";
import SelectorAsientos from "../components/management/SelectorAsientos";
import CancelarReservacionModal from "../components/management/CancelarReservacionModal";
import { checkinService } from "../services/checkinService";
import RegistrarCheckInModal from "../components/management/RegistrarCheckInModal";
import PaseAbordajeModal from "../components/management/PaseAbordajeModal";
import { imprimirDocumento } from "../utils/imprimirDocumento";
import { comprobantesService } from "../services/comprobantesService";
import ComprobanteReservacionModal from "../components/management/ComprobanteReservacionModal";
import { pasajerosService } from "../services/pasajerosService";
import SelectorPasajeros from "../components/management/SelectorPasajeros";
import RegistrarPasajeroModal from "../components/management/RegistrarPasajeroModal";

const formularioVacio = {
  pasajeroId: "",
  vueloId: "",
  asientoId: "",
  metodoPago: "TARJETA",
  monto: "",
};

const estados = ["CONFIRMADA", "CANCELADA", "CHECK_IN"];

const etiquetasEstado = {
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  CHECK_IN: "Check-in realizado",
};

const estilosEstado = {
  CONFIRMADA:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  CANCELADA:
    "bg-red-50 text-red-700 border-red-200",

  CHECK_IN:
    "bg-sky-50 text-sky-700 border-sky-200",
};

export default function Reservaciones() {
  const { rol, aeropuertoActivo } = useAuth();

  const accesoGlobal =
    rol === "ADMIN_GENERAL";

  const aeropuertoActivoId =
    aeropuertoActivo?.id ?? null;

  const tieneContextoOperativo =
    accesoGlobal ||
    (
      ["ADMIN_AEROPUERTO", "EMPLEADO"].includes(rol) &&
      Number.isSafeInteger(aeropuertoActivoId) &&
      aeropuertoActivoId > 0 &&
      aeropuertoActivoId <= 2147483647
    );

  // =====================================
  // PERMISOS
  // =====================================

  const puedeConsultar =
    tieneContextoOperativo &&
    tienePermiso(rol, "reservaciones", "consultar");

  const puedeCrear =
    tieneContextoOperativo &&
    tienePermiso(rol, "reservaciones", "crear");

  const puedeCancelar =
    tieneContextoOperativo &&
    tienePermiso(rol, "reservaciones", "cancelar");

  const puedeConsultarAsientos =
    tieneContextoOperativo &&
    tienePermiso(rol, "reservaciones", "consultarAsientos");

  const puedeConsultarComprobante =
    tieneContextoOperativo &&
    tienePermiso(rol, "reservaciones", "consultarComprobante");

  const puedeRegistrarCheckIn =
    tieneContextoOperativo &&
    tienePermiso(rol, "reservaciones", "registrarCheckIn");

  const puedeConsultarCheckIn =
    tieneContextoOperativo &&
    tienePermiso(rol, "reservaciones", "consultarCheckIn");

  const puedeGenerarPaseAbordaje =
    tieneContextoOperativo &&
    tienePermiso(rol, "reservaciones", "generarPaseAbordaje");


  const [pasajeros, setPasajeros] = useState([]);
  const [mostrarRegistroPasajero, setMostrarRegistroPasajero] = useState(false);
  const [busquedaInicialPasajero, setBusquedaInicialPasajero] = useState("");
  const [cargandoPasajeros, setCargandoPasajeros] = useState(true);
  const [errorPasajeros, setErrorPasajeros] = useState("");
  const [vuelos, setVuelos] = useState([]);
  const [asientos, setAsientos] = useState([]);
  const [cargandoAsientos, setCargandoAsientos] = useState(false);
  const [reservaciones, setReservaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(formularioVacio);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reservacionCancelar, setReservacionCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelacion, setErrorCancelacion] = useState("");
  const [reservacionCheckIn, setReservacionCheckIn] = useState(null);
  const [registrandoCheckIn, setRegistrandoCheckIn] = useState(false);
  const [errorCheckIn, setErrorCheckIn] = useState("");
  const [mostrarPaseAbordaje, setMostrarPaseAbordaje] = useState(false);
  const [detalleCheckIn, setDetalleCheckIn] = useState(null);
  const [cargandoPaseAbordaje, setCargandoPaseAbordaje] = useState(false);
  const [errorPaseAbordaje, setErrorPaseAbordaje] = useState("");
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [detalleComprobante, setDetalleComprobante] = useState(null);
  const [cargandoComprobante, setCargandoComprobante] = useState(false);
  const [errorComprobante, setErrorComprobante] = useState("");
  const consultaComprobanteRef = useRef(0);
  const consultaPaseRef = useRef(0);

  useEffect(() => {

    if (!puedeConsultar) {
      setReservaciones([]);
      setCargando(false);
      return;
    }

    cargarReservaciones();

  }, [puedeConsultar, aeropuertoActivoId]);

  useEffect(() => {
    async function cargarOpciones() {
      if (!puedeCrear) {
        setVuelos([]);
        setPasajeros([]);
        setCargandoPasajeros(false);
        return;
      }
      try {
        const respuestaVuelos =
          await vuelosService.obtenerTodos();

        setVuelos(
          Array.isArray(respuestaVuelos)
            ? respuestaVuelos
            : respuestaVuelos?.data ?? []
        );

      } catch (err) {
        console.error(
          "Error al cargar vuelos:",
          err
        );

        setError(err.message);
      }
    }

    cargarOpciones();
    cargarPasajeros();

  }, [puedeCrear, aeropuertoActivoId]);

  useEffect(() => {
    let vigente = true;

    async function cargarAsientos() {
      setAsientos([]);

      if (!form.vueloId || !puedeConsultarAsientos) {
        setCargandoAsientos(false);
        return;
      }

      try {
        setCargandoAsientos(true);
        setError("");

        const respuesta =
          await reservacionesService.obtenerDisponibilidad(
            form.vueloId
          );

        const datos = respuesta?.data ?? respuesta;

        if (!Array.isArray(datos?.asientos)) {
          throw new Error(
            "La API no devolvió una lista válida de asientos."
          );
        }

        if (vigente) {
          setAsientos(datos.asientos);
        }

      } catch (err) {
        if (vigente) {
          console.error("Error al cargar asientos:", err);
          setAsientos([]);
          setError(err.message);
        }

      } finally {
        if (vigente) {
          setCargandoAsientos(false);
        }
      }
    }

    cargarAsientos();

    return () => {
      vigente = false;
    };

  }, [form.vueloId, puedeConsultarAsientos]);

  function nuevaReservacion() {

    if (guardando || mostrarRegistroPasajero) {
      return;
    }

    if (!puedeCrear) {
      setError(
        "No tenés permiso para crear reservaciones."
      );
      return;
    }

    cancelar();

    setError("");
    setMensaje("");
    setMostrarForm(true);
  }

  async function cargarPasajeros() {
    try {
      setCargandoPasajeros(true);
      setErrorPasajeros("");

      const respuesta =
        await pasajerosService.obtenerTodos();

      if (!Array.isArray(respuesta)) {
        throw new Error(
          "La API no devolvió una lista de pasajeros válida."
        );
      }

      setPasajeros(respuesta);

    } catch (err) {
      setErrorPasajeros(
        err.message ||
        "No fue posible consultar los pasajeros."
      );

      setPasajeros([]);

    } finally {
      setCargandoPasajeros(false);
    }
  }

  async function cargarReservaciones() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await reservacionesService.obtenerTodos();

      console.log("Reservaciones:", respuesta);

      const lista = respuesta?.reservaciones;

      if (!Array.isArray(lista)) {
        throw new Error(
          "La API no devolvió una lista de reservaciones."
        );
      }

      setReservaciones(lista);

    } catch (err) {
      console.error("Error al cargar reservaciones:", err);
      setError(err.message);

    } finally {
      setCargando(false);
    }
  }

  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
  const label = "mb-1.5 block text-sm font-medium text-slate-700";

  const resultados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return reservaciones.filter((r) => {
      const texto = [
        r.codigo,
        r.pasajero?.nombreCompleto,
        r.vuelo?.numeroVuelo,
        r.asiento?.numero,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideBusqueda = texto.includes(termino);

      const coincideEstado =
        filtroEstado === "Todos" ||
        r.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [reservaciones, busqueda, filtroEstado]);

  function cancelar() {
    setForm({ ...formularioVacio });
    setAsientos([]);
    setMostrarForm(false);
  }
  async function guardar(e) {
    e.preventDefault();

    if (mostrarRegistroPasajero) {
      return;
    }

    if (!pasajeroValido()) {
      setError(
        "Debés seleccionar un pasajero registrado."
      );

      return;
    }

    if (guardando) return;

    if (!puedeCrear) {
      setError("No tenés permiso para crear reservaciones.");
      return;
    }

    setError("");
    setMensaje("");

    const datos = {
      pasajeroId: Number(form.pasajeroId),
      vueloId: Number(form.vueloId),
      asientoId: Number(form.asientoId),
      metodoPago: form.metodoPago.trim(),
      monto: Number(form.monto),
    };

    try {
      setGuardando(true);

      const identificadores = [
        datos.pasajeroId,
        datos.vueloId,
        datos.asientoId,
      ];

      if (
        identificadores.some(
          (id) => !Number.isInteger(id) || id <= 0
        )
      ) {
        throw new Error(
          "Debés seleccionar un pasajero, un vuelo y un asiento."
        );
      }

      if (
        !vuelosDisponibles.some(
          (vuelo) => Number(vuelo.id) === datos.vueloId
        )
      ) {
        throw new Error(
          "El vuelo seleccionado no permite reservaciones."
        );
      }

      if (
        !puedeConsultarAsientos ||
        cargandoAsientos ||
        !asientosDisponibles.some(
          (asiento) => Number(asiento.id) === datos.asientoId
        )
      ) {
        throw new Error(
          "Debés seleccionar un asiento disponible."
        );
      }

      if (!datos.metodoPago) {
        throw new Error("Debés seleccionar un método de pago.");
      }

      if (
        !Number.isFinite(datos.monto) ||
        datos.monto <= 0
      ) {
        throw new Error("El monto debe ser mayor que cero.");
      }

      await reservacionesService.registrar(datos);

      cancelar();

      await cargarReservaciones();

      setMensaje("Reservación registrada correctamente.");

    } catch (err) {
      console.error("Error al guardar reservación:", err);
      setError(err.message);

    } finally {
      setGuardando(false);
    }
  }

  function puedeVerComprobante(reservacion) {
    return (
      puedeConsultarComprobante &&
      ["CONFIRMADA", "CHECK_IN", "CANCELADA"].includes(
        reservacion.estado
      )
    );
  }

  async function abrirComprobante(reservacion) {
    if (!puedeVerComprobante(reservacion)) {
      setError(
        "No se puede consultar el comprobante de esta reservación."
      );
      return;
    }

    const consultaActual = ++consultaComprobanteRef.current;

    setError("");
    setMensaje("");
    setDetalleComprobante(null);
    setErrorComprobante("");
    setCargandoComprobante(true);
    setMostrarComprobante(true);

    try {
      const respuesta =
        await comprobantesService.obtenerPorReservacion(
          reservacion.id
        );

      if (consultaActual !== consultaComprobanteRef.current) {
        return;
      }

      const comprobante = respuesta?.comprobante;

      if (
        !comprobante ||
        !comprobante.codigo ||
        Number(comprobante.id) !== Number(reservacion.id)
      ) {
        throw new Error(
          "La API no devolvió un comprobante válido."
        );
      }

      setDetalleComprobante(comprobante);

    } catch (err) {
      if (consultaActual === consultaComprobanteRef.current) {
        console.error(
          "Error al consultar comprobante:",
          err
        );

        setErrorComprobante(
          err.message ||
          "No se pudo consultar el comprobante."
        );
      }

    } finally {
      if (consultaActual === consultaComprobanteRef.current) {
        setCargandoComprobante(false);
      }
    }
  }

  function cerrarComprobante() {
    consultaComprobanteRef.current += 1;

    setMostrarComprobante(false);
    setDetalleComprobante(null);
    setErrorComprobante("");
    setCargandoComprobante(false);
  }

  async function imprimirComprobante(elemento) {
    if (!puedeConsultarComprobante || !detalleComprobante) {
      setErrorComprobante(
        "No se puede imprimir este comprobante."
      );
      return;
    }

    const consultaActual = consultaComprobanteRef.current;

    try {
      await imprimirDocumento(
        elemento,
        `Comprobante de reservación - ${detalleComprobante.codigo}`,
        "comprobante"
      );

    } catch (err) {
      if (consultaActual !== consultaComprobanteRef.current) {
        return;
      }

      console.error(
        "Error al imprimir comprobante:",
        err
      );

      setErrorComprobante(
        err.message ||
        "No se pudo imprimir el comprobante."
      );
    }
  }

  function puedeCancelarReservacion(reservacion) {
    return (
      puedeCancelar &&
      reservacion.estado === "CONFIRMADA" &&
      reservacion.vuelo?.estado === "PROGRAMADO" &&
      reservacion.checkIn === null
    );
  }

  function puedeRealizarCheckIn(reservacion) {
    return (
      puedeRegistrarCheckIn &&
      reservacion.estado === "CONFIRMADA" &&
      ["PROGRAMADO", "ABORDANDO"].includes(
        reservacion.vuelo?.estado
      ) &&
      reservacion.checkIn === null
    );
  }

  function abrirCheckIn(reservacion) {
    if (!puedeRealizarCheckIn(reservacion)) {
      setError(
        "Esta reservación no permite realizar el check-in."
      );
      return;
    }

    setError("");
    setMensaje("");
    setErrorCheckIn("");
    setReservacionCheckIn(reservacion);
  }

  function cerrarCheckIn() {
    if (registrandoCheckIn) return;

    setReservacionCheckIn(null);
    setErrorCheckIn("");
  }

  async function confirmarCheckIn() {
    if (registrandoCheckIn || !reservacionCheckIn) {
      return;
    }

    setErrorCheckIn("");

    if (!puedeRealizarCheckIn(reservacionCheckIn)) {
      setErrorCheckIn(
        "Esta reservación no permite realizar el check-in."
      );
      return;
    }

    try {
      setRegistrandoCheckIn(true);

      const respuesta = await checkinService.registrar(
        reservacionCheckIn.id
      );

      console.log("Check-in registrado:", respuesta);

      setReservacionCheckIn(null);

      await cargarReservaciones();

      setMensaje(
        respuesta?.mensaje ||
        "Check-in realizado correctamente."
      );

    } catch (err) {
      console.error("Error al registrar check-in:", err);

      setErrorCheckIn(err.message);

    } finally {
      setRegistrandoCheckIn(false);
    }
  }

  function puedeVerPaseAbordaje(reservacion) {
    return (
      puedeConsultarCheckIn &&
      reservacion.estado === "CHECK_IN"
    );
  }

  async function abrirPaseAbordaje(reservacion) {
    if (!puedeVerPaseAbordaje(reservacion)) {
      setError(
        "No tenés permiso para consultar este pase de abordaje."
      );
      return;
    }

    const consultaActual = ++consultaPaseRef.current;

    setError("");
    setMensaje("");
    setDetalleCheckIn(null);
    setErrorPaseAbordaje("");
    setCargandoPaseAbordaje(true);
    setMostrarPaseAbordaje(true);

    try {
      const respuesta =
        await checkinService.obtenerPorReservacion(
          reservacion.id
        );

      if (
        !respuesta?.checkIn?.reservacion ||
        !respuesta.checkIn.codigoAbordaje
      ) {
        throw new Error(
          "La API no devolvió un pase de abordaje válido."
        );
      }

      if (consultaActual === consultaPaseRef.current) {
        setDetalleCheckIn(respuesta.checkIn);
      }

    } catch (err) {
      if (consultaActual === consultaPaseRef.current) {
        console.error(
          "Error al consultar pase de abordaje:",
          err
        );

        setErrorPaseAbordaje(
          err.message || "No se pudo consultar el pase."
        );
      }

    } finally {
      if (consultaActual === consultaPaseRef.current) {
        setCargandoPaseAbordaje(false);
      }
    }
  }

  async function imprimirPaseAbordaje(elemento) {
    if (!puedeConsultarCheckIn || !detalleCheckIn) {
      setErrorPaseAbordaje(
        "No se puede imprimir este pase de abordaje."
      );
      return;
    }

    const consultaActual = consultaPaseRef.current;

    try {
      await imprimirDocumento(
        elemento,
        `Pase de abordaje - ${detalleCheckIn.codigoAbordaje}`,
        "pase-abordaje"
      );

    } catch (err) {
      if (consultaActual !== consultaPaseRef.current) {
        return;
      }

      console.error(
        "Error al imprimir pase de abordaje:",
        err
      );

      setErrorPaseAbordaje(
        err.message ||
        "No se pudo imprimir el pase de abordaje."
      );
    }
  }

  function cerrarPaseAbordaje() {
    consultaPaseRef.current += 1;

    setMostrarPaseAbordaje(false);
    setDetalleCheckIn(null);
    setErrorPaseAbordaje("");
    setCargandoPaseAbordaje(false);
  }

  function abrirCancelacion(reservacion) {
    if (!puedeCancelarReservacion(reservacion)) {
      setError("Esta reservación no se puede cancelar.");
      return;
    }

    setError("");
    setMensaje("");
    setErrorCancelacion("");
    setReservacionCancelar(reservacion);
  }

  function cerrarCancelacion() {
    if (cancelando) return;

    setReservacionCancelar(null);
    setErrorCancelacion("");
  }

  async function confirmarCancelacion(motivo) {
    if (cancelando || !reservacionCancelar) return;

    setErrorCancelacion("");

    if (!puedeCancelarReservacion(reservacionCancelar)) {
      setErrorCancelacion(
        "Esta reservación no se puede cancelar."
      );
      return;
    }

    if (!motivo.trim()) {
      setErrorCancelacion(
        "Debés indicar el motivo de la cancelación."
      );
      return;
    }

    try {
      setCancelando(true);

      await reservacionesService.cancelar(
        reservacionCancelar.id,
        motivo.trim()
      );

      setReservacionCancelar(null);

      await cargarReservaciones();

      setMensaje("Reservación cancelada correctamente.");

    } catch (err) {
      console.error("Error al cancelar reservación:", err);

      setErrorCancelacion(err.message);

    } finally {
      setCancelando(false);
    }
  }

  const vuelosDisponibles = useMemo(() => {
    return vuelos.filter((vuelo) => {
      const esProgramado = vuelo.estado === "PROGRAMADO";

      const tieneAcceso =
        rol === "ADMIN_GENERAL" ||
        (
          aeropuertoActivo?.id != null &&
          Number(vuelo.aeropuertoOrigenId) ===
          Number(aeropuertoActivo.id)
        );

      return esProgramado && tieneAcceso;
    });
  }, [vuelos, rol, aeropuertoActivo]);

  const asientosDisponibles = useMemo(() => {
    return asientos.filter(
      (asiento) => asiento.disponible === true
    );
  }, [asientos]);

  const asientosOcupados = useMemo(() => {
    return asientos.filter(
      (asiento) => asiento.disponible === false
    );
  }, [asientos]);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("Todos");
  }

  function seleccionarPasajero(id) {
    setForm((prev) => ({
      ...prev,
      pasajeroId: id ? String(id) : "",
    }));
  }

  function abrirRegistroPasajero(busqueda) {
    if (
      !mostrarForm ||
      guardando ||
      cargandoPasajeros ||
      errorPasajeros ||
      !puedeCrear ||
      !tienePermiso(rol, "pasajeros", "crear")
    ) {
      return;
    }

    setBusquedaInicialPasajero(busqueda || "");
    setMostrarRegistroPasajero(true);
  }

  function cerrarRegistroPasajero() {
    setMostrarRegistroPasajero(false);
    setBusquedaInicialPasajero("");
  }

  function manejarPasajeroRegistrado(nuevoPasajero) {
    if (!nuevoPasajero?.id) return;

    // Actualizar el listado de pasajeros.
    setPasajeros((prev) => {
      const lista = prev.filter(
        (pasajero) =>
          String(pasajero.id) !==
          String(nuevoPasajero.id)
      );

      return [...lista, nuevoPasajero].sort(
        (a, b) =>
          a.nombreCompleto.localeCompare(
            b.nombreCompleto,
            "es"
          )
      );
    });

    // Seleccionar automáticamente el pasajero.
    setForm((prev) => ({
      ...prev,
      pasajeroId: String(nuevoPasajero.id),
    }));

    // Cerrar únicamente el modal de pasajeros.
    cerrarRegistroPasajero();
  }

  function pasajeroValido() {
    if (
      cargandoPasajeros ||
      errorPasajeros ||
      !form.pasajeroId
    ) {
      return false;
    }

    return pasajeros.some(
      (pasajero) =>
        String(pasajero.id) ===
        String(form.pasajeroId)
    );
  }

  if (!puedeConsultar) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <h2 className="text-xl font-bold text-[#0C2D57]">
            Acceso restringido
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            No tenés permisos o un contexto operativo
            válido para consultar las reservaciones.
          </p>

        </div>

      </div>
    );
  }

  return (
    <>
      <header className="border-b border-sky-100 bg-white px-5 py-5">
        <h1 className="text-2xl font-bold text-[#0C2D57]">
          Reservaciones
        </h1>
      </header>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto w-full max-w-[1600px]">
          <PageHeader
            icono={Ticket}
            titulo="Gestión de reservaciones"
            descripcion="Administrá las reservaciones de los pasajeros."
            onActualizar={cargarReservaciones}
            onNuevo={
              puedeCrear &&
                !guardando &&
                !mostrarRegistroPasajero
                ? nuevaReservacion
                : undefined
            }
            textoBoton="Nueva reservación"
          />

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              titulo="Total de reservaciones"
              valor={reservaciones.length}
            />

            <StatCard
              titulo="Confirmadas"
              valor={
                reservaciones.filter(
                  (r) => r.estado === "CONFIRMADA"
                ).length
              }
            />

            <StatCard
              titulo="Check-in realizados"
              valor={
                reservaciones.filter(
                  (r) => r.estado === "CHECK_IN"
                ).length
              }
            />

            <StatCard
              titulo="Canceladas"
              valor={
                reservaciones.filter(
                  (r) => r.estado === "CANCELADA"
                ).length
              }
            />

          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200
               bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {mensaje && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200
               bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {mensaje}
            </div>
          )}

          {mostrarForm && puedeCrear && (
            <form onSubmit={guardar} className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0C2D57]">
                  Registrar reservación
                </h2>
                <button
                  type="button"
                  onClick={cancelar}
                  disabled={guardando}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="sm:col-span-2 lg:col-span-3">

                  <SelectorPasajeros
                    pasajeros={pasajeros}
                    pasajeroId={form.pasajeroId}
                    onSeleccionar={seleccionarPasajero}
                    onRegistrar={abrirRegistroPasajero}
                    cargando={cargandoPasajeros}
                    error={errorPasajeros}
                    disabled={guardando || mostrarRegistroPasajero}
                  />

                  {errorPasajeros && (
                    <button
                      type="button"
                      onClick={cargarPasajeros}
                      disabled={cargandoPasajeros}
                      className="mt-3 text-sm font-semibold text-sky-600 hover:text-sky-800"
                    >
                      Reintentar consulta de pasajeros
                    </button>
                  )}

                </div>

                <div>
                  <label className={label}>Vuelo</label>

                  <select
                    required
                    className={input}
                    value={form.vueloId}
                    disabled={guardando}
                    onChange={(e) => {
                      setAsientos([]);

                      setCargandoAsientos(Boolean(e.target.value));

                      setForm((actual) => ({
                        ...actual,
                        vueloId: e.target.value,
                        asientoId: "",
                      }));
                    }}
                  >
                    <option value="">Seleccionar vuelo</option>

                    {vuelosDisponibles.map((vuelo) => (
                      <option key={vuelo.id} value={vuelo.id}>
                        {vuelo.numeroVuelo}
                      </option>
                    ))}
                  </select>

                  {vuelosDisponibles.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      No hay vuelos programados disponibles.
                    </p>
                  )}
                </div>

                <div>
                  <label className={label}>Método de pago</label>
                  <select
                    required
                    className={input}
                    value={form.metodoPago}
                    onChange={(e) =>
                      setForm({ ...form, metodoPago: e.target.value })
                    }
                  >
                    <option value="TARJETA">Tarjeta</option>
                  </select>
                </div>
                <div>
                  <label className={label}>Monto</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    max="9999999999.99"
                    step="0.01"
                    className={input}
                    placeholder="Ej. 250.00"
                    value={form.monto}
                    onChange={(e) =>
                      setForm({ ...form, monto: e.target.value })
                    }
                  />
                </div>
                {form.vueloId && (
                  <div className="col-span-full mt-2 w-full min-w-0">
                    <SelectorAsientos
                      asientos={asientos}
                      asientoSeleccionado={form.asientoId}
                      cargando={cargandoAsientos}
                      deshabilitado={
                        guardando || !puedeConsultarAsientos
                      }
                      onSeleccionar={(asientoId) =>
                        setForm((actual) => ({
                          ...actual,
                          asientoId,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelar}
                  disabled={guardando || mostrarRegistroPasajero}
                  className="
        rounded-xl border px-5 py-2.5
        font-semibold text-slate-600
        disabled:cursor-not-allowed
        disabled:opacity-50
    "
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    guardando ||
                    mostrarRegistroPasajero ||
                    cargandoAsientos ||
                    !pasajeroValido() ||
                    !form.vueloId ||
                    !form.asientoId ||
                    !form.metodoPago ||
                    !Number.isFinite(Number(form.monto)) ||
                    Number(form.monto) <= 0 ||
                    !puedeCrear ||
                    !puedeConsultarAsientos
                  }
                  className="rounded-xl bg-[#0284C7] px-5 py-2.5
             font-semibold text-white hover:bg-sky-700
             disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando
                    ? "Registrando..."
                    : "Registrar reservación"}
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

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={`${input} md:max-w-52`}
              >
                <option value="Todos">Todos los estados</option>

                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {etiquetasEstado[estado] || estado}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={limpiarFiltros}
                disabled={
                  !busqueda && filtroEstado === "Todos"
                }
                className="flex items-center justify-center gap-2
             rounded-xl border border-slate-200
             bg-white px-4 py-2.5 text-sm font-medium
             text-slate-600 hover:bg-slate-50
             disabled:cursor-not-allowed
             disabled:opacity-50"
              >
                <X size={16}
                  disabled={guardando || mostrarRegistroPasajero} />
                Limpiar filtros
              </button>
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
                      <td className="px-5 py-4">{r.pasajero?.nombreCompleto || "Sin pasajero"}</td>
                      <td className="px-5 py-4">{r.vuelo?.numeroVuelo}</td>
                      <td className="px-5 py-4">
                        {r.fechaReservacion
                          ? new Date(r.fechaReservacion).toLocaleDateString("es-CR", {
                            timeZone: "America/Costa_Rica",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                          : "Sin fecha"}
                      </td>
                      <td className="px-5 py-4">{r.asiento?.numero || "Sin asiento"}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`
      inline-flex items-center gap-1.5
      whitespace-nowrap rounded-full border
      px-3 py-1 text-xs font-semibold
      ${estilosEstado[r.estado] ||
                            "bg-slate-100 text-slate-600 border-slate-200"}
    `}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />

                          {etiquetasEstado[r.estado] || r.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">

                          {/* Consultar comprobante */}
                          {puedeVerComprobante(r) && (
                            <button
                              type="button"
                              onClick={() => abrirComprobante(r)}
                              title="Ver comprobante de reservación"
                              aria-label={`Ver comprobante ${r.codigo}`}
                              className="
          rounded-lg p-2 text-sky-600
          transition-colors hover:bg-sky-50
        "
                            >
                              <ReceiptText size={19} />
                            </button>
                          )}

                          {/* Registrar check-in */}
                          {puedeRealizarCheckIn(r) && (
                            <button
                              type="button"
                              onClick={() => abrirCheckIn(r)}
                              title="Registrar check-in"
                              aria-label={`Registrar check-in ${r.codigo}`}
                              className="
          rounded-lg p-2 text-sky-600
          transition-colors hover:bg-sky-50
        "
                            >
                              <ClipboardCheck size={19} />
                            </button>
                          )}

                          {/* Consultar pase de abordaje */}
                          {puedeVerPaseAbordaje(r) && (
                            <button
                              type="button"
                              onClick={() => abrirPaseAbordaje(r)}
                              title="Ver pase de abordaje"
                              aria-label={`Ver pase de abordaje ${r.codigo}`}
                              className="
          rounded-lg p-2 text-sky-600
          transition-colors hover:bg-sky-50
        "
                            >
                              <TicketCheck size={19} />
                            </button>
                          )}

                          {/* Cancelar reservación */}
                          {puedeCancelarReservacion(r) && (
                            <button
                              type="button"
                              onClick={() => abrirCancelacion(r)}
                              title="Cancelar reservación"
                              aria-label={`Cancelar reservación ${r.codigo}`}
                              className="
          rounded-lg p-2 text-red-600
          transition-colors hover:bg-red-50
        "
                            >
                              <TicketX size={19} />
                            </button>
                          )}

                          {/* Sin acciones disponibles */}
                          {!puedeVerComprobante(r) &&
                            !puedeRealizarCheckIn(r) &&
                            !puedeVerPaseAbordaje(r) &&
                            !puedeCancelarReservacion(r) && (
                              <span className="text-xs text-slate-400">
                                Sin acciones
                              </span>
                            )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {cargando ? (
                <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
                  <RefreshCw size={18} className="animate-spin" />
                  Cargando reservaciones...
                </div>
              ) : resultados.length === 0 && (
                <div className="flex flex-col items-center gap-3 p-10 text-slate-500">
                  <Search size={32} className="text-slate-300" />

                  <p className="font-medium">
                    No se encontraron reservaciones.
                  </p>

                  <p className="text-sm">
                    {busqueda || filtroEstado !== "Todos"
                      ? "Intentá modificar los filtros de búsqueda."
                      : "Todavía no hay reservaciones registradas."}
                  </p>
                </div>
              )}

              {!cargando && (
                <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
                  Mostrando {resultados.length} de {reservaciones.length} reservaciones
                </div>
              )}
            </div>

          </section>
        </div>
      </div>
      {reservacionCancelar && (
        <CancelarReservacionModal
          key={reservacionCancelar.id}
          reservacion={reservacionCancelar}
          onCerrar={cerrarCancelacion}
          onConfirmar={confirmarCancelacion}
          procesando={cancelando}
          error={errorCancelacion}
        />
      )}

      {reservacionCheckIn && (
        <RegistrarCheckInModal
          key={reservacionCheckIn.id}
          reservacion={reservacionCheckIn}
          onCerrar={cerrarCheckIn}
          onConfirmar={confirmarCheckIn}
          procesando={registrandoCheckIn}
          error={errorCheckIn}
        />
      )}

      {mostrarPaseAbordaje && (
        <PaseAbordajeModal
          checkIn={detalleCheckIn}
          onCerrar={cerrarPaseAbordaje}
          onImprimir={imprimirPaseAbordaje}
          cargando={cargandoPaseAbordaje}
          error={errorPaseAbordaje}
        />
      )}

      {mostrarComprobante && (
        <ComprobanteReservacionModal
          comprobante={detalleComprobante}
          onCerrar={cerrarComprobante}
          onImprimir={imprimirComprobante}
          cargando={cargandoComprobante}
          error={errorComprobante}
        />
      )}

      {mostrarRegistroPasajero && (
        <RegistrarPasajeroModal
          busquedaInicial={busquedaInicialPasajero}
          pasajeros={pasajeros}
          onCerrar={cerrarRegistroPasajero}
          onRegistrado={manejarPasajeroRegistrado}
        />
      )}
    </>
  );
}

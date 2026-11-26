import {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";

import {
    login,
    obtenerUsuario,
    seleccionarAeropuerto,
    logout,
} from "../services/auth.service";

import {
    EVENTO_SESION_INVALIDA,
    obtenerSesionGuardada,
} from "../services/api";

const AuthContext = createContext(null);

// =====================================
// ROLES AUTORIZADOS
// =====================================

const rolesValidos = [
    "ADMIN_GENERAL",
    "ADMIN_AEROPUERTO",
    "EMPLEADO",
];

// =====================================
// VALIDAR IDENTIFICADOR
// =====================================

function idValido(id) {

    return (
        Number.isSafeInteger(id) &&
        id > 0 &&
        id <= 2147483647
    );
}

// =====================================
// VALIDAR ESTRUCTURA DE SESIÓN
// =====================================

function validarSesion(datos) {

    if (
        !datos ||
        typeof datos.token !== "string" ||
        !datos.token.trim()
    ) {

        throw new Error(
            "La sesión no contiene un token válido."
        );
    }

    if (!idValido(datos.usuario?.id)) {

        throw new Error(
            "No se recibió un usuario válido."
        );
    }

    if (
        !rolesValidos.includes(
            datos.usuario.rol
        )
    ) {

        throw new Error(
            "El usuario no tiene un rol autorizado."
        );
    }

    if (
        typeof datos.expiraEn !== "string" ||
        !Number.isFinite(
            Date.parse(datos.expiraEn)
        ) ||
        Date.parse(datos.expiraEn) <= Date.now()
    ) {

        throw new Error(
            "La sesión ha expirado o su fecha no es válida."
        );
    }

    const rol = datos.usuario.rol;

    if (
        rol === "ADMIN_GENERAL" &&
        datos.aeropuertoActivo != null
    ) {

        throw new Error(
            "El contexto global no es válido."
        );
    }

    if (
        rol === "EMPLEADO" &&
        !idValido(datos.aeropuertoActivo?.id)
    ) {

        throw new Error(
            "El empleado no tiene un aeropuerto asignado."
        );
    }

    if (
        rol === "ADMIN_AEROPUERTO" &&
        datos.aeropuertoActivo != null &&
        (
            !idValido(datos.aeropuertoActivo.id) ||
            !datos.aeropuertos?.some(
                aeropuerto =>
                    aeropuerto.id ===
                    datos.aeropuertoActivo.id
            )
        )
    ) {

        throw new Error(
            "El aeropuerto seleccionado no está autorizado."
        );
    }

    return datos;
}

// =====================================
// PROVEEDOR DE AUTENTICACIÓN
// =====================================

export function AuthProvider({ children }) {

    // =====================================
    // ESTADOS
    // =====================================

    const [sesion, setSesion] =
        useState(null);

    const [cargando, setCargando] =
        useState(true);

    const [cambiandoAeropuerto, setCambiandoAeropuerto] =
        useState(false);

    const [cerrandoSesion, setCerrandoSesion] =
        useState(false);

    // =====================================
    // REFERENCIAS
    // =====================================

    const sesionRef = useRef(null);

    const versionSesion = useRef(0);

    const inicioEnCurso = useRef(false);

    const cambioEnCurso = useRef(false);

    const cierreEnCurso = useRef(false);

    // =====================================
    // GUARDAR SESIÓN
    // =====================================

    const guardarSesion = useCallback((datos) => {

        validarSesion(datos);

        sessionStorage.setItem(
            "sesion",
            JSON.stringify(datos)
        );

        sesionRef.current = datos;

        setSesion(datos);

    }, []);

    // =====================================
    // LIMPIAR SESIÓN LOCAL
    // =====================================

    const limpiarSesionLocal = useCallback(() => {

        versionSesion.current += 1;

        inicioEnCurso.current = false;

        cambioEnCurso.current = false;

        sesionRef.current = null;

        sessionStorage.removeItem("sesion");

        sessionStorage.removeItem("ultimaRuta");

        sessionStorage.removeItem("ga_token");

        setSesion(null);

        setCargando(false);

        setCambiandoAeropuerto(false);

    }, []);

    // =====================================
    // ESCUCHAR SESIONES INVÁLIDAS
    // =====================================

    useEffect(() => {

        function manejarSesionInvalida(evento) {

            const tokenInvalido =
                evento.detail?.token;

            const tokenActual =

                sesionRef.current?.token ??

                obtenerSesionGuardada()?.token;

            if (
                !tokenInvalido ||
                tokenInvalido !== tokenActual
            ) {
                return;
            }

            // Durante un cambio de aeropuerto,
            // el token anterior puede estar revocado
            // mientras esperamos el nuevo.

            if (cambioEnCurso.current) {
                return;
            }

            limpiarSesionLocal();
        }

        window.addEventListener(

            EVENTO_SESION_INVALIDA,

            manejarSesionInvalida
        );

        return () => {

            window.removeEventListener(

                EVENTO_SESION_INVALIDA,

                manejarSesionInvalida
            );
        };

    }, [limpiarSesionLocal]);

    // =====================================
    // RECUPERAR SESIÓN AL RECARGAR
    // =====================================

    useEffect(() => {

        const versionActual =
            ++versionSesion.current;

        let vigente = true;

        function operacionVigente() {

            return (

                vigente &&

                versionActual ===
                    versionSesion.current

            );
        }

        async function verificarSesion() {

            try {

                const datos =
                    obtenerSesionGuardada();

                if (!datos) {

                    if (operacionVigente()) {
                        limpiarSesionLocal();
                    }

                    return;
                }

                validarSesion(datos);

                const usuarioVerificado =
                    await obtenerUsuario(
                        datos.token
                    );

                if (!operacionVigente()) {
                    return;
                }

                // Verificar identidad y rol.

                if (
                    usuarioVerificado?.id !==
                        datos.usuario.id ||

                    usuarioVerificado?.rol !==
                        datos.usuario.rol
                ) {

                    throw new Error(
                        "La identidad o el rol de la sesión no coincide."
                    );
                }

                // Verificar contexto operativo.

                const aeropuertoGuardado =
                    datos.aeropuertoActivo?.id ??
                    null;

                const aeropuertoVerificado =
                    usuarioVerificado.aeropuertoId ??
                    null;

                if (
                    aeropuertoGuardado !==
                    aeropuertoVerificado
                ) {

                    throw new Error(
                        "El contexto operativo ha cambiado."
                    );
                }

                const usuarioActualizado = {

                    ...datos.usuario,

                    ...usuarioVerificado,

                };

                const sesionVerificada = {

                    ...datos,

                    usuario: usuarioActualizado,

                    expiraEn:
                        usuarioVerificado.expiraEn,

                    accesoGlobal:
                        usuarioActualizado.rol ===
                        "ADMIN_GENERAL",

                    requiereSeleccionAeropuerto:

                        usuarioActualizado.rol ===
                            "ADMIN_AEROPUERTO" &&

                        aeropuertoVerificado === null,

                };

                guardarSesion(sesionVerificada);

            } catch {

                if (operacionVigente()) {

                    limpiarSesionLocal();
                }

            } finally {

                if (operacionVigente()) {

                    setCargando(false);
                }
            }
        }

        verificarSesion();

        return () => {

            vigente = false;

            if (
                versionSesion.current ===
                versionActual
            ) {

                versionSesion.current += 1;
            }
        };

    }, [
        guardarSesion,
        limpiarSesionLocal,
    ]);

    // =====================================
    // CONTROL DE EXPIRACIÓN AUTOMÁTICA
    // =====================================

    useEffect(() => {

        if (!sesion?.token || !sesion.expiraEn) {
            return;
        }

        const tokenActual = sesion.token;

        const expiracion =
            Date.parse(sesion.expiraEn);

        function verificarExpiracion() {

            if (
                sesionRef.current?.token !==
                tokenActual
            ) {
                return;
            }

            if (
                !Number.isFinite(expiracion) ||
                Date.now() >= expiracion
            ) {

                limpiarSesionLocal();
            }
        }

        const tiempoRestante = Math.max(
            0,
            expiracion - Date.now()
        );

        const temporizador = setTimeout(

            verificarExpiracion,

            tiempoRestante
        );

        window.addEventListener(
            "focus",
            verificarExpiracion
        );

        document.addEventListener(
            "visibilitychange",
            verificarExpiracion
        );

        return () => {

            clearTimeout(temporizador);

            window.removeEventListener(
                "focus",
                verificarExpiracion
            );

            document.removeEventListener(
                "visibilitychange",
                verificarExpiracion
            );
        };

    }, [
        sesion?.token,
        sesion?.expiraEn,
        limpiarSesionLocal,
    ]);

    // =====================================
    // INICIAR SESIÓN
    // =====================================

    async function iniciarSesion(correo, password) {

        if (
            inicioEnCurso.current ||
            cierreEnCurso.current ||
            cambioEnCurso.current ||
            sesionRef.current?.token
        ) {

            throw new Error(
                "Existe una sesión u operación de autenticación activa."
            );
        }

        limpiarSesionLocal();

        const versionActual =
            ++versionSesion.current;

        inicioEnCurso.current = true;

        try {

            const datos =
                await login(correo, password);

            if (
                versionActual !==
                versionSesion.current
            ) {

                if (datos?.token) {

                    await logout(datos.token)
                        .catch(() => {});
                }

                throw new Error(
                    "La autenticación fue cancelada."
                );
            }

            const nuevaSesion = {

                ...datos,

                accesoGlobal:
                    datos.usuario?.rol ===
                    "ADMIN_GENERAL",

            };

            try {

                guardarSesion(nuevaSesion);

            } catch (error) {

                if (datos?.token) {

                    await logout(datos.token)
                        .catch(() => {});
                }

                throw error;
            }

            return nuevaSesion;

        } finally {

            if (
                versionActual ===
                versionSesion.current
            ) {

                inicioEnCurso.current = false;
            }
        }
    }

    // =====================================
    // CAMBIAR AEROPUERTO
    // =====================================

    async function cambiarAeropuerto(aeropuertoId) {

        const sesionActual =
            sesionRef.current;

        if (!sesionActual?.token) {

            throw new Error(
                "No existe una sesión activa."
            );
        }

        if (
            sesionActual.usuario?.rol !==
            "ADMIN_AEROPUERTO"
        ) {

            throw new Error(
                "No tenés permisos para cambiar de aeropuerto."
            );
        }

        if (
            !["number", "string"].includes(
                typeof aeropuertoId
            ) ||

            !/^\d+$/.test(String(aeropuertoId))
        ) {

            throw new Error(
                "El identificador del aeropuerto no es válido."
            );
        }

        const id = Number(aeropuertoId);

        if (!idValido(id)) {

            throw new Error(
                "El identificador del aeropuerto no es válido."
            );
        }

        const aeropuertoAsignado =
            sesionActual.aeropuertos?.some(

                aeropuerto =>
                    aeropuerto.id === id

            );

        if (!aeropuertoAsignado) {

            throw new Error(
                "No tenés asignado este aeropuerto."
            );
        }

        if (
            cambioEnCurso.current ||
            cierreEnCurso.current ||
            inicioEnCurso.current
        ) {

            throw new Error(
                "Existe otra operación de autenticación en proceso."
            );
        }

        if (
            sesionActual.aeropuertoActivo?.id === id &&
            !sesionActual.requiereSeleccionAeropuerto
        ) {

            return sesionActual;
        }

        const versionActual =
            versionSesion.current;

        cambioEnCurso.current = true;

        setCambiandoAeropuerto(true);

        let datos = null;

        try {

            datos = await seleccionarAeropuerto(

                sesionActual.token,

                id
            );

            if (
                versionActual !==
                    versionSesion.current ||

                sesionRef.current?.token !==
                    sesionActual.token
            ) {

                throw new Error(
                    "La sesión cambió durante la operación."
                );
            }

            if (
                typeof datos?.token !== "string" ||

                !datos.token.trim() ||

                datos.token === sesionActual.token ||

                datos.aeropuertoActivo?.id !== id ||

                Date.parse(datos.expiraEn) !==
                    Date.parse(sesionActual.expiraEn)
            ) {

                throw new Error(
                    "El servidor no devolvió un contexto operativo válido."
                );
            }

            const nuevaSesion = {

                ...sesionActual,

                token: datos.token,

                expiraEn: datos.expiraEn,

                aeropuertoActivo:
                    datos.aeropuertoActivo,

                requiereSeleccionAeropuerto: false,

                accesoGlobal: false,

            };

            guardarSesion(nuevaSesion);

            return nuevaSesion;

        } catch (error) {

            // Si se emitió un nuevo token,
            // pero no pudo guardarse, revocarlo.

            if (
                datos?.token &&
                datos.token !== sesionActual.token
            ) {

                await logout(datos.token)
                    .catch(() => {});
            }

            if (
                versionActual ===
                    versionSesion.current &&

                sesionRef.current?.token ===
                    sesionActual.token
            ) {

                // Si falló la solicitud, comprobar
                // si el token anterior sigue activo.

                try {

                    await obtenerUsuario(
                        sesionActual.token
                    );

                    if (datos) {
                        limpiarSesionLocal();
                    }

                } catch {

                    if (
                        versionActual ===
                        versionSesion.current
                    ) {

                        limpiarSesionLocal();
                    }
                }
            }

            throw error;

        } finally {

            if (
                versionActual ===
                versionSesion.current
            ) {

                cambioEnCurso.current = false;

                setCambiandoAeropuerto(false);
            }
        }
    }

    // =====================================
    // CERRAR SESIÓN
    // =====================================

    async function cerrarSesion() {

        if (cierreEnCurso.current) {
            return;
        }

        const tokenActual =

            sesionRef.current?.token ??

            obtenerSesionGuardada()?.token;

        cierreEnCurso.current = true;

        setCerrandoSesion(true);

        // Cerrar el acceso local inmediatamente.

        limpiarSesionLocal();

        try {

            if (tokenActual) {

                await logout(tokenActual);
            }

            return {
                revocada: true,
            };

        } catch (error) {

            // Un 401 significa que el token
            // ya no permite autenticarse.

            if (error.status === 401) {

                return {
                    revocada: true,
                };
            }

            console.warn(
                "No fue posible confirmar la revocación de la sesión en el servidor."
            );

            return {
                revocada: false,
            };

        } finally {

            cierreEnCurso.current = false;

            setCerrandoSesion(false);
        }
    }

    // =====================================
    // PROVEEDOR
    // =====================================

    return (

        <AuthContext.Provider

            value={{

                sesion,

                usuario:
                    sesion?.usuario ?? null,

                token:
                    sesion?.token ?? null,

                rol:
                    sesion?.usuario?.rol ?? null,

                aeropuertos:
                    sesion?.aeropuertos ?? [],

                aeropuertoActivo:
                    sesion?.aeropuertoActivo ?? null,

                accesoGlobal:
                    sesion?.accesoGlobal ?? false,

                requiereSeleccionAeropuerto:
                    sesion?.requiereSeleccionAeropuerto ??
                    false,

                expiraEn:
                    sesion?.expiraEn ?? null,

                autenticado:
                    Boolean(sesion?.token),

                cargando,

                cambiandoAeropuerto,

                cerrandoSesion,

                iniciarSesion,

                cerrarSesion,

                cambiarAeropuerto,

            }}

        >

            {children}

        </AuthContext.Provider>
    );
}

// =====================================
// HOOK PERSONALIZADO
// =====================================

export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth debe utilizarse dentro de AuthProvider"
        );
    }

    return context;
}
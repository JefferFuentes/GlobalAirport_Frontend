const API_URL = import.meta.env.VITE_API_URL;

export const EVENTO_SESION_INVALIDA =
    "globalairport:sesion-invalida";

// =====================================
// OBTENER SESIÓN ALMACENADA
// =====================================

export function obtenerSesionGuardada() {

    try {

        const guardada =
            sessionStorage.getItem("sesion");

        return guardada
            ? JSON.parse(guardada)
            : null;

    } catch {

        return null;
    }
}

// =====================================
// OBTENER TOKEN
// =====================================

export function obtenerToken() {

    const sesion = obtenerSesionGuardada();

    return typeof sesion?.token === "string"
        ? sesion.token
        : null;
}

// =====================================
// ERROR PERSONALIZADO DE API
// =====================================

export class ApiError extends Error {

    constructor(mensaje, status, datos = null) {

        super(mensaje);

        this.name = "ApiError";
        this.status = status;
        this.datos = datos;
    }
}

// =====================================
// NOTIFICAR SESIÓN INVÁLIDA
// =====================================

function notificarSesionInvalida(token) {

    if (!token || obtenerToken() !== token) {
        return;
    }

    window.dispatchEvent(

        new CustomEvent(
            EVENTO_SESION_INVALIDA,
            {
                detail: { token },
            }
        )
    );
}

// =====================================
// SERVICIO GENERAL DE API
// =====================================

export async function api(
    endpoint,
    options = {}
) {

    const {

        autenticado = true,

        token: tokenExplicito,

        notificar401 = true,

        headers: headersPersonalizados,

        ...fetchOptions

    } = options;

    // =====================================
    // VALIDAR CONFIGURACIÓN
    // =====================================

    if (!API_URL) {

        throw new ApiError(
            "La URL de la API no está configurada.",
            500
        );
    }

    // =====================================
    // VALIDAR ENDPOINT
    // =====================================

    if (
        typeof endpoint !== "string" ||
        !endpoint.startsWith("/") ||
        endpoint.startsWith("//") ||
        endpoint.includes("\\")
    ) {

        throw new ApiError(
            "Endpoint inválido.",
            400
        );
    }

    // =====================================
    // OBTENER TOKEN DE LA SOLICITUD
    // =====================================

    const token = autenticado
        ? tokenExplicito ?? obtenerToken()
        : null;

    if (
        autenticado &&
        (
            typeof token !== "string" ||
            !token.trim()
        )
    ) {

        throw new ApiError(
            "No existe una sesión activa.",
            401
        );
    }

    // =====================================
    // CONFIGURAR ENCABEZADOS
    // =====================================

    const headers = new Headers(
        headersPersonalizados
    );

    headers.delete("Authorization");

    if (
        !headers.has("Content-Type") &&
        !(fetchOptions.body instanceof FormData)
    ) {

        headers.set(
            "Content-Type",
            "application/json"
        );
    }

    if (token) {

        headers.set(
            "Authorization",
            `Bearer ${token}`
        );
    }

    // =====================================
    // REALIZAR SOLICITUD
    // =====================================

    let respuesta;

    try {

        respuesta = await fetch(

            `${API_URL.replace(/\/+$/, "")}${endpoint}`,

            {
                ...fetchOptions,
                headers,
                redirect: "error",
            }
        );

    } catch (error) {

        if (error.name === "AbortError") {
            throw error;
        }

        throw new ApiError(
            "No fue posible establecer comunicación con el servidor.",
            0
        );
    }

    // =====================================
    // PROCESAR RESPUESTA
    // =====================================

    const texto = await respuesta.text();

    let datos = null;

    try {

        datos = texto
            ? JSON.parse(texto)
            : null;

    } catch {

        datos = texto;
    }

    // =====================================
    // SESIÓN INVÁLIDA
    // =====================================

    if (
        respuesta.status === 401 &&
        autenticado &&
        notificar401
    ) {

        notificarSesionInvalida(token);
    }

    // =====================================
    // MANEJAR ERRORES HTTP
    // =====================================

    if (!respuesta.ok) {

        const mensaje =

            datos?.mensaje ||

            datos?.message ||

            datos?.error ||

            `Error HTTP ${respuesta.status}`;

        throw new ApiError(

            typeof mensaje === "string"
                ? mensaje
                : `Error HTTP ${respuesta.status}`,

            respuesta.status,

            datos
        );
    }

    return datos;
}
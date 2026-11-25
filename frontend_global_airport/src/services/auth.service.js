const API_URL = import.meta.env.VITE_API_URL;

// Iniciar sesión
export async function login(correo, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            correo,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.mensaje || data.message || "Credenciales incorrectas"
        );
    }

    return data;
}

// Consultar usuario autenticado
export async function obtenerUsuario(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.mensaje || data.message || "Sesión inválida"
        );
    }

    return data;
}

// Seleccionar aeropuerto activo
export async function seleccionarAeropuerto(token, aeropuertoId) {
    const response = await fetch(
        `${API_URL}/auth/seleccionar-aeropuerto`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                aeropuertoId,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.mensaje || data.message || "Error al seleccionar aeropuerto"
        );
    }

    return data;
}
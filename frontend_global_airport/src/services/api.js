const API_URL = import.meta.env.VITE_API_URL;

export async function api(endpoint, options = {}) {
  const sesionGuardada = sessionStorage.getItem("sesion");

  const sesion = sesionGuardada
    ? JSON.parse(sesionGuardada)
    : null;

  const token = sesion?.token;

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const texto = await respuesta.text();
  let datos;

  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }

  if (!respuesta.ok) {
    throw new Error(
      datos?.mensaje ||
      datos?.message ||
      datos?.error ||
      `Error HTTP ${respuesta.status}`
    );
  }

  return datos;
}
import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import {
    login,
    obtenerUsuario,
    seleccionarAeropuerto,
} from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [sesion, setSesion] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Guardar la sesión
    function guardarSesion(datos) {
        sessionStorage.setItem(
            "sesion",
            JSON.stringify(datos)
        );

        setSesion(datos);
    }

    // Cerrar sesión
    function cerrarSesion() {
        sessionStorage.removeItem("sesion");
        sessionStorage.removeItem("ultimaRuta");
        setSesion(null);
    }

    // Recuperar y verificar la sesión
    useEffect(() => {
        async function verificarSesion() {
            try {
                const guardada = sessionStorage.getItem("sesion");

                if (!guardada) return;

                const datos = JSON.parse(guardada);

                const usuarioVerificado = await obtenerUsuario(
                    datos.token
                );

                guardarSesion({
                    ...datos,
                    usuario: {
                        ...datos.usuario,
                        ...usuarioVerificado,
                    },
                });
            } catch {
                cerrarSesion();
            } finally {
                setCargando(false);
            }
        }

        verificarSesion();
    }, []);

    // Iniciar sesión
    async function iniciarSesion(correo, password) {
        const datos = await login(correo, password);

        guardarSesion(datos);

        return datos;
    }

    // Seleccionar aeropuerto
    async function cambiarAeropuerto(aeropuertoId) {
        if (!sesion?.token) {
            throw new Error("No existe una sesión activa");
        }

        const datos = await seleccionarAeropuerto(
            sesion.token,
            aeropuertoId
        );

        const nuevaSesion = {
            ...sesion,
            token: datos.token,
            aeropuertoActivo: datos.aeropuertoActivo,
            requiereSeleccionAeropuerto: false,
        };

        guardarSesion(nuevaSesion);

        return nuevaSesion;
    }

    return (
        <AuthContext.Provider
            value={{
                sesion,
                usuario: sesion?.usuario ?? null,
                token: sesion?.token ?? null,
                rol: sesion?.usuario?.rol ?? null,
                aeropuertos: sesion?.aeropuertos ?? [],
                aeropuertoActivo: sesion?.aeropuertoActivo ?? null,
                accesoGlobal: sesion?.accesoGlobal ?? false,
                requiereSeleccionAeropuerto:
                    sesion?.requiereSeleccionAeropuerto ?? false,
                autenticado: Boolean(sesion?.token),
                cargando,
                iniciarSesion,
                cerrarSesion,
                cambiarAeropuerto,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth debe utilizarse dentro de AuthProvider"
        );
    }

    return context;
}
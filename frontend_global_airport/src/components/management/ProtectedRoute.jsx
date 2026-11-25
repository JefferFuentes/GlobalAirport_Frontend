import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { tienePermiso } from "../../config/permissions";

export default function ProtectedRoute({ modulo }) {
    const {
        autenticado,
        cargando,
        rol,
        requiereSeleccionAeropuerto,
        accesoGlobal,
        aeropuertoActivo,
    } = useAuth();

    // Esperar la verificación de la sesión
    if (cargando) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
            </div>
        );
    }

    // Verificar autenticación
    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }

    // Verificar selección de aeropuerto
    if (requiereSeleccionAeropuerto) {
        return <Navigate to="/seleccionar-aeropuerto" replace />;
    }

    // Verificar acceso global o aeropuerto activo
    if (!accesoGlobal && !aeropuertoActivo) {
        return <Navigate to="/login" replace />;
    }

    // Verificar permisos del módulo
    if (modulo && !tienePermiso(rol, modulo, "consultar")) {
        return <Navigate to="/Home" replace />;
    }

    return <Outlet />;
}
import { Navigate, Outlet } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { tienePermiso } from "../../config/permissions";

export default function ProtectedRoute({
    children,
    modulo,
    accion = "consultar",
}) {
    const {
        autenticado,
        cargando,
        rol,
        aeropuertoActivo,
        requiereSeleccionAeropuerto,
    } = useAuth();

    // =====================================
    // VERIFICAR CARGA DE SESIÓN
    // =====================================

    if (cargando) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">

                <LoaderCircle
                    size={38}
                    className="animate-spin text-sky-600"
                />

                <p className="text-sm font-medium text-slate-600">
                    Verificando sesión...
                </p>

            </div>
        );
    }

    // =====================================
    // VERIFICAR AUTENTICACIÓN
    // =====================================

    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }

    // =====================================
    // VERIFICAR ROL
    // =====================================

    const rolesValidos = [
        "ADMIN_GENERAL",
        "ADMIN_AEROPUERTO",
        "EMPLEADO",
    ];

    if (!rolesValidos.includes(rol)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">

                <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

                    <h1 className="text-xl font-bold text-red-600">
                        Acceso restringido
                    </h1>

                    <p className="mt-3 text-sm text-slate-600">
                        Tu cuenta no tiene un rol válido.
                        Contactá al administrador del sistema.
                    </p>

                </div>

            </div>
        );
    }

    // =====================================
    // VERIFICAR CONTEXTO OPERATIVO
    // =====================================

    const accesoGlobal = rol === "ADMIN_GENERAL";

    if (!accesoGlobal) {
        if (
            rol === "ADMIN_AEROPUERTO" &&
            (
                requiereSeleccionAeropuerto ||
                !aeropuertoActivo?.id
            )
        ) {
            return (
                <Navigate
                    to="/seleccionar-aeropuerto"
                    replace
                />
            );
        }

        if (!aeropuertoActivo?.id) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">

                    <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">

                        <h1 className="text-xl font-bold text-amber-700">
                            Sin aeropuerto asignado
                        </h1>

                        <p className="mt-3 text-sm text-slate-600">
                            No tenés un aeropuerto activo.
                            Contactá al administrador del sistema.
                        </p>

                    </div>

                </div>
            );
        }
    }

    // =====================================
    // VERIFICAR PERMISOS DEL MÓDULO
    // =====================================

    if (
        modulo &&
        !tienePermiso(rol, modulo, accion)
    ) {
        return <Navigate to="/home" replace />;
    }

    // =====================================
    // ACCESO AUTORIZADO
    // =====================================

    return children ?? <Outlet />;
}
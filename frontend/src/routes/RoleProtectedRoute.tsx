import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface RoleProtectedRouteProps {
    allowedRoles: string[];
}

const RoleProtectedRoute = ({
    allowedRoles,
}: RoleProtectedRouteProps) => {
    const {
        user,
        loading,
        isAuthenticated,
    } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (!allowedRoles.includes(user.role)) {
        if (user.role === "STUDENT") {
            return (
                <Navigate
                    to="/student/dashboard"
                    replace
                />
            );
        }

        if (user.role === "FACULTY") {
            return (
                <Navigate
                    to="/faculty/dashboard"
                    replace
                />
            );
        }

        if (
            user.role === "ADMIN" ||
            user.role === "INSTITUTION_ADMIN"
        ) {
            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <Outlet />;
};

export default RoleProtectedRoute;
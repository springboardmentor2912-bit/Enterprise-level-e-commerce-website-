import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { user } = useAuth();

    const location = useLocation();

    // ==========================================
    // CHECK AUTH CONTEXT
    // ==========================================

    const hasUser =
        user !== null &&
        user !== undefined;

    // ==========================================
    // CHECK LOCAL STORAGE
    // ==========================================

    const token =
        localStorage.getItem("token");

    const email =
        localStorage.getItem("email");

    const role =
        localStorage.getItem("role");

    const isLoggedIn =
        hasUser ||
        (
            token &&
            email &&
            role
        );

    // ==========================================
    // USER NOT LOGGED IN
    // ==========================================

    if (!isLoggedIn) {
        sessionStorage.setItem(
            "redirectAfterLogin",
            location.pathname
        );

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }

    // ==========================================
    // USER IS LOGGED IN
    // ==========================================

    return children;
}

export default ProtectedRoute;
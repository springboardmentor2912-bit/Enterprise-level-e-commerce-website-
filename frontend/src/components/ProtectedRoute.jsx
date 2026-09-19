import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");
    const location = useLocation();

    console.log("========== PROTECTED ROUTE ==========");
    console.log("Current path:", location.pathname);
    console.log("Token exists:", !!token);
    console.log("Token:", token ? "YES" : "NO");
    console.log("Role:", localStorage.getItem("role"));

    if (!token) {
        console.log("NO TOKEN → REDIRECTING TO LOGIN");
        return <Navigate to="/" replace />;
    }

    console.log("TOKEN EXISTS → ALLOWING PAGE");

    return children;
}

export default ProtectedRoute;
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}) {
  const { isAuthenticated, role } = useSelector(
    (state) => state.auth
  );

  console.log("Auth:", isAuthenticated);
  console.log("Role:", role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
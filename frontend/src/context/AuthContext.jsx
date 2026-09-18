import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function getStoredUser() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const userId = localStorage.getItem("userId");

  if (!token) {
    return null;
  }

  return {
    token,
    role: role || "",
    email: email || "",
    userId: userId || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = (loginResponse) => {
    /*
     * Support both possible backend response formats:
     *
     * 1. { token, role, email, userId }
     *
     * 2. { data: { token, role, email, userId } }
     */

    const responseData =
      loginResponse?.data || loginResponse;

    const token =
      responseData?.token ||
      responseData?.accessToken ||
      "";

    const role =
      responseData?.role ||
      "";

    const email =
      responseData?.email ||
      "";

    const userId =
      responseData?.userId ||
      responseData?.id ||
      "";

    if (token) {
      localStorage.setItem("token", token);
    }

    if (role) {
      localStorage.setItem("role", role);
    }

    if (email) {
      localStorage.setItem("email", email);
    }

    if (userId) {
      localStorage.setItem("userId", String(userId));
    }

    const loggedInUser = {
      token,
      role,
      email,
      userId,
    };

    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("vendorId");

    sessionStorage.removeItem("redirectAfterLogin");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
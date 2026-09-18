import { useState } from "react";
import api from "./services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Login successful:", response.data);

      // Save JWT token
      localStorage.setItem("token", response.data.token);

      alert("Login successful!");
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response) {
        alert(
          error.response.data?.message ||
            "Invalid email or password"
        );
      } else {
        alert("Cannot connect to backend");
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
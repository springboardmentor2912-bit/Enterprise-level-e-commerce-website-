import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App";
import theme from "./styles/theme";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>

        <ThemeProvider theme={theme}>

            <CssBaseline />

            <BrowserRouter>

                <AuthProvider>

                    <CartProvider>

                        <App />

                    </CartProvider>

                </AuthProvider>

            </BrowserRouter>

        </ThemeProvider>

    </React.StrictMode>
);

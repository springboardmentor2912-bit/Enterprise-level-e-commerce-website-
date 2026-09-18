import { useState, useEffect } from "react";

import Auth from "./components/Auth";
import AdminDashboard from "./components/AdminDashboard";
import VendorDashboard from "./components/VendorDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import WarehouseDashboard from "./components/WarehouseDashboard";


function App() {

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [showSplash, setShowSplash] = useState(true);


    // =========================================================
    // SPLASH SCREEN
    // =========================================================

    useEffect(() => {

        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 1400);

        return () => clearTimeout(timer);

    }, []);


    // =========================================================
    // LOGIN SUCCESS
    // =========================================================

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };


    // =========================================================
    // SPLASH SCREEN UI
    // =========================================================

    if (showSplash) {

        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                        "linear-gradient(135deg, #7e22ce, #db2777, #9333ea)",
                    backgroundSize: "200% 200%",
                    animation: "gradientMove 3s ease infinite",
                }}
            >

                <style>{`

                    @keyframes gradientMove {

                        0% {
                            background-position: 0% 50%;
                        }

                        50% {
                            background-position: 100% 50%;
                        }

                        100% {
                            background-position: 0% 50%;
                        }

                    }

                    @keyframes popIn {

                        from {
                            opacity: 0;
                            transform: scale(0.85);
                        }

                        to {
                            opacity: 1;
                            transform: scale(1);
                        }

                    }

                `}</style>


                <h1
                    style={{
                        fontSize: "clamp(48px, 10vw, 100px)",
                        fontWeight: 800,
                        color: "white",
                        letterSpacing: "-2px",
                        margin: 0,
                        textAlign: "center",
                        textShadow:
                            "0 4px 30px rgba(0,0,0,0.3)",
                        animation: "popIn 0.6s ease",
                    }}
                >
                    ShopStack
                </h1>

            </div>
        );
    }


    // =========================================================
    // NOT LOGGED IN
    // =========================================================

    if (!isLoggedIn) {

        return (
            <div className="app">

                <Auth
                    onLoginSuccess={handleLoginSuccess}
                />

            </div>
        );
    }


    // =========================================================
    // GET JWT TOKEN
    // =========================================================

    const token = localStorage.getItem("token");

    let role = null;


    // =========================================================
    // READ USER ROLE FROM JWT
    // =========================================================

    try {

        if (token) {

            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            role = payload.role;
        }

    } catch (error) {

        console.error(
            "Unable to read user role from token:",
            error
        );

    }


    console.log("Logged-in role:", role);


    // =========================================================
    // ADMINISTRATOR
    // =========================================================

    if (role === "ADMINISTRATOR") {

        return <AdminDashboard />;

    }


    // =========================================================
    // VENDOR
    // =========================================================

    if (role === "VENDOR") {

        return <VendorDashboard />;

    }


    // =========================================================
    // CUSTOMER
    // =========================================================

    if (role === "CUSTOMER") {

        return <CustomerDashboard />;

    }


    // =========================================================
    // WAREHOUSE STAFF
    // =========================================================

    if (role === "WAREHOUSE_STAFF") {

        return <WarehouseDashboard />;

    }


    // =========================================================
    // UNKNOWN ROLE
    // =========================================================

    return (

        <div>

            <h2>
                Unknown User Role
            </h2>

            <p>
                Please logout and login again.
            </p>


            <button
                onClick={() => {

                    localStorage.removeItem("token");

                    window.location.reload();

                }}
            >
                Logout
            </button>

        </div>

    );

}


export default App;
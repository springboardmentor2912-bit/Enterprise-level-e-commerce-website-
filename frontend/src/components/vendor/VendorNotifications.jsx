import { useEffect, useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import "./VendorNotifications.css";
import "./VendorNotificationsOverrides.css";

function VendorNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState("");

    async function loadNotifications() {
        const token = localStorage.getItem("token");
        if (!token) {
            setNotifications([]);
            return;
        }

        try {
            const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/vendor/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                setNotifications([]);
                setError("Unable to access vendor notifications. Please restart the backend and try again.");
                return;
            }
            if (!response.ok) throw new Error(`Unable to load notifications (${response.status})`);
            setError("");
            setNotifications(await response.json());
        } catch (requestError) {
            setError(requestError.message || "Unable to load vendor notifications.");
        }
    }

    useEffect(() => {
        loadNotifications();
        const token = localStorage.getItem("token");
        if (token) {
            fetch("https://shopstack-backend-gjv6.onrender.com/api/vendor/orders/read-all", {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        const timer = setInterval(loadNotifications, 5000);
        window.addEventListener("orderStatusUpdated", loadNotifications);
        return () => { clearInterval(timer); window.removeEventListener("orderStatusUpdated", loadNotifications); };
    }, []);

    async function markRead(notification) {
        if (notification.status !== "NEW") return;
        const token = localStorage.getItem("token");
        if (!token) return;

        await fetch(`https://shopstack-backend-gjv6.onrender.com/api/vendor/orders/${notification.id}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(items => items.map(item => item.id === notification.id ? { ...item, status: "READ" } : item));
    }

    return <div className="vendor-notifications-layout"><Sidebar /><main className="vendor-notifications-page"><p>ACCOUNT UPDATES</p><h1>Notifications</h1><span>New customer order alerts appear here.</span><section>{notifications.length === 0 ? <div className="vendor-notification-empty">No notifications yet.</div> : notifications.map(notification => <article className={notification.status === "NEW" ? "new-notification" : ""} key={notification.id} onClick={() => markRead(notification)}><span className="notification-icon">🔔</span><div><strong>{notification.status === "NEW" ? "New order received" : "Order notification"}</strong><p>{notification.customerName} placed an order.</p><small>{new Date(notification.placedAt).toLocaleString()}</small></div></article>)}</section></main></div>;
}

export default VendorNotifications;

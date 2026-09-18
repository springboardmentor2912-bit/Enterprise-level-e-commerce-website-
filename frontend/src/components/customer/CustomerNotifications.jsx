import { useEffect, useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
import "./CustomerNotifications.css";
import "./CustomerNotificationsOverrides.css";

function CustomerNotifications() {
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem("token");
        const load = () => {
            if (!token) {
                setNotifications([]);
                return Promise.resolve([]);
            }
            return fetch("https://shopstack-backend-gjv6.onrender.com/api/customer/order-notifications", { headers: { Authorization: `Bearer ${token}` } }).then(response => {
                if (response.status === 401 || response.status === 403) {
                    setNotifications([]);
                    return [];
                }
                return response.ok ? response.json() : [];
            }).then(setNotifications).catch(() => setNotifications([]));
        };

        load();
        if (token) {
            fetch("https://shopstack-backend-gjv6.onrender.com/api/customer/order-notifications/read-all", {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        const timer = setInterval(load, 5000);
        return () => clearInterval(timer);
    }, []);
    const messages = { PROCESSING: "Your order is being processed.", SHIPPED: "Your order has been shipped.", OUT_FOR_DELIVERY: "Your order is out for delivery.", DELIVERED: "Your order has been delivered." };
    return <div className="customer-notifications-layout"><CustomerSidebar /><main className="customer-notifications-page"><p>ACCOUNT UPDATES</p><h1>Notifications</h1><span>Delivery updates from vendors appear here.</span><section>{notifications.length === 0 ? <div className="customer-notification-empty">No notifications yet.</div> : notifications.map(item => <article key={item.id}><div><strong>{item.productName}</strong><p>{messages[item.orderStatus] || "Your order status was updated."}</p><small>Order placed by {item.customerName}</small></div><b>{item.orderStatus?.replaceAll("_", " ")}</b></article>)}</section></main></div>;
}

export default CustomerNotifications;

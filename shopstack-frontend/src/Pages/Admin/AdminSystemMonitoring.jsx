import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminSystemMonitoring.css";

function AdminSystemMonitoring() {

    const [system, setSystem] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadSystem = async () => {

        try {

            const response =
                await api.get("/admin/system-monitoring");

            console.log(
                "SYSTEM MONITORING:",
                response.data
            );

            setSystem(response.data);

        } catch (error) {

            console.error(
                "System monitoring error:",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadSystem();

        const interval = setInterval(
            loadSystem,
            30000
        );

        return () => clearInterval(interval);

    }, []);


    const formatUptime = (seconds) => {

        const days =
            Math.floor(seconds / 86400);

        const hours =
            Math.floor((seconds % 86400) / 3600);

        const minutes =
            Math.floor((seconds % 3600) / 60);

        return `${days}d ${hours}h ${minutes}m`;
    };


    const formatMemory = (bytes) => {

        return (
            bytes / (1024 * 1024)
        ).toFixed(0) + " MB";
    };


    if (loading) {

        return (
            <AdminLayout>

                <div className="system-loading">
                    Loading system monitoring...
                </div>

            </AdminLayout>
        );
    }


    if (!system) {

        return (
            <AdminLayout>

                <div className="system-error">
                    Unable to load system information.
                </div>

            </AdminLayout>
        );
    }


    const memoryPercentage =
        system.memoryMax > 0
            ? Math.round(
                (system.memoryUsed /
                    system.memoryMax) * 100
            )
            : 0;


    return (

        <AdminLayout>

            <div className="system-page">

                {/* HEADER */}

                <div className="system-header">

                    <div>

                        <span>
                            INFRASTRUCTURE
                        </span>

                        <h1>
                            System Monitoring
                        </h1>

                        <p>
                            Monitor ShopStack application
                            and infrastructure health.
                        </p>

                    </div>

                    <div className="system-status">

                        <span></span>

                        SYSTEM OPERATIONAL

                    </div>

                </div>


                {/* STATUS CARDS */}

                <div className="system-grid">

                    <div className="system-card">

                        <span>
                            APPLICATION
                        </span>

                        <strong>
                            {system.status}
                        </strong>

                        <p>
                            {system.application}
                        </p>

                    </div>


                    <div className="system-card">

                        <span>
                            DATABASE
                        </span>

                        <strong>
                            {system.database}
                        </strong>

                        <p>
                            PostgreSQL
                        </p>

                    </div>


                    <div className="system-card">

                        <span>
                            ENVIRONMENT
                        </span>

                        <strong>
                            {system.environment}
                        </strong>

                        <p>
                            Current runtime environment
                        </p>

                    </div>


                    <div className="system-card">

                        <span>
                            UPTIME
                        </span>

                        <strong>
                            {formatUptime(
                                system.uptimeSeconds
                            )}
                        </strong>

                        <p>
                            Application runtime
                        </p>

                    </div>

                </div>


                {/* RESOURCE MONITORING */}

                <div className="resource-panel">

                    <div className="panel-heading">

                        <div>

                            <span>
                                RESOURCE UTILIZATION
                            </span>

                            <h2>
                                JVM Memory
                            </h2>

                        </div>

                        <strong>
                            {memoryPercentage}%
                        </strong>

                    </div>


                    <div className="memory-track">

                        <div
                            className="memory-fill"
                            style={{
                                width:
                                    `${memoryPercentage}%`
                            }}
                        />

                    </div>


                    <div className="memory-details">

                        <span>
                            Used
                            <strong>
                                {formatMemory(
                                    system.memoryUsed
                                )}
                            </strong>
                        </span>

                        <span>
                            Maximum
                            <strong>
                                {formatMemory(
                                    system.memoryMax
                                )}
                            </strong>
                        </span>

                    </div>

                </div>


                {/* SERVICE STATUS */}

                <div className="service-panel">

                    <div className="panel-heading">

                        <div>

                            <span>
                                SERVICE HEALTH
                            </span>

                            <h2>
                                Application Services
                            </h2>

                        </div>

                    </div>


                    <div className="service-row">

                        <div>

                            <strong>
                                ShopStack API
                            </strong>

                            <span>
                                Spring Boot REST services
                            </span>

                        </div>

                        <b>
                            Operational
                        </b>

                    </div>


                    <div className="service-row">

                        <div>

                            <strong>
                                PostgreSQL Database
                            </strong>

                            <span>
                                Primary application database
                            </span>

                        </div>

                        <b>
                            Operational
                        </b>

                    </div>


                    <div className="service-row">

                        <div>

                            <strong>
                                Admin API
                            </strong>

                            <span>
                                Administrative services
                            </span>

                        </div>

                        <b>
                            Operational
                        </b>

                    </div>

                </div>


                <div className="system-footer">

                    Last checked:
                    {" "}
                    {system.timestamp}

                    <button onClick={loadSystem}>
                        Refresh
                    </button>

                </div>

            </div>

        </AdminLayout>
    );
}

export default AdminSystemMonitoring;
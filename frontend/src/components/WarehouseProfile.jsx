import "./WarehouseProfile.css";

function WarehouseProfile({ onLogout }) {

    const token = localStorage.getItem("token");

    let email = "Warehouse Staff";
    let role = "WAREHOUSE_STAFF";

    try {

        if (token) {

            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            email = payload.sub || payload.email || "Warehouse Staff";
            role = payload.role || "WAREHOUSE_STAFF";
        }

    } catch (error) {

        console.error("Unable to read profile:", error);

    }

    return (

        <div className="warehouse-profile-page">

            <div className="warehouse-profile-card">

                <div className="warehouse-profile-avatar">
                    👤
                </div>

                <h1>
                    Warehouse Staff Profile
                </h1>

                <p className="warehouse-profile-subtitle">
                    Staff account information
                </p>


                <div className="warehouse-profile-info">

                    <div className="profile-info-item">

                        <span>
                            Email
                        </span>

                        <strong>
                            {email}
                        </strong>

                    </div>


                    <div className="profile-info-item">

                        <span>
                            Role
                        </span>

                        <strong>
                            {role}
                        </strong>

                    </div>


                    <div className="profile-info-item">

                        <span>
                            Account Status
                        </span>

                        <strong className="active-status">
                            Active
                        </strong>

                    </div>

                </div>


                <button
                    className="warehouse-logout-btn"
                    onClick={onLogout}
                >
                    🚪 Logout
                </button>

            </div>

        </div>

    );

}

export default WarehouseProfile;
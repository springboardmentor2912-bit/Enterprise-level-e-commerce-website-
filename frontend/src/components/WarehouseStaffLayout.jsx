import React from "react";
import { Outlet } from "react-router-dom";
import WarehouseStaffNavbar from "./WarehouseStaffNavbar";

const WarehouseStaffLayout = () => {
  return (
    <div className="warehouse-staff-layout">
      <WarehouseStaffNavbar />

      <main className="warehouse-staff-main">
        <Outlet />
      </main>
    </div>
  );
};

export default WarehouseStaffLayout;

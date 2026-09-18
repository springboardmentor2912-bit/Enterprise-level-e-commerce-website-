import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar />

      {/* 🆕 FIXED: ml-0 on mobile, ml-64 ONLY on large screens */}
      <main className="ml-0 min-h-screen lg:ml-64">
        {/* Responsive page padding */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
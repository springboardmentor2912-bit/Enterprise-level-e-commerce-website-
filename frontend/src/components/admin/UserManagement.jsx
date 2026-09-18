import AdminSidebar from "./AdminSidebar";

export default function UserManagement() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 p-8">
        {/* page content */}
      </div>
    </div>
  );
}
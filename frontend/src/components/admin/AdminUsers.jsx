import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaUsers, FaUserShield, FaStore } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

const roleLabels = { CUSTOMER: "Customer", VENDOR: "Vendor", ADMIN: "Admin" };

function getUserName(user) { return user.displayName || user.username || user.name || "Unnamed user"; }
function getInitials(name) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?"; }

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => { if (!res.ok) throw new Error(await res.text()); return res.json(); })
      .then(setUsers)
      .catch((err) => setError(err.message || "Unable to load users"))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    total: users.length,
    customers: users.filter((user) => user.role === "CUSTOMER").length,
    vendors: users.filter((user) => user.role === "VENDOR").length,
    admins: users.filter((user) => user.role === "ADMIN").length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users.filter((user) => {
      const searchableName = [user.displayName, user.username, user.name].filter(Boolean).join(" ").toLowerCase();
      return (!search || searchableName.includes(search)) && (roleFilter === "ALL" || user.role === roleFilter);
    });
  }, [users, query, roleFilter]);

  return <div className="admin-dashboard-container">
    <AdminSidebar />
    <main className="admin-main admin-users-main">
      <div className="users-page-heading"><div><span className="users-eyebrow">PEOPLE DIRECTORY</span><h1>Users</h1><p>Manage customers, vendors, and administrator access.</p></div><div className="users-heading-icon"><FaUsers /></div></div>
      <div className="users-metrics">
        <div><span className="users-metric-icon blue"><FaUsers /></span><div><strong>{counts.total}</strong><small>Total users</small></div></div>
        <div><span className="users-metric-icon green"><FaUsers /></span><div><strong>{counts.customers}</strong><small>Customers</small></div></div>
        <div><span className="users-metric-icon purple"><FaStore /></span><div><strong>{counts.vendors}</strong><small>Vendors</small></div></div>
        <div><span className="users-metric-icon amber"><FaUserShield /></span><div><strong>{counts.admins}</strong><small>Admins</small></div></div>
      </div>
      <section className="users-panel">
        <div className="users-toolbar"><div><h2>All users</h2><span>{filteredUsers.length} {filteredUsers.length === 1 ? "result" : "results"}</span></div><div className="users-controls"><label className="users-search"><FaSearch /><input aria-label="Search users by name" placeholder="Search by name" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filter by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="ALL">All roles</option><option value="CUSTOMER">Customers</option><option value="VENDOR">Vendors</option><option value="ADMIN">Admins</option></select></div></div>
        {loading && <div className="users-empty"><div className="orders-spinner" /><span>Loading users...</span></div>}
        {error && <div className="users-empty users-error"><strong>Couldn’t load users</strong><span>{error}</span></div>}
        {!loading && !error && filteredUsers.length === 0 && <div className="users-empty"><FaUsers /><strong>No users found</strong><span>Try changing your search or role filter.</span></div>}
        {!loading && !error && filteredUsers.length > 0 && <div className="users-table-wrap"><table className="users-table"><thead><tr><th>User</th><th>Contact</th><th>Role</th><th className="users-id-heading">ID</th></tr></thead><tbody>{filteredUsers.map((user) => { const name = getUserName(user); const role = user.role || "UNKNOWN"; return <tr key={user.id}><td><div className="user-cell"><span className={`user-avatar avatar-${role.toLowerCase()}`}>{getInitials(name)}</span><div><strong>{name}</strong><small>Joined member</small></div></div></td><td><span className="user-email">{user.email || "No email available"}</span>{user.phone && <small className="user-phone">{user.phone}</small>}</td><td><span className={`user-role role-${role.toLowerCase()}`}>{roleLabels[role] || role}</span></td><td className="user-id">#{user.id}</td></tr>; })}</tbody></table></div>}
      </section>
    </main>
  </div>;
}

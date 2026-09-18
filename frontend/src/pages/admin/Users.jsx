import { useEffect, useState } from "react";
import api from "../../api/axios"; // 🆕 Use configured api instance (handles JWT & base URL)
import { getUsers, enableUser, disableUser } from "../../api/adminApi";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadUsers(); 
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable(id) {
    try { 
      await enableUser(id); 
      loadUsers(); 
    } catch (err) { 
      console.error(err); 
      alert("Failed to enable user");
    }
  }

  async function handleDisable(id) {
    try { 
      await disableUser(id); 
      loadUsers(); 
    } catch (err) { 
      console.error(err); 
      alert("Failed to disable user");
    }
  }

  const roleMeta = {
    ADMIN: { badge: "bg-violet-50 text-violet-700 ring-violet-600/15", dot: "bg-violet-500", avatar: "bg-violet-100 text-violet-800" },
    VENDOR: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500", avatar: "bg-emerald-100 text-emerald-800" },
    CUSTOMER: { badge: "bg-sky-50 text-sky-700 ring-sky-600/15", dot: "bg-sky-500", avatar: "bg-sky-100 text-sky-800" },
    WAREHOUSE_STAFF: { badge: "bg-amber-50 text-amber-700 ring-amber-600/15", dot: "bg-amber-500", avatar: "bg-amber-100 text-amber-800" },
  };

  const enabledCount = users.filter((u) => u.enabled).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
          <div className="absolute inset-0 rounded-full border-4 border-sky-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-[14px] font-medium text-stone-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Manrope',sans-serif]">
      <style>{`
        @keyframes us-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .us-fade-up { animation: us-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="us-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">Platform</p>
          <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            User Management
          </h1>
          <p className="mt-1.5 text-[15px] text-stone-500">
            Control access and manage vendor commission rates across the marketplace.
          </p>
        </div>

        {users.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white px-4 py-2.5 shadow-sm">
            <span className="text-[12px] font-semibold text-stone-500">
              {enabledCount} / {users.length} active
            </span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        )}
      </div>

      {/* ===== USERS TABLE ===== */}
      <div
        className="us-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]"
        style={{ animationDelay: "100ms" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Commission</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {users.map((user) => {
                const role = roleMeta[user.role] || {
                  badge: "bg-stone-100 text-stone-700 ring-stone-600/10",
                  dot: "bg-stone-500",
                  avatar: "bg-stone-100 text-stone-700",
                };

                return (
                  <tr key={user.id} className="group transition-colors hover:bg-stone-50/60">
                    {/* User Column: Combines Avatar, Name, and ID for better density */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold ${role.avatar}`}>
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-stone-900">{user.name || "Unknown"}</p>
                          <p className="mt-0.5 text-[12px] text-stone-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Column: Combines Email and Phone */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{user.email}</p>
                      <p className="mt-0.5 text-[12px] text-stone-500 tabular-nums">{user.phone || "No phone"}</p>
                    </td>

                    {/* Role Column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${role.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${role.dot}`} />
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Commission Column */}
                    <td className="px-6 py-4">
                      {user.role === "VENDOR" ? (
                        <CommissionInput user={user} onUpdated={loadUsers} />
                      ) : (
                        <span className="text-[12px] text-stone-400">—</span>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      {user.enabled ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-600/15">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-rose-700 ring-1 ring-rose-600/15">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end">
                        {user.enabled ? (
                          <button
                            onClick={() => handleDisable(user.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-rose-700 transition-all hover:bg-rose-50 active:scale-[0.98]"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnable(user.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-emerald-800/20 transition-all hover:bg-emerald-800 active:scale-[0.98]"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Enable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </span>
                      <h3 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">No users found</h3>
                      <p className="mt-1.5 text-[14px] text-stone-500">
                        Registered users will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 🆕 POLISHED COMMISSION INPUT COMPONENT
function CommissionInput({ user, onUpdated }) {
  const [rate, setRate] = useState(user.commissionRate != null ? user.commissionRate : 10);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const originalRate = user.commissionRate != null ? user.commissionRate : 10;

  async function save() {
    setSaving(true);
    try {
      // 🆕 Uses the configured `api` instance (no hardcoded localhost, auto-attaches JWT)
      await api.put(`/admin/vendors/${user.id}/commission?rate=${rate}`);
      setDirty(false);
      onUpdated();
    } catch (e) {
      alert("Failed to update commission: " + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={rate}
          onChange={(e) => {
            setRate(e.target.value);
            setDirty(Number(e.target.value) !== Number(originalRate));
          }}
          className={`w-16 rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold tabular-nums outline-none transition-all focus:ring-2 ${
            dirty 
              ? "border-amber-300 bg-amber-50 text-amber-900 focus:border-amber-400 focus:ring-amber-400/20" 
              : "border-stone-200 bg-stone-50 text-stone-700 focus:border-sky-500 focus:ring-sky-500/20"
          }`}
        />
        <span className="pointer-events-none absolute right-2.5 text-[12px] font-semibold text-stone-400">%</span>
      </div>
      
      {dirty && (
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {saving ? (
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            "Save"
          )}
        </button>
      )}
    </div>
  );
}
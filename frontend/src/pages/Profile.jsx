import { useEffect, useState } from "react";
import { getProfile } from "../services/UserService";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Dynamic dashboard navigation based on user role
  const handleDashboardRedirect = () => {
    const role = (user?.role || localStorage.getItem("role") || "").toUpperCase();
    
    if (role === "VENDOR") {
      navigate("/vendor-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <h2 className="text-lg font-medium text-slate-500">Loading profile…</h2>
      </div>
    );
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white shadow-sm border border-stone-200 rounded-2xl p-8">
        
        {/* Profile Avatar & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
            {initials}
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            {user.fullName}
          </h1>
          <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mt-2">
            {user.role} Account
          </span>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Full Name
            </p>
            <p className="text-base font-semibold text-slate-900 mt-0.5">
              {user.fullName}
            </p>
          </div>

          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Email Address
            </p>
            <p className="text-base font-semibold text-slate-900 mt-0.5">
              {user.email}
            </p>
          </div>

          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Role
            </p>
            <p className="text-base font-semibold text-slate-900 mt-0.5 capitalize">
              {user.role?.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={handleDashboardRedirect}
            className="flex-1 border border-stone-300 text-slate-700 hover:bg-stone-100 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/editprofile")}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 border border-rose-200 text-rose-600 hover:bg-rose-50 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

export default Profile;
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api/customerApi";

export default function Profile() {
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const res = await getProfile();
      setUser(res.data);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await updateProfile(user);
      setUser(res.data);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent" style={{ animation: "spin 0.9s linear infinite" }} />
          </div>
          <p className="text-[14px] font-medium text-stone-500">Loading profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-['Manrope',sans-serif]">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Account</p>
          <h1 className="mt-2 font-['Fraunces',serif] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            My Profile
          </h1>
          <p className="mt-2 text-[15px] text-stone-500">
            Manage your personal information and contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Avatar sidebar */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 text-center shadow-[0_12px_32px_-12px_rgba(6,35,31,0.15)]">
              <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 font-['Fraunces',serif] text-3xl font-semibold text-white shadow-lg shadow-emerald-800/25">
                {(user.name || "?").charAt(0).toUpperCase()}
              </div>
              <p className="font-['Fraunces',serif] text-lg font-semibold text-stone-900 leading-tight">
                {user.name || "—"}
              </p>
              <p className="mt-0.5 text-[12px] text-stone-500 break-all">
                {user.email || "—"}
              </p>

              <div className="mt-5 border-t border-stone-200 pt-5 text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Member</p>
                <p className="mt-1 text-[13px] text-stone-700">Active customer</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.15)] sm:p-7"
            >
              <h2 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">
                Personal details
              </h2>
              <p className="mt-1 text-[13px] text-stone-500">Update your info below.</p>

              <div className="mt-6 space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </span>
                    <input
                      id="name"
                      type="text"
                      value={user.name || ""}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      required
                      className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-11 pr-4 text-[15px] text-stone-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                    Email Address
                    <span className="ml-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">Read-only</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-100/80 py-3 pl-11 pr-4 text-[15px] text-stone-500 outline-none"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.798-.368-1.661-.89-2.476-1.705a11.954 11.954 0 01-1.705-2.476l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </span>
                    <input
                      id="phone"
                      type="text"
                      value={user.phone || ""}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                      className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-11 pr-4 text-[15px] text-stone-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div
                    className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-medium ${
                      message.includes("success")
                        ? "border-emerald-600/20 bg-emerald-50 text-emerald-800"
                        : "border-rose-600/20 bg-rose-50 text-rose-800"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-4 w-4 shrink-0">
                      {message.includes("success") ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      )}
                    </svg>
                    <span>{message}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all duration-200 hover:bg-emerald-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
                >
                  {saving ? (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.9s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
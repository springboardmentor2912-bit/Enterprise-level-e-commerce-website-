import { useEffect, useState } from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaSave, FaShieldAlt, FaUser } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

const emptyProfile = { name: "", email: "", phone: "", address: "" };

export default function AdminProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("https://shopstack-backend-gjv6.onrender.com/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text() || "Unable to load profile.");
        return response.json();
      })
      .then((data) => setProfile({ name: data.name || "", email: data.email || "", phone: data.phone || "", address: data.address || "" }))
      .catch((requestError) => setError(requestError.message || "Unable to load profile."))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
    setSuccess("");
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ username: profile.name.trim(), phone: profile.phone.trim(), address: profile.address.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to save profile.");
      setProfile((current) => ({ ...current, name: data.name || current.name, phone: data.phone || "", address: data.address || "" }));
      localStorage.setItem("username", data.name || profile.name.trim());
      setSuccess("Profile changes saved successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials = (profile.name || "Admin").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar />
      <main className="admin-main admin-profile-main">
        <header className="admin-profile-heading">
          <div><span className="admin-profile-eyebrow">ACCOUNT SETTINGS</span><h1>Admin Profile</h1><p>Manage your administrator contact details and account information.</p></div>
          <div className="admin-profile-heading-icon"><FaShieldAlt /></div>
        </header>
        {loading && <div className="admin-loading">Loading profile...</div>}
        {!loading && <section className="admin-profile-layout">
          <aside className="admin-profile-summary">
            <div className="admin-profile-avatar">{initials || "A"}</div>
            <h2>{profile.name || "Admin User"}</h2>
            <p>{profile.email || "No email available"}</p>
            <span><FaShieldAlt /> Administrator account</span>
            <small>Your email and administrator role cannot be changed here.</small>
          </aside>
          <form className="admin-profile-form" onSubmit={saveProfile}>
            <div className="admin-profile-form-heading"><div><span className="admin-profile-eyebrow">PERSONAL DETAILS</span><h2>Profile information</h2></div><FaUser /></div>
            {error && <div className="admin-profile-message error">{error}</div>}
            {success && <div className="admin-profile-message success">{success}</div>}
            <div className="admin-profile-fields">
              <label><span><FaUser /> Full name</span><input name="name" value={profile.name} onChange={handleChange} required /></label>
              <label><span><FaEnvelope /> Email address</span><input value={profile.email} readOnly disabled /></label>
              <label><span><FaPhone /> Phone number</span><input name="phone" value={profile.phone} onChange={handleChange} placeholder="Enter phone number" /></label>
              <label><span><FaShieldAlt /> Role</span><input value="Administrator" readOnly disabled /></label>
              <label className="admin-profile-full-field"><span><FaMapMarkerAlt /> Address</span><textarea name="address" value={profile.address} onChange={handleChange} rows="4" placeholder="Enter your address" /></label>
            </div>
            <div className="admin-profile-actions"><button type="submit" disabled={saving}><FaSave /> {saving ? "Saving..." : "Save changes"}</button></div>
          </form>
        </section>}
      </main>
    </div>
  );
}

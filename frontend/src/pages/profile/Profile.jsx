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

  if (loading) return <div className="p-10 text-center text-xl">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            value={user.name || ""} 
            onChange={(e) => setUser({...user, name: e.target.value})}
            className="w-full border p-3 rounded" 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            value={user.email || ""} 
            disabled 
            className="w-full border p-3 rounded bg-gray-100 text-gray-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input 
            type="text" 
            value={user.phone || ""} 
            onChange={(e) => setUser({...user, phone: e.target.value})}
            className="w-full border p-3 rounded" 
          />
        </div>

        {message && (
          <p className={`text-sm font-medium ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/UserService";
import { useNavigate } from "react-router-dom";

function EditProfile() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: ""
  });

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const response = await getProfile();

        setFormData({
          fullName: response.data.fullName,
          email: response.data.email,
          password: "",
          role: response.data.role
        });

      } catch (error) {
        console.error(error);
      }

    };

    loadProfile();

  }, []);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // Role is intentionally not sent here — the backend no longer
      // allows a user to change their own role from this endpoint.
      await updateProfile({
        fullName: formData.fullName,
        password: formData.password
      });

      navigate("/profile");

    } catch (error) {

      console.error(error);
      alert("Update failed!");

    }

  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-stone-100 p-8">

        <h1 className="text-3xl font-serif font-bold text-center text-slate-900 mb-6">
          Edit Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full border border-stone-200 bg-stone-100 text-slate-500 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              New Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Role
            </label>

            <input
              type="text"
              value={formData.role}
              disabled
              className="w-full border border-stone-200 bg-stone-100 text-slate-500 rounded-lg px-4 py-3 capitalize"
            />
            <p className="text-xs text-slate-400 mt-2">
              Contact an administrator to change account roles.
            </p>
          </div>

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 border border-stone-300 text-slate-700 hover:bg-stone-100 py-3 rounded-lg font-medium transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-semibold transition shadow-sm"
            >
              Save Changes
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditProfile;

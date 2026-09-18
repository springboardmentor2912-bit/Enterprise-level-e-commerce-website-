import { useEffect, useState } from "react";
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from "../../api/customerApi";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    defaultAddress: false,
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await getAddresses();
      setAddresses(res.data || []);
    } catch (e) {
      console.error("Failed to load addresses:", e);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAddress(editingId, formData);
      } else {
        await addAddress(formData);
      }
      await load();
      resetForm();
    } catch (e) {
      alert("Failed to save address: " + (e.response?.data?.message || e.message));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      await load();
    } catch (e) {
      alert("Failed to delete address");
    }
  }

  async function handleSetDefault(id) {
    try {
      await setDefaultAddress(id);
      await load();
    } catch (e) {
      alert("Failed to set default");
    }
  }

  function handleEdit(addr) {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      defaultAddress: addr.defaultAddress,
    });
    setEditingId(addr.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      fullName: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      defaultAddress: false,
    });
    setEditingId(null);
    setShowForm(false);
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-white text-stone-500">Loading addresses...</div>;
  }

  return (
    // 🆕 Added min-h-screen and bg-white for consistency
    <div className="min-h-screen bg-white font-['Manrope',sans-serif]">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Account</p>
            <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold text-stone-900">My Addresses</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-emerald-800 px-4 py-2 text-[14px] font-semibold text-white hover:bg-emerald-900"
          >
            + Add Address
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="rounded-lg border border-stone-300 px-3 py-2"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="rounded-lg border border-stone-300 px-3 py-2"
              />
              <input
                name="addressLine"
                value={formData.addressLine}
                onChange={handleChange}
                placeholder="Address Line (House No, Street, Area)"
                required
                className="col-span-full rounded-lg border border-stone-300 px-3 py-2"
              />
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
                className="rounded-lg border border-stone-300 px-3 py-2"
              />
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
                className="rounded-lg border border-stone-300 px-3 py-2"
              />
              <input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                required
                className="rounded-lg border border-stone-300 px-3 py-2"
              />
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                required
                className="rounded-lg border border-stone-300 px-3 py-2"
              />
              <label className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  name="defaultAddress"
                  checked={formData.defaultAddress}
                  onChange={handleChange}
                />
                <span className="text-sm text-stone-700">Set as default address</span>
              </label>
              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-800 px-6 py-2 text-[14px] font-semibold text-white hover:bg-emerald-900"
                >
                  {editingId ? "Update" : "Save"} Address
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-stone-300 px-6 py-2 text-[14px] font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900">{addr.fullName}</h3>
                  <p className="text-sm text-stone-600">{addr.phone}</p>
                </div>
                {addr.defaultAddress && (
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold uppercase text-emerald-700 ring-1 ring-emerald-600/15">
                    Default
                  </span>
                )}
              </div>
              <p className="text-[14px] text-stone-700">{addr.addressLine}</p>
              <p className="text-[14px] text-stone-700">
                {addr.city}, {addr.state} {addr.postalCode}
              </p>
              <p className="text-[14px] text-stone-700">{addr.country}</p>
              <div className="mt-4 flex gap-2">
                {!addr.defaultAddress && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="rounded border border-stone-300 px-3 py-1 text-[12px] font-medium text-stone-700 hover:bg-stone-50"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleEdit(addr)}
                  className="rounded border border-stone-300 px-3 py-1 text-[12px] font-medium text-stone-700 hover:bg-stone-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="rounded border border-rose-300 px-3 py-1 text-[12px] font-medium text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {addresses.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center">
              <p className="text-stone-500">No addresses saved yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
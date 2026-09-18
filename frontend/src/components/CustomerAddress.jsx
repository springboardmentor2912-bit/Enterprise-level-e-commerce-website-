import { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerAddress.css";

function CustomerAddress() {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        addressLine: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phoneNumber: "",
    });

    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {
        setFormData({
            addressLine: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phoneNumber: "",
        });

        setEditingId(null);
        setShowForm(false);
    };

    // =========================================================
    // FETCH ADDRESSES
    // =========================================================

    const fetchAddresses = async () => {
        try {
            setError("");

            const response = await api.get("/customer/addresses");

            setAddresses(response.data || []);
        } catch (err) {
            console.error("Address fetch error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (err.response?.status >= 500) {
                setError(
                    "Server error. Please try again later."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your addresses."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD ADDRESSES
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadAddresses = async () => {
            try {
                const response = await api.get(
                    "/customer/addresses"
                );

                if (!cancelled) {
                    setAddresses(response.data || []);
                    setError("");
                }
            } catch (err) {
                console.error(
                    "Address fetch error:",
                    err
                );

                if (!cancelled) {
                    if (
                        err.response?.status === 401 ||
                        err.response?.status === 403
                    ) {
                        setError(
                            "Your session has expired. Please login again."
                        );
                    } else if (
                        err.response?.status >= 500
                    ) {
                        setError(
                            "Server error. Please try again later."
                        );
                    } else {
                        setError(
                            err.response?.data?.message ||
                            "Unable to load your addresses."
                        );
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(() => {
            loadAddresses();
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        if (!formData.addressLine.trim()) {
            return "Address is required.";
        }

        if (!formData.city.trim()) {
            return "City is required.";
        }

        if (!formData.state.trim()) {
            return "State is required.";
        }

        if (!formData.postalCode.trim()) {
            return "Postal code is required.";
        }

        if (!/^\d{5,6}$/.test(formData.postalCode.trim())) {
            return "Please enter a valid postal code.";
        }

        if (!formData.country.trim()) {
            return "Country is required.";
        }

        if (!formData.phoneNumber.trim()) {
            return "Phone number is required.";
        }

        if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
            return "Please enter a valid 10-digit phone number.";
        }

        return "";
    };

    // =========================================================
    // ADD / UPDATE ADDRESS
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccessMessage("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);

            if (editingId) {
                await api.put(
                    `/customer/addresses/${editingId}`,
                    formData
                );

                setSuccessMessage(
                    "Address updated successfully."
                );
            } else {
                await api.post(
                    "/customer/addresses",
                    formData
                );

                setSuccessMessage(
                    "Address added successfully."
                );
            }

            await fetchAddresses();

            resetForm();
        } catch (err) {
            console.error(
                "Address save error:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (
                err.response?.status >= 500
            ) {
                setError(
                    "Server error. Please try again later."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to save the address."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // EDIT ADDRESS
    // =========================================================

    const handleEdit = (address) => {
        setError("");
        setSuccessMessage("");

        setFormData({
            addressLine: address.addressLine || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || "",
            country: address.country || "",
            phoneNumber: address.phoneNumber || "",
        });

        setEditingId(address.id);
        setShowForm(true);
    };

    // =========================================================
    // ADD NEW ADDRESS
    // =========================================================

    const handleAddNew = () => {
        setError("");
        setSuccessMessage("");

        setFormData({
            addressLine: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phoneNumber: "",
        });

        setEditingId(null);
        setShowForm(true);
    };

    // =========================================================
    // DELETE ADDRESS
    // =========================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this address?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccessMessage("");

            await api.delete(
                `/customer/addresses/${id}`
            );

            setAddresses((previous) =>
                previous.filter(
                    (address) => address.id !== id
                )
            );

            setSuccessMessage(
                "Address deleted successfully."
            );
        } catch (err) {
            console.error(
                "Address delete error:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (
                err.response?.status >= 500
            ) {
                setError(
                    "Server error. Please try again later."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to delete the address."
                );
            }
        }
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="customer-address">

            <div className="address-header">

                <div>
                    <h2>My Addresses</h2>

                    <p>
                        Manage your delivery addresses
                    </p>
                </div>

                {!showForm && (
                    <button
                        type="button"
                        className="add-address-btn"
                        onClick={handleAddNew}
                    >
                        + Add Address
                    </button>
                )}

            </div>

            {/* ERROR */}

            {error && (
                <div className="address-error">
                    {error}
                </div>
            )}

            {/* SUCCESS */}

            {successMessage && (
                <div className="address-success">
                    {successMessage}
                </div>
            )}

            {/* FORM */}

            {showForm && (

                <div className="address-form-container">

                    <div className="address-form-header">

                        <h3>
                            {editingId
                                ? "Edit Address"
                                : "Add New Address"}
                        </h3>

                        <button
                            type="button"
                            className="close-form-btn"
                            onClick={resetForm}
                        >
                            ✕
                        </button>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">

                            <label>
                                Address
                            </label>

                            <input
                                type="text"
                                name="addressLine"
                                value={formData.addressLine}
                                onChange={handleChange}
                                placeholder="Enter your address"
                            />

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    State
                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Enter state"
                                />

                            </div>

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Postal Code
                                </label>

                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    placeholder="Enter postal code"
                                    maxLength="6"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Country
                                </label>

                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Enter country"
                                />

                            </div>

                        </div>

                        <div className="form-group">

                            <label>
                                Phone Number
                            </label>

                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter 10-digit phone number"
                                maxLength="10"
                            />

                        </div>

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-address-btn"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-address-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Address"
                                        : "Save Address"}
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {/* ADDRESS LIST */}

            {!showForm && (

                <div className="address-list">

                    {loading ? (

                        <div className="address-loading">
                            Loading addresses...
                        </div>

                    ) : addresses.length === 0 ? (

                        <div className="no-addresses">

                            <h3>
                                No addresses found
                            </h3>

                            <p>
                                Add a delivery address to
                                continue shopping.
                            </p>

                            <button
                                type="button"
                                className="add-address-btn"
                                onClick={handleAddNew}
                            >
                                + Add Your First Address
                            </button>

                        </div>

                    ) : (

                        addresses.map((address) => (

                            <div
                                className="address-card"
                                key={address.id}
                            >

                                <div className="address-card-content">

                                    <h3>
                                        {address.addressLine}
                                    </h3>

                                    <p>
                                        {address.city},{" "}
                                        {address.state}{" "}
                                        {address.postalCode}
                                    </p>

                                    <p>
                                        {address.country}
                                    </p>

                                    <p>
                                        📞{" "}
                                        {address.phoneNumber}
                                    </p>

                                </div>

                                <div className="address-card-actions">

                                    <button
                                        type="button"
                                        className="edit-address-btn"
                                        onClick={() =>
                                            handleEdit(address)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-address-btn"
                                        onClick={() =>
                                            handleDelete(
                                                address.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))

                    )}

                </div>
            )}

        </div>
    );
}

export default CustomerAddress;
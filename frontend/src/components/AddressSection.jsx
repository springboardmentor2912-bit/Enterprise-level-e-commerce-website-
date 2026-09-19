import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";


function AddressSection({ selectedAddress, setSelectedAddress }) {

    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        label: "Home",
        defaultAddress: false
    });

    const fetchAddresses = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/addresses`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAddresses(response.data);

            // Automatically select default address
            const defaultAddress = response.data.find(
                address => address.defaultAddress
            );

            if (defaultAddress) {
                setSelectedAddress(defaultAddress);
            } else if (
                response.data.length > 0 &&
                !selectedAddress
            ) {
                setSelectedAddress(response.data[0]);
            }

        } catch (error) {

            console.error(error);
            alert("Failed to load addresses");

        }
    };


    useEffect(() => {
        fetchAddresses();
    }, []);


    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };


    const resetForm = () => {

        setForm({
            fullName: "",
            phone: "",
            addressLine: "",
            city: "",
            state: "",
            pincode: "",
            label: "Home",
            defaultAddress: false
        });

        setEditingAddress(null);
        setShowForm(false);
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("token");

            let response;

            if (editingAddress) {

                response = await axios.put(
                    `${API_BASE_URL}/api/addresses/${editingAddress.id}`,
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            } else {

                response = await axios.post(
                    `${API_BASE_URL}/api/addresses`,
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }

            await fetchAddresses();

            setSelectedAddress(response.data);

            resetForm();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data ||
                "Failed to save address"
            );
        }
    };


    const handleEdit = (address) => {

        setEditingAddress(address);

        setForm({
            fullName: address.fullName,
            phone: address.phone,
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            label: address.label || "Home",
            defaultAddress: address.defaultAddress
        });

        setShowForm(true);
    };


    const handleDelete = async (id) => {

        if (!window.confirm("Delete this address?")) {
            return;
        }

        try {

            const token = localStorage.getItem("token");

            await axios.delete(
                `${API_BASE_URL}/api/addresses/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (selectedAddress?.id === id) {
                setSelectedAddress(null);
            }

            fetchAddresses();

        } catch (error) {

            console.error(error);

            alert("Failed to delete address");
        }
    };


    return (
        <div className="bg-white rounded-xl shadow-lg p-6">

            <div className="flex justify-between items-center mb-5">

                <h2 className="text-2xl font-bold">
                    Delivery Address
                </h2>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    + Add Address
                </button>

            </div>


            {/* SAVED ADDRESSES */}

            {addresses.length === 0 && !showForm && (

                <p className="text-gray-500">
                    No saved addresses. Please add an address.
                </p>

            )}


            <div className="space-y-4">

                {addresses.map((address) => (

                    <div
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer ${
                            selectedAddress?.id === address.id
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-300"
                        }`}
                        onClick={() =>
                            setSelectedAddress(address)
                        }
                    >

                        <div className="flex items-start gap-3">

                            <input
                                type="radio"
                                checked={
                                    selectedAddress?.id === address.id
                                }
                                onChange={() =>
                                    setSelectedAddress(address)
                                }
                            />

                            <div className="flex-1">

                                <div className="flex justify-between">

                                    <h3 className="font-bold">
                                        {address.label}
                                    </h3>

                                    {address.defaultAddress && (

                                        <span className="text-sm text-green-600 font-semibold">
                                            Default
                                        </span>

                                    )}

                                </div>

                                <p className="font-semibold mt-1">
                                    {address.fullName}
                                </p>

                                <p className="text-gray-600">
                                    {address.addressLine}
                                </p>

                                <p className="text-gray-600">
                                    {address.city}, {address.state}
                                </p>

                                <p className="text-gray-600">
                                    PIN: {address.pincode}
                                </p>

                                <p className="text-gray-600">
                                    Phone: {address.phone}
                                </p>


                                <div className="flex gap-3 mt-3">

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(address);
                                        }}
                                        className="text-blue-600 font-semibold"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(address.id);
                                        }}
                                        className="text-red-600 font-semibold"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                ))}

            </div>


            {/* ADD / EDIT FORM */}

            {showForm && (

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 border-t pt-6"
                >

                    <h3 className="text-xl font-bold mb-4">

                        {editingAddress
                            ? "Edit Address"
                            : "Add New Address"}

                    </h3>


                    <div className="grid md:grid-cols-2 gap-4">

                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                            className="border p-3 rounded-lg"
                        />

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            className="border p-3 rounded-lg"
                        />

                        <input
                            type="text"
                            name="addressLine"
                            placeholder="Address"
                            value={form.addressLine}
                            onChange={handleChange}
                            required
                            className="border p-3 rounded-lg md:col-span-2"
                        />

                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            required
                            className="border p-3 rounded-lg"
                        />

                        <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={form.state}
                            onChange={handleChange}
                            required
                            className="border p-3 rounded-lg"
                        />

                        <input
                            type="text"
                            name="pincode"
                            placeholder="Pincode"
                            value={form.pincode}
                            onChange={handleChange}
                            required
                            className="border p-3 rounded-lg"
                        />

                        <select
                            name="label"
                            value={form.label}
                            onChange={handleChange}
                            className="border p-3 rounded-lg"
                        >
                            <option value="Home">
                                Home
                            </option>

                            <option value="Work">
                                Work
                            </option>

                            <option value="College">
                                College
                            </option>

                            <option value="Other">
                                Other
                            </option>
                        </select>

                    </div>


                    <label className="flex items-center gap-2 mt-4">

                        <input
                            type="checkbox"
                            name="defaultAddress"
                            checked={form.defaultAddress}
                            onChange={handleChange}
                        />

                        Set as default address

                    </label>


                    <div className="flex gap-3 mt-5">

                        <button
                            type="submit"
                            className="bg-green-600 text-white px-5 py-2 rounded-lg"
                        >
                            {editingAddress
                                ? "Update Address"
                                : "Save Address"}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-gray-400 text-white px-5 py-2 rounded-lg"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            )}

        </div>
    );
}

export default AddressSection;
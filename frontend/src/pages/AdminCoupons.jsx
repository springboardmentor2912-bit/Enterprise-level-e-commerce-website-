import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

function AdminCoupons() {

    const [coupons, setCoupons] = useState([]);
    const [products, setProducts] = useState([]);
    const [analytics, setAnalytics] = useState([]);

    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [selectedVendor, setSelectedVendor] = useState("");

    const [form, setForm] = useState({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minimumOrderAmount: "",
        maximumDiscount: "",
        startDate: "",
        expiryDate: "",
        usageLimit: "",
        active: true
    });

    const [selectedProducts, setSelectedProducts] = useState([]);


    // =========================================================
    // FETCH COUPONS + PRODUCTS
    // =========================================================

    const fetchData = async () => {

        try {

            const token = localStorage.getItem("token");

            const headers = {
                Authorization: `Bearer ${token}`
            };


            const [couponResponse, productResponse] =
                await Promise.all([

                    axios.get(
                        `${API_BASE_URL}/api/coupons`,
                        { headers }
                    ),

                    axios.get(
                        `${API_BASE_URL}/api/products`,
                        { headers }
                    )

                ]);


            setCoupons(couponResponse.data);

            setProducts(productResponse.data);


        } catch (error) {

            console.error(
                "Error loading data:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to load coupon data"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchData();
        fetchAnalytics();

    }, []);


    // =========================================================
    // FETCH COUPON ANALYTICS
    // =========================================================

    const fetchAnalytics = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/admin/coupons/analytics`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAnalytics(response.data);

        } catch (error) {

            console.error(
                "Error loading coupon analytics:",
                error
            );

        } finally {

            setAnalyticsLoading(false);

        }
    };


    // =========================================================
    // ANALYTICS TOTALS (across all coupons)
    // =========================================================

    const totalUsageCount = analytics.reduce(
        (total, item) =>
            total + Number(item.usedCount || 0),
        0
    );

    const totalDiscountGiven = analytics.reduce(
        (total, item) =>
            total + Number(item.totalDiscount || 0),
        0
    );


    // =========================================================
    // GET UNIQUE VENDORS
    // =========================================================

    const vendors = Array.from(

        new Map(

            products
                .filter(
                    product =>
                        product.vendorId != null
                )
                .map(product => [

                    product.vendorId,

                    {
                        id: product.vendorId,
                        name: product.vendorName
                    }

                ])

        ).values()

    );


    // =========================================================
    // PRODUCTS FOR SELECTED VENDOR
    // =========================================================

    const vendorProducts =
        products.filter(

            product =>
                String(product.vendorId) ===
                String(selectedVendor)

        );


    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;


        setForm({

            ...form,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        });

    };


    // =========================================================
    // HANDLE VENDOR CHANGE
    // =========================================================

    const handleVendorChange = (e) => {

        const vendorId = e.target.value;

        setSelectedVendor(vendorId);

        // Clear previously selected products
        setSelectedProducts([]);

    };


    // =========================================================
    // HANDLE PRODUCT SELECTION
    // =========================================================

    const handleProductSelection = (productId) => {

        setSelectedProducts(prev => {

            if (prev.includes(productId)) {

                return prev.filter(
                    id => id !== productId
                );

            }

            return [
                ...prev,
                productId
            ];

        });

    };


    // =========================================================
    // CREATE COUPON
    // =========================================================

    const handleCreateCoupon = async (e) => {

        e.preventDefault();


        // -----------------------------------------------------
        // VALIDATE VENDOR
        // -----------------------------------------------------

        if (!selectedVendor) {

            alert(
                "Please select a vendor"
            );

            return;
        }


        // -----------------------------------------------------
        // VALIDATE PRODUCTS
        // -----------------------------------------------------

        if (selectedProducts.length === 0) {

            alert(
                "Please select at least one product"
            );

            return;
        }


        try {

            setCreating(true);


            const token =
                localStorage.getItem("token");


            // -------------------------------------------------
            // REQUEST
            // -------------------------------------------------

            const request = {

                code:
                    form.code
                        .trim()
                        .toUpperCase(),

                vendorId:
                    Number(selectedVendor),

                productIds:
                selectedProducts,

                discountType:
                form.discountType,

                discountValue:
                    Number(
                        form.discountValue
                    ),

                minimumOrderAmount:
                    form.minimumOrderAmount === ""
                        ? null
                        : Number(
                            form.minimumOrderAmount
                        ),

                maximumDiscount:
                    form.maximumDiscount === ""
                        ? null
                        : Number(
                            form.maximumDiscount
                        ),

                startDate:
                form.startDate,

                expiryDate:
                form.expiryDate,

                usageLimit:
                    form.usageLimit === ""
                        ? null
                        : Number(
                            form.usageLimit
                        ),

                active:
                form.active

            };


            console.log(
                "Creating coupon:",
                request
            );


            // -------------------------------------------------
            // API
            // -------------------------------------------------

            await axios.post(

                `${API_BASE_URL}/api/coupons`,

                request,

                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }

            );


            alert(
                "Coupon created successfully"
            );


            // -------------------------------------------------
            // RESET
            // -------------------------------------------------

            setForm({

                code: "",

                discountType:
                    "PERCENTAGE",

                discountValue: "",

                minimumOrderAmount: "",

                maximumDiscount: "",

                startDate: "",

                expiryDate: "",

                usageLimit: "",

                active: true

            });


            setSelectedVendor("");

            setSelectedProducts([]);


            // -------------------------------------------------
            // REFRESH
            // -------------------------------------------------

            await fetchData();


        } catch (error) {

            console.error(
                "Error creating coupon:",
                error
            );


            alert(

                error.response?.data?.message ||

                error.response?.data ||

                "Failed to create coupon"

            );

        } finally {

            setCreating(false);

        }

    };


// =========================================================
// ACTIVATE / DEACTIVATE COUPON
// =========================================================

    const handleToggleCoupon = async (couponId) => {

        try {

            const token = localStorage.getItem("token");

            await axios.put(
                `${API_BASE_URL}/api/coupons/${couponId}/toggle`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Coupon status updated successfully");

            await fetchData();

        } catch (error) {

            console.error(
                "Error toggling coupon:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to update coupon status"
            );
        }
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100">

                <div className="bg-blue-700 text-white py-8">

                    <div className="max-w-7xl mx-auto px-6">

                        <h1 className="text-4xl font-bold">

                            Coupon Management

                        </h1>

                        <p className="mt-2 text-blue-100">

                            Create and manage marketplace coupons

                        </p>

                    </div>

                </div>


                <div className="flex justify-center items-center h-80">

                    <p className="text-xl font-semibold">

                        Loading coupons...

                    </p>

                </div>

            </div>

        );

    }


    return (

        <div className="min-h-screen bg-gray-100">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="bg-blue-700 text-white py-8">

                <div className="max-w-7xl mx-auto px-6">

                    <h1 className="text-4xl font-bold">

                        Coupon Management

                    </h1>

                    <p className="mt-2 text-blue-100">

                        Create and manage marketplace coupons

                    </p>

                </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="max-w-7xl mx-auto px-6 py-10">


                {/* =================================================
                    CREATE COUPON
                ================================================= */}

                <div className="bg-white rounded-xl shadow-lg p-8 mb-10">

                    <h2 className="text-2xl font-bold mb-6">

                        Create Coupon

                    </h2>


                    <form
                        onSubmit={handleCreateCoupon}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >


                        {/* =================================================
                            VENDOR
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Select Vendor

                            </label>


                            <select

                                value={selectedVendor}

                                onChange={
                                    handleVendorChange
                                }

                                required

                                className="w-full border rounded-lg px-4 py-3"

                            >

                                <option value="">

                                    Select a vendor

                                </option>


                                {vendors.map(
                                    vendor => (

                                        <option
                                            key={vendor.id}
                                            value={vendor.id}
                                        >

                                            {vendor.name}

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* =================================================
                            PRODUCT
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Select Products

                            </label>


                            {!selectedVendor ? (

                                <p className="text-gray-500 border rounded-lg px-4 py-3">

                                    Select a vendor first

                                </p>

                            ) : vendorProducts.length === 0 ? (

                                <p className="text-red-500 border rounded-lg px-4 py-3">

                                    This vendor has no products

                                </p>

                            ) : (

                                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">

                                    {vendorProducts.map(
                                        product => (

                                            <label
                                                key={product.id}
                                                className="flex items-center gap-3 mb-3 cursor-pointer"
                                            >

                                                <input

                                                    type="checkbox"

                                                    checked={
                                                        selectedProducts.includes(
                                                            product.id
                                                        )
                                                    }

                                                    onChange={() =>
                                                        handleProductSelection(
                                                            product.id
                                                        )
                                                    }

                                                    className="w-5 h-5"

                                                />


                                                <span>

                                                    {product.name}

                                                    <span className="text-gray-500 ml-2">

                                                        ₹
                                                        {product.finalPrice ??
                                                            product.price}

                                                    </span>

                                                </span>

                                            </label>

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            CODE
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Coupon Code

                            </label>

                            <input

                                type="text"

                                name="code"

                                value={form.code}

                                onChange={handleChange}

                                placeholder="SAVE20"

                                required

                                className="w-full border rounded-lg px-4 py-3"

                            />

                        </div>


                        {/* =================================================
                            DISCOUNT TYPE
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Discount Type

                            </label>

                            <select

                                name="discountType"

                                value={
                                    form.discountType
                                }

                                onChange={
                                    handleChange
                                }

                                className="w-full border rounded-lg px-4 py-3"

                            >

                                <option value="PERCENTAGE">

                                    Percentage

                                </option>

                                <option value="FIXED">

                                    Fixed Amount

                                </option>

                            </select>

                        </div>


                        {/* =================================================
                            DISCOUNT VALUE
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Discount Value

                            </label>

                            <input

                                type="number"

                                name="discountValue"

                                value={
                                    form.discountValue
                                }

                                onChange={
                                    handleChange
                                }

                                placeholder="20"

                                min="0"

                                step="0.01"

                                required

                                className="w-full border rounded-lg px-4 py-3"

                            />

                        </div>


                        {/* =================================================
                            MINIMUM ORDER
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Minimum Order Amount

                            </label>

                            <input

                                type="number"

                                name="minimumOrderAmount"

                                value={
                                    form.minimumOrderAmount
                                }

                                onChange={
                                    handleChange
                                }

                                placeholder="1000"

                                min="0"

                                step="0.01"

                                className="w-full border rounded-lg px-4 py-3"

                            />

                        </div>


                        {/* =================================================
                            MAXIMUM DISCOUNT
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Maximum Discount

                            </label>

                            <input

                                type="number"

                                name="maximumDiscount"

                                value={
                                    form.maximumDiscount
                                }

                                onChange={
                                    handleChange
                                }

                                placeholder="500"

                                min="0"

                                step="0.01"

                                className="w-full border rounded-lg px-4 py-3"

                            />

                        </div>


                        {/* =================================================
                            START DATE
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Start Date

                            </label>

                            <input

                                type="datetime-local"

                                name="startDate"

                                value={
                                    form.startDate
                                }

                                onChange={
                                    handleChange
                                }

                                required

                                className="w-full border rounded-lg px-4 py-3"

                            />

                        </div>


                        {/* =================================================
                            EXPIRY DATE
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Expiry Date

                            </label>

                            <input

                                type="datetime-local"

                                name="expiryDate"

                                value={
                                    form.expiryDate
                                }

                                onChange={
                                    handleChange
                                }

                                required

                                className="w-full border rounded-lg px-4 py-3"

                            />

                        </div>


                        {/* =================================================
                            USAGE LIMIT
                        ================================================= */}

                        <div>

                            <label className="block text-sm font-semibold mb-2">

                                Usage Limit

                            </label>

                            <input

                                type="number"

                                name="usageLimit"

                                value={
                                    form.usageLimit
                                }

                                onChange={
                                    handleChange
                                }

                                placeholder="100"

                                min="0"

                                className="w-full border rounded-lg px-4 py-3"

                            />

                        </div>


                        {/* =================================================
                            ACTIVE
                        ================================================= */}

                        <div className="flex items-center">

                            <input

                                type="checkbox"

                                name="active"

                                checked={
                                    form.active
                                }

                                onChange={
                                    handleChange
                                }

                                className="w-5 h-5"

                            />

                            <label className="ml-3 font-semibold">

                                Active Coupon

                            </label>

                        </div>


                        {/* =================================================
                            BUTTON
                        ================================================= */}

                        <div className="md:col-span-2">

                            <button

                                type="submit"

                                disabled={
                                    creating
                                }

                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg disabled:opacity-50"

                            >

                                {creating

                                    ? "Creating..."

                                    : "Create Coupon"

                                }

                            </button>

                        </div>


                    </form>

                </div>


                {/* =================================================
                    COUPON ANALYTICS
                ================================================= */}

                <div className="mb-10">

                    <h2 className="text-3xl font-bold mb-1">

                        Coupon Analytics

                    </h2>

                    <p className="text-gray-500 mb-6">

                        Usage and discount performance across all coupons

                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-sm text-gray-500">

                                Total Times Used

                            </p>

                            <p className="text-3xl font-bold mt-1">

                                {totalUsageCount}

                            </p>

                        </div>

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-sm text-gray-500">

                                Total Discount Given

                            </p>

                            <p className="text-3xl font-bold mt-1">

                                ₹{totalDiscountGiven.toFixed(2)}

                            </p>

                        </div>

                    </div>

                    {analyticsLoading ? (

                        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">

                            Loading analytics...

                        </div>

                    ) : analytics.length === 0 ? (

                        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">

                            No coupon usage yet.

                        </div>

                    ) : (

                        <div className="bg-white rounded-xl shadow overflow-x-auto">

                            <table className="w-full text-left">

                                <thead>

                                <tr className="border-b bg-gray-50">

                                    <th className="px-6 py-3 text-sm font-semibold text-gray-500">
                                        Coupon Code
                                    </th>

                                    <th className="px-6 py-3 text-sm font-semibold text-gray-500">
                                        Used
                                    </th>

                                    <th className="px-6 py-3 text-sm font-semibold text-gray-500">
                                        Remaining
                                    </th>

                                    <th className="px-6 py-3 text-sm font-semibold text-gray-500">
                                        Total Discount
                                    </th>

                                    <th className="px-6 py-3 text-sm font-semibold text-gray-500">
                                        Status
                                    </th>

                                </tr>

                                </thead>

                                <tbody>

                                {analytics.map(item => (

                                    <tr
                                        key={item.couponId}
                                        className="border-b last:border-b-0"
                                    >

                                        <td className="px-6 py-3 font-semibold text-blue-600">
                                            {item.couponCode}
                                        </td>

                                        <td className="px-6 py-3">
                                            {item.usedCount} / {
                                            item.usageLimit != null
                                                ? item.usageLimit
                                                : "∞"
                                        }
                                        </td>

                                        <td className="px-6 py-3">
                                            {item.remainingUses != null
                                                ? item.remainingUses
                                                : "∞"
                                            }
                                        </td>

                                        <td className="px-6 py-3">
                                            ₹{Number(item.totalDiscount || 0).toFixed(2)}
                                        </td>

                                        <td className="px-6 py-3">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        item.active
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {item.active ? "ACTIVE" : "INACTIVE"}
                                                </span>

                                        </td>

                                    </tr>

                                ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* =================================================
                    COUPON LIST
                ================================================= */}

                <div className="flex justify-between items-center mb-6">

                    <div>

                        <h2 className="text-3xl font-bold">

                            All Coupons

                        </h2>

                        <p className="text-gray-500 mt-1">

                            Total Coupons: {
                            coupons.length
                        }

                        </p>

                    </div>

                </div>


                {coupons.length === 0 ? (

                    <div className="bg-white rounded-xl shadow p-10 text-center">

                        <h2 className="text-2xl font-bold">

                            No Coupons Found

                        </h2>

                        <p className="text-gray-500 mt-2">

                            Create your first coupon above.

                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {coupons.map(
                            coupon => (

                                <div
                                    key={coupon.id}
                                    className="bg-white rounded-xl shadow-lg p-6"
                                >


                                    <div className="flex justify-between items-start">

                                        <div>

                                            <h3 className="text-2xl font-bold text-blue-600">

                                                {coupon.code}

                                            </h3>

                                            <p className="text-sm text-gray-500">

                                                Coupon #{
                                                coupon.id
                                            }

                                            </p>

                                        </div>


                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                coupon.active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >

                                            {coupon.active
                                                ? "ACTIVE"
                                                : "INACTIVE"
                                            }

                                        </span>

                                    </div>


                                    {/* VENDOR */}

                                    <div className="mt-4">

                                        <p className="text-sm text-gray-500">

                                            Vendor

                                        </p>

                                        <p className="font-semibold">

                                            {coupon.vendorName ||
                                                "Unknown"}

                                        </p>

                                    </div>


                                    {/* STATUS */}

                                    <div className="mt-3">

                                        <p className="text-sm text-gray-500">

                                            Approval Status

                                        </p>

                                        <span
                                            className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                                                coupon.status ===
                                                "APPROVED"

                                                    ? "bg-green-100 text-green-700"

                                                    : coupon.status ===
                                                    "REJECTED"

                                                        ? "bg-red-100 text-red-700"

                                                        : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >

                                            {coupon.status}

                                        </span>

                                    </div>


                                    {/* DISCOUNT */}

                                    <div className="mt-6">

                                        <p className="text-sm text-gray-500">

                                            Discount

                                        </p>

                                        <p className="text-3xl font-bold">

                                            {coupon.discountType ===
                                            "PERCENTAGE"

                                                ? `${coupon.discountValue}%`

                                                : `₹${coupon.discountValue}`

                                            }

                                        </p>

                                    </div>


                                    {/* DETAILS */}

                                    <div className="mt-5 space-y-3">

                                        <div className="flex justify-between">

                                            <span className="text-gray-500">

                                                Minimum Order

                                            </span>

                                            <span className="font-semibold">

                                                {coupon.minimumOrderAmount !=
                                                null

                                                    ? `₹${coupon.minimumOrderAmount}`

                                                    : "None"

                                                }

                                            </span>

                                        </div>


                                        <div className="flex justify-between">

                                            <span className="text-gray-500">

                                                Max Discount

                                            </span>

                                            <span className="font-semibold">

                                                {coupon.maximumDiscount !=
                                                null

                                                    ? `₹${coupon.maximumDiscount}`

                                                    : "None"

                                                }

                                            </span>

                                        </div>


                                        <div className="flex justify-between">

                                            <span className="text-gray-500">

                                                Usage

                                            </span>

                                            <span className="font-semibold">

                                                {coupon.usedCount} / {

                                                coupon.usageLimit !=
                                                null

                                                    ? coupon.usageLimit

                                                    : "∞"

                                            }

                                            </span>

                                            {/* =================================================
    ACTIONS
================================================= */}

                                            <div className="mt-6 pt-5 border-t">

                                                {/* PENDING = awaiting vendor approval, nothing for admin to do here */}
                                                {coupon.status === "PENDING" && (

                                                    <p className="text-sm text-gray-500 italic mb-3">
                                                        Awaiting vendor approval
                                                    </p>

                                                )}


                                                {/* ACTIVATE / DEACTIVATE */}

                                                {coupon.status === "APPROVED" && (

                                                    <button
                                                        onClick={() =>
                                                            handleToggleCoupon(coupon.id)
                                                        }
                                                        className={`w-full font-semibold py-2 rounded-lg transition ${
                                                            coupon.active
                                                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                        }`}
                                                    >

                                                        {coupon.active
                                                            ? "Deactivate Coupon"
                                                            : "Activate Coupon"
                                                        }

                                                    </button>

                                                )}

                                            </div>

                                        </div>


                                        <div className="flex justify-between">

                                            <span className="text-gray-500">

                                                Start

                                            </span>

                                            <span className="font-semibold text-sm">

                                                {new Date(
                                                    coupon.startDate
                                                ).toLocaleString()}

                                            </span>

                                        </div>


                                        <div className="flex justify-between">

                                            <span className="text-gray-500">

                                                Expiry

                                            </span>

                                            <span className="font-semibold text-sm">

                                                {new Date(
                                                    coupon.expiryDate
                                                ).toLocaleString()}

                                            </span>

                                        </div>

                                    </div>


                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}

export default AdminCoupons;
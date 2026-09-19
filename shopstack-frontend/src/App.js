import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import RoleSelection from "./Pages/RoleSelection";
import VendorLogin from "./Pages/VendorLogin";
import VendorRegister from "./Pages/VendorRegister";
import Profile from "./Pages/Profile";
import VendorDashboard from "./Pages/Vendor/VendorDashboard";
import AddProduct from "./Pages/Vendor/AddProduct";
import VendorProductList from "./Pages/Vendor/VendorProductList";
import CustomerHome from "./components/customer/CustomerHome";
import CustomerCart from "./components/customer/CustomerCart";
import CustomerWishlist from "./components/customer/CustomerWishlist";
import CustomerProfile from "./components/customer/CustomerProfile";
import Checkout from "./components/customer/Checkout";
import CustomerOrders from "./components/customer/CustomerOrders";
import VendorInventory from "./Pages/Vendor/VendorInventory";
//import Profile from "./Pages/Profile";
import VendorProfile from "./Pages/Vendor/VendorProfile";
import OrderDetails from "./components/customer/OrderDetails";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminVendorManagement from "./Pages/Admin/AdminVendorManagement";
import AdminOrderMonitoring from "./Pages/Admin/AdminOrderMonitoring";
import AdminVendorDetails from "./Pages/Admin/AdminVendorDetails";
import AdminAnalytics from "./Pages/Admin/AdminAnalytics";
import AdminCommissions from "./Pages/Admin/AdminCommissions";
import AdminSystemMonitoring from "./Pages/Admin/AdminSystemMonitoring";
import AdminReports from "./Pages/Admin/AdminReports";
import AdminWarehouseManagement from "./Pages/Admin/AdminWarehouseManagement";
import AdminShipmentManagement from "./Pages/Admin/AdminShipmentManagement";
import AdminShipmentDetails from "./Pages/Admin/AdminShipmentDetails";
import CustomerOrderTracking from "./components/customer/CustomerOrderTracking";


function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route 
            path="/vendor/register" 
            element={<VendorRegister />} 
        />
        <Route path="/" element={<RoleSelection />} />
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/add-product" element={<AddProduct />} />
        <Route 
        path="/vendor/products" 
        element={<VendorProductList />} 
        />
        <Route
            path="/customer/home"
            element={<CustomerHome />}
        />
        <Route
            path="/customer/cart"
            element={<CustomerCart />}
        />
        <Route
            path="/customer/wishlist"
            element={<CustomerWishlist />}
        />
        {/* <Route
            path="/customer/profile"
            element={<CustomerProfile />}
        /> */}
        <Route path="/customer/profile" element={<CustomerProfile />} />

        <Route path="/vendor/profile" element={<VendorProfile />} />
        {/* <Route
            path="/customer/profile"
            element={<Profile />}
        /> */}
        <Route
            path="/customer/checkout"
            element={<Checkout />}
        />
        <Route
            path="/customer/orders"
            element={<CustomerOrders />}
        />

        {/* <Route
    path="/customer/orders"
    element={<CustomerOrders />}
/> */}
        <Route
            path="/vendor/inventory"
            element={<VendorInventory />}
        />
        {/* <Route
            path="/customer/profile"
            element={<Profile />}
        /> */}

        {/* <Route
            path="/vendor/profile"
            element={<Profile />}
        /> */}
        {/* <Route
            path="/vendor/profile"
            element={<VendorProfile />}
        /> */}
        <Route
            path="/customer/orders/:id"
            element={<OrderDetails />}
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
        />

        <Route
            path="/admin/vendors"
            element={<AdminVendorManagement />}
        />

        <Route
            path="/admin/orders"
            element={<AdminOrderMonitoring />}
        />

        <Route
            path="/admin/vendors/:id"
            element={<AdminVendorDetails />}
        />

        <Route
            path="/admin/analytics"
            element={<AdminAnalytics />}
        />

        <Route
            path="/admin/commissions"
            element={<AdminCommissions />}
        />

        <Route
            path="/admin/system-monitoring"
            element={<AdminSystemMonitoring />}
        />

        <Route
            path="/admin/reports"
            element={<AdminReports />}
        />

        <Route
            path="/admin/warehouses"
            element={<AdminWarehouseManagement />}
        />
        <Route
            path="/admin/shipments"
            element={<AdminShipmentManagement />}
        />

        <Route
            path="/admin/shipments/:id"
            element={<AdminShipmentDetails />}
        />
        <Route
            path="/customer/orders/:orderId/tracking"
            element={<CustomerOrderTracking />}
        />
      </Routes>


    </BrowserRouter>
  );
}

export default App;
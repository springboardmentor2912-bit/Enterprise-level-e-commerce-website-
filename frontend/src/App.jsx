import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import AdminLayout from "./components/AdminLayout";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Profile
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

// Customer
import CustomerDashboard from "./pages/CustomerDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/CheckOut";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";

// Vendor
import VendorDashboard from "./pages/VendorDashboard";
import AddProduct from "./pages/AddProduct";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import EditProduct from "./pages/EditProduct";
import MyProducts from "./pages/MyProducts";
import VendorOrders from "./pages/VendorOrders";
import VendorReturns from "./pages/VendorReturns";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCommissions from "./pages/admin/AdminCommissions";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminReports from "./pages/admin/AdminReports";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminWarehouses from "./pages/admin/AdminWarehouses";
import AdminFulfillment from "./pages/admin/AdminFulfillment";
import AdminWarehouseStaff from "./pages/admin/AdminWarehouseStaff";

// Warehouse Staff
import WarehouseStaffLayout from "./components/WarehouseStaffLayout";
import WarehouseStaffDashboard from "./pages/warehouse-staff/WarehouseStaffDashboard";
import WarehouseStaffStock from "./pages/warehouse-staff/WarehouseStaffStock ";
import WarehouseStaffReturns from "./pages/warehouse-staff/WarehouseStaffReturns";


// Route Protection
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/"  element={<Navigate to="/login" replace />}/>
        <Route element={<NavbarLayout />}>
          <Route path="/login"  element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/profile" element={<Profile />}/>
          <Route path="/editprofile"element={<EditProfile />}/>

          {/* Products */}
          <Route
            path="/products"
            element={<ProductList />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />
          {/* Shopping */}
          <Route
            path="/cart"
            element={<Cart />}
          />
          <Route
            path="/checkout"
            element={<Checkout />}
          />
          <Route
            path="/orders"
            element={<OrderHistory />}
          />
          <Route
            path="/orders/:id"
            element={<OrderDetails />}
          />
          <Route
            path="/wishlist"
            element={<Wishlist />}
          />
          {/* Vendor */}
          <Route
            path="/vendor-dashboard"
            element={<VendorDashboard />}
          />
          <Route
            path="/addproduct"
            element={<AddProduct />}
          />
          <Route
            path="/products/edit/:id"
            element={<EditProduct />}
          />
          <Route
            path="/myproducts"
            element={<MyProducts />}
          />
          <Route
            path="/vendor-orders"
            element={<VendorOrders />}
          />
          <Route path="/vendor-returns" element={<VendorReturns />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMINISTRATOR",
                "ROLE_ADMINISTRATOR"
              ]}
            >
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          {/* Admin Dashboard */}

          <Route path="/admin/dashboard" element={<AdminDashboard />}/>
          
          {/* Vendor Management */}

          <Route path="/admin/vendor" element={<AdminVendors />}/>

          {/* Order Monitoring */}

          <Route path="/admin/order" element={<AdminOrders />}/>

          {/* Commission Management */}

          <Route path="/admin/commission" element={<AdminCommissions />}/>
          <Route path="/admin/fulfillment" element={<AdminFulfillment/>}/>
          <Route path="/admin/warehouses" element={<AdminWarehouses/>}/>

          {/* System Monitoring */}

          <Route path="/admin/system" element={<AdminSystem />}/>

          {/* Business Reports */}

          <Route path="/admin/report" element={<AdminReports />} />
          <Route path="/admin/coupons" element={<AdminCoupons/>} />
          <Route path="/admin/returns" element={<AdminReturns/>} />
          <Route path="/admin/warehouse-staff" element={<AdminWarehouseStaff/>} />

        </Route>

        {/* Warehouse Staff */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "WAREHOUSE_STAFF",
                "ROLE_WAREHOUSE_STAFF"
              ]}
            >
              <WarehouseStaffLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/warehouse/dashboard" element={<WarehouseStaffDashboard />} />
          <Route path="/warehouse/stock" element={<WarehouseStaffStock />} />
          <Route path="/warehouse/returns" element={<WarehouseStaffReturns />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

    </BrowserRouter>
  );
}


import { Outlet } from "react-router-dom";


const NavbarLayout = () => {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>
    </>
  );
};


export default App;
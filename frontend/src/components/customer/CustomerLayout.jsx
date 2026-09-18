import { Outlet } from "react-router-dom";
import CustomerNavbar from "../../components/common/Navbar"; // Import your navbar here

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar stays at the top */}
      <CustomerNavbar />
      
      {/* Child routes (Home, Wishlist, Cart) render here */}
      <main className="container mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
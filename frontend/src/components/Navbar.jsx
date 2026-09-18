import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { getCart } from "../services/cartService"; // Adjust import path if needed
import { becomeVendor, getMyAccount } from "../services/accountService";

function Navbar({ cartCount: initialCartCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [becomingVendor, setBecomingVendor] = useState(false);

  // 1. Keep auth state in React state so updates trigger a re-render
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");

  // Multi-role support
  const [hasVendorAccess, setHasVendorAccess] = useState(
    () => localStorage.getItem("isVendor") === "true"
  );

  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("viewAs") || localStorage.getItem("role") || ""
  );

  // NEW: keep track of vendor application status
  const [vendorStatus, setVendorStatus] = useState(
    () => localStorage.getItem("vendorStatus") || ""
  );

  const primaryRole = role.toUpperCase();
  const isVendor = viewMode.toUpperCase() === "VENDOR";

  // Synchronize auth state on route changes and custom dispatch events
  useEffect(() => {
    const syncAuth = () => {
      const storedRole = localStorage.getItem("role") || "";

      setToken(localStorage.getItem("token"));
      setRole(storedRole);
      setHasVendorAccess(localStorage.getItem("isVendor") === "true");
      setViewMode(localStorage.getItem("viewAs") || storedRole);
      setVendorStatus(localStorage.getItem("vendorStatus") || "");
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, [location]);

 useEffect(() => {
  if (!token) return;

  getMyAccount()
    .then((account) => {
      // Backend is the source of truth for whether this account has
      // approved vendor access. Never let stale localStorage turn a
      // normal CUSTOMER account into the vendor UI.
      const reallyHasVendorAccess = Boolean(
        account?.isVendor === true ||
        account?.vendor === true ||
        String(account?.primaryRole || account?.role || "").toUpperCase() === "VENDOR" ||
        String(account?.vendorStatus || "").toUpperCase() === "APPROVED"
      );
      const currentVendorStatus = String(account?.vendorStatus || "").toUpperCase();

      localStorage.setItem("isVendor", String(reallyHasVendorAccess));
      localStorage.setItem("vendorStatus", currentVendorStatus);

      setHasVendorAccess(reallyHasVendorAccess);
      setVendorStatus(currentVendorStatus);

      const storedView = (localStorage.getItem("viewAs") || "").toUpperCase();
      const backendRole = String(
        account?.primaryRole || account?.role || ""
      ).toUpperCase();

      if (!reallyHasVendorAccess) {
        // CUSTOMER/PENDING/REJECTED accounts must always use the customer
        // product UI. This fixes stale viewAs=VENDOR from an older session.
        localStorage.setItem("viewAs", "CUSTOMER");
        setViewMode("CUSTOMER");
      } else if (!storedView) {
        // Approved vendor: default to vendor view only when no view has
        // been selected yet. After that, Switch to Customer is respected.
        const defaultView = backendRole === "VENDOR" ? "VENDOR" : "CUSTOMER";
        localStorage.setItem("viewAs", defaultView);
        setViewMode(defaultView);
      }
    })
    .catch((err) => {
      console.error("Failed to load account info:", err);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [token]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Sync prop changes if passed from parent
  useEffect(() => {
    setCartCount(initialCartCount);
  }, [initialCartCount]);

  // Fetch initial cart count and setup listeners for real-time updates
  useEffect(() => {
    const fetchCartCount = () => {
      if (token && !isVendor) {
        getCart()
          .then((data) => {
            const count = data?.totalItems ?? data?.items?.length ?? 0;
            setCartCount(count);
          })
          .catch((err) => console.error("Error fetching cart count:", err));
      }
    };

    fetchCartCount();

    const handleCartUpdate = (event) => {
      if (typeof event.detail === "number") {
        setCartCount(event.detail);
      } else {
        fetchCartCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("refreshCart", fetchCartCount);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("refreshCart", fetchCartCount);
    };
  }, [token, isVendor]);

  const handleBrandClick = () => {
    if (!token) {
      navigate("/login");
    } else if (isVendor) {
      navigate("/vendor-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("isVendor");
    localStorage.removeItem("viewAs");
    localStorage.removeItem("vendorStatus");

    setToken(null);
    setRole("");
    setHasVendorAccess(false);
    setViewMode("");
    setVendorStatus("");
    setCartCount(0);

    navigate("/login");
  };

  // Flip between the customer and vendor sides of one account
  const handleSwitchView = () => {
    const nextMode = isVendor ? "CUSTOMER" : "VENDOR";

    localStorage.setItem("viewAs", nextMode);
    setViewMode(nextMode);

    window.dispatchEvent(new Event("storage"));

    navigate(
      nextMode === "VENDOR"
        ? "/vendor-dashboard"
        : "/customer-dashboard"
    );
  };

  // Become a vendor
  const handleBecomeVendor = async () => {
    if (becomingVendor) return;

    setBecomingVendor(true);

    try {
      await becomeVendor({});

      // IMPORTANT:
      // Creating the vendor profile does NOT mean approval.
      // Keep the user as CUSTOMER until admin approves.
      localStorage.setItem("isVendor", "false");
      localStorage.setItem("vendorStatus", "PENDING");
      localStorage.setItem("viewAs", "CUSTOMER");

      setHasVendorAccess(false);
      setVendorStatus("PENDING");
      setViewMode("CUSTOMER");

      window.dispatchEvent(new Event("storage"));

      alert(
        "Your vendor application has been submitted successfully. Please wait for admin approval."
      );

    } catch (err) {
      console.error("Failed to become a vendor:", err);

      alert(
        err.response?.data ||
          "Failed to set up your vendor profile. Please try again."
      );
    } finally {
      setBecomingVendor(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Only offer "Become a Vendor" when there is no existing application
  // and the account is not already an approved vendor.
  const canBecomeVendor =
    token &&
    primaryRole !== "VENDOR" &&
    !hasVendorAccess &&
    vendorStatus !== "PENDING";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <button
          type="button"
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 text-left text-xl font-serif font-bold tracking-tight text-slate-900 focus:outline-none cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-sans text-base font-extrabold shadow-sm transition-transform group-hover:scale-105">
            S
          </div>

          <span className="tracking-tight text-slate-900 font-extrabold">
            Shop<span className="text-emerald-700">Stack</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        {token && (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/products"
              className={`px-3.5 py-2 rounded-lg transition ${
                isActive("/products")
                  ? "bg-stone-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
              }`}
            >
              Products
            </Link>

            {isVendor ? (
              <>
                <Link
                  to="/myproducts"
                  className={`px-3.5 py-2 rounded-lg transition ${
                    isActive("/myproducts")
                      ? "bg-stone-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  }`}
                >
                  My Products
                </Link>

                <Link
                  to="/addproduct"
                  className={`px-3.5 py-2 rounded-lg transition ${
                    isActive("/addproduct")
                      ? "bg-stone-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  }`}
                >
                  Add Product
                </Link>

                <Link
                  to="/vendor-orders"
                  className={`px-3.5 py-2 rounded-lg transition ${
                    isActive("/vendor-orders")
                      ? "bg-stone-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  }`}
                >
                  Orders
                </Link>

                <Link
                  to="/vendor-returns"
                  className={`px-3.5 py-2 rounded-lg transition ${
                    isActive("/vendor-returns")
                      ? "bg-stone-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  }`}
                >
                  Returns
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/wishlist"
                  className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    isActive("/wishlist")
                      ? "bg-stone-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Wishlist
                </Link>

                {/* Cart Link with Badge */}
                <Link
                  to="/cart"
                  className={`relative px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    isActive("/cart")
                      ? "bg-stone-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  }`}
                >
                  <div className="relative">
                    <svg
                      className="w-5 h-5 text-slate-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>

                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </div>

                  <span>Cart</span>
                </Link>

                <Link
                  to="/orders"
                  className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    isActive("/orders")
                      ? "bg-stone-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  }`}                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"                 >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Orders
                </Link>
              </>
            )}
          </nav>
        )}
        {/* User / Action Buttons */}
        <div className="flex items-center gap-3">
          {token ? (
            <>
              {/* Switch only when actually approved */}
              {hasVendorAccess && (
                <button
                  type="button"
                  onClick={handleSwitchView}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                  title="Switch between your customer and vendor views"               >
                  {isVendor ? "Switch to Customer" : "Switch to Vendor"}
                </button>
              )}
              {/* Rejected Vendor Application */}
              {vendorStatus === "REJECTED" && !hasVendorAccess && (
                <button
                  type="button"
                  onClick={handleBecomeVendor}
                  disabled={becomingVendor}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
                  title="Your vendor application was rejected. You can apply again."
                >
                  {becomingVendor ? "Reapplying…" : "Application Rejected — Apply Again"}
                </button>
              )}

              {/* Become Vendor */}
              {canBecomeVendor && vendorStatus !== "REJECTED" && (
                <button
                  type="button"
                  onClick={handleBecomeVendor}
                  disabled={becomingVendor}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-stone-300 text-slate-700 hover:bg-stone-100 transition cursor-pointer disabled:opacity-50"               >
                  {becomingVendor
                    ? "Setting up…"
                    : "Become a Vendor"}
                </button>
              )}
              {/* Pending status */}
              {vendorStatus === "PENDING" && !hasVendorAccess && (
                <span className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg text-xs font-bold border border-amber-200 bg-amber-50 text-amber-700">
                  Vendor Approval Pending
                </span>
              )}
              <Link
                to="/profile"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive("/profile")
                    ? "bg-stone-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                }`}              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"               >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"                  />
                </svg>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-stone-300 text-slate-700 hover:bg-stone-100 transition shadow-xs cursor-pointer"             >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-stone-50 transition"              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"              >
                Sign Up
              </Link>
            </>
          )}
          {/* Mobile Menu Button */}
          {token && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-stone-100 transition cursor-pointer"            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"             >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>
      {/* Mobile Menu */}
      {token && mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          <Link
            to="/products"
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-stone-100"          >
            Products
          </Link>
          {!isVendor && (
            <Link
              to="/cart"
              className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-stone-100"           >
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}
          <Link
            to="/profile"
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-stone-100"
          >
            Profile
          </Link>
          {hasVendorAccess && (
            <button
              type="button"
              onClick={handleSwitchView}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50"
            >
              {isVendor
                ? "Switch to Customer"
                : "Switch to Vendor"}
            </button>
          )}

          {vendorStatus === "REJECTED" && !hasVendorAccess && (
            <button
              type="button"
              onClick={handleBecomeVendor}
              disabled={becomingVendor}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
            >
              {becomingVendor
                ? "Reapplying…"
                : "Application Rejected — Apply Again"}
            </button>
          )}

          {canBecomeVendor && vendorStatus !== "REJECTED" && (
            <button
              type="button"
              onClick={handleBecomeVendor}
              disabled={becomingVendor}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-stone-100 disabled:opacity-50"           >
              {becomingVendor
                ? "Setting up…"
                : "Become a Vendor"}
            </button>
          )}
          {vendorStatus === "PENDING" && !hasVendorAccess && (
            <div className="px-3 py-2 text-base font-medium text-amber-700 bg-amber-50 rounded-md">
              Vendor Approval Pending
            </div>
          )}
        </div>
      )}
    </header>
  );
}
export default Navbar;
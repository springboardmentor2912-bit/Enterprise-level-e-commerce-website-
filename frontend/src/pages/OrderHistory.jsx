import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderHistory } from "../services/OrderService";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  RETURNED: "bg-rose-50 text-rose-700 border-rose-200",
  REFUNDED: "bg-slate-100 text-slate-700 border-slate-200",
};

const FILTER_TABS = ["ALL", "DELIVERED", "PROCESSING", "SHIPPED", "CANCELLED"];

function OrderHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrderHistory();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders by tab selection & search query
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      selectedFilter === "ALL" || order.status === selectedFilter;
    const matchesSearch =
      (order.customerOrderNumber ?? order.id)
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/60 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Fetching your order history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">
              Order History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and track your recent purchases & receipts.
            </p>
          </div>

          <button
            onClick={() => navigate("/products")}
           className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 border border-stone-200/80 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <span>🛍️</span> Continue Shopping
          </button>
        </div>

        {/* Controls: Search Bar & Filter Pills */}
        {orders.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap cursor-pointer ${
                      selectedFilter === tab
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white border border-stone-200/80 text-slate-600 hover:bg-stone-100"
                    }`}
                  >
                    {tab.toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search order # or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="text-center bg-white border border-stone-200/80 rounded-2xl py-16 px-6 shadow-xs">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              No orders placed yet
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Looks like you haven't bought anything yet. Explore our multi-vendor shop to get started!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-xs cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center bg-white border border-stone-200/80 rounded-2xl py-12 px-6 shadow-xs">
            <p className="text-slate-500 text-sm font-medium">
              No orders matching your filters.
            </p>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-5 border-b border-stone-100 flex items-center justify-between gap-4 bg-stone-50/40">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      Order #{order.customerOrderNumber ?? order.id}
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="hidden sm:inline text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      STATUS_STYLES[order.status] ||
                      "bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Card Content & Items Preview */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    {/* Items chips preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-stone-100 border border-stone-200/70 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium"
                          >
                            {item.productName}{" "}
                            <span className="text-slate-400">x{item.quantity}</span>
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-slate-400 font-medium">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-400 sm:hidden">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Order Total & Arrow Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">
                        Total Amount
                      </span>
                      <span className="text-lg font-extrabold text-slate-900">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    <div className="h-9 w-9 rounded-xl bg-stone-50 group-hover:bg-slate-900 group-hover:text-white border border-stone-200/80 group-hover:border-slate-900 flex items-center justify-center text-slate-500 transition-colors shrink-0">
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default OrderHistory;
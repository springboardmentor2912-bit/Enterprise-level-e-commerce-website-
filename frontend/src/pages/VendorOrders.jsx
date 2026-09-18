import { useEffect, useState } from "react";
import { getVendorOrderItems } from "../services/OrderService";

const STATUS_STYLES = {
  PENDING: "bg-stone-100 text-stone-600",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  RETURNED: "bg-rose-50 text-rose-700",
  REFUNDED: "bg-slate-100 text-slate-700",
};

function VendorOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getVendorOrderItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading orders…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-900">
            Orders
          </h1>
          <p className="text-slate-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} sold across all your orders
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center mt-16 bg-white border border-stone-100 rounded-2xl py-16 px-6">
            <h2 className="text-2xl font-semibold text-slate-700">
              No orders yet
            </h2>
            <p className="text-slate-500 mt-2">
              Orders containing your products will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isAllocated = item.warehouseId || (item.allocatedQuantity && item.allocatedQuantity > 0);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400">Order #{item.orderId}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[item.status] || "bg-stone-100 text-stone-600"}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900">{item.productName}</p>
                      <p className="text-sm text-slate-500">
                        ₹{item.priceAtPurchase} × {item.quantity} = <span className="font-medium text-slate-700">₹{item.lineTotal}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(item.orderCreatedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-sm text-slate-600 md:text-right">
                      <p className="font-medium text-slate-900">{item.shippingFullName}</p>
                      <p>
                        {item.shippingAddressLine1}
                        {item.shippingAddressLine2 ? `, ${item.shippingAddressLine2}` : ""}
                      </p>
                      <p>
                        {item.shippingCity}, {item.shippingState} {item.shippingPostalCode}
                      </p>
                      <p>{item.shippingPhone}</p>
                    </div>

                  </div>

                  

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorOrders;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productService";

function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id || id === "undefined") {
        setError("Invalid Product ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getProductById(id);
        
        // Safe extraction for standard Axios or Spring Boot wrapped responses
        const data = response?.data?.data || response?.data || response;

        if (data && typeof data === "object") {
          setProduct(data);
        } else {
          setError("Unable to find details for this product.");
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading product details…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <p className="text-rose-600 font-medium">{error || "Product not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Extract primary image or fallback
  const productImage =
    product.imageUrl ||
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20250%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22250%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20x%3D%22200%22%20y%3D%22130%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E");

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 flex justify-center items-center">
      <div className="bg-white border border-stone-100 rounded-2xl p-8 max-w-2xl w-full shadow-sm space-y-6">
        <div className="flex justify-between items-start border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              {product.category?.name || product.categoryName || "General"}
            </span>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">
              {product.name}
            </h1>
            <p className="text-sm text-slate-500">Brand: {product.brand || "N/A"}</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">₹{product.price}</p>
        </div>

        {productImage && (
          <div className="w-full h-64 bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20250%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22250%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20x%3D%22200%22%20y%3D%22130%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E";
              }}
            />
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-1">Description</h3>
          <p className="text-slate-600 leading-relaxed">{product.description || "No description provided."}</p>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-stone-100 text-sm">
          <span className="text-slate-500">
            Stock Available:{" "}
            <strong className="text-slate-800">
              {product.stockQuantity ?? product.stock ?? 0}
            </strong>
          </span>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border border-stone-300 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-stone-100 transition"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/products/edit/${id}`)}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-lg font-semibold transition shadow-sm"
          >
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewProduct;
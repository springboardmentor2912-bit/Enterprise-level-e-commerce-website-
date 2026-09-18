import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../services/productService";
import { getAllCategories } from "../services/Categoryservice";

function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
    imageUrl: ""
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getAllCategories();

        const categoryList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        setCategories(categoryList);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Vendor is resolved server-side from the logged-in JWT — never sent
      // from here. Only fields that exist on ProductRequestDTO go in this
      // payload; anything else is silently dropped by the backend anyway.
      await addProduct({
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        imageUrl: formData.imageUrl,
      });

      navigate("/myproducts");
    } catch (error) {
      console.error("Failed to add product error details:", error.response?.data || error);
      alert(`Failed to add product: ${error.response?.data || 'Check browser console for error details.'}`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white shadow-md border border-stone-100 rounded-2xl p-8 md:p-10 w-full max-w-2xl">
        <div className="mb-8 text-center">
          <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
            Vendor · New Listing
          </span>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            List a New Product
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Fill in the details below to publish this item to your storefront.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              placeholder="e.g. SoundWave"
              className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              placeholder="What makes this product worth buying?"
              className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
                className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full border border-stone-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            >
              <option value="" disabled>Select a category</option>
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-slate-400 mt-2">
                No categories yet — ask an admin to create one first.
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/myproducts")}
              className="flex-1 border border-stone-300 text-slate-700 hover:bg-stone-100 py-3 rounded-lg font-medium transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-semibold transition shadow-sm"
            >
              Publish Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addProduct } from "../../api/vendorApi";
import { getCategories } from "../../api/categoryApi";

export default function AddProduct() {
  const [categories, setCategories] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function onSubmit(data) {
    console.log("Category ID =", data.categoryId);
    console.log(data);

    try {
      await addProduct(data);
      alert("Product submitted for admin approval.");
      reset();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed");
    }
  }

  return (
    <div className="mx-auto mt-4 max-w-3xl sm:mt-10">
      <style>{`
        @keyframes ap-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ap-fade-up { animation: ap-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      <div className="ap-fade-up mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          Catalog
        </p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Add Product
        </h1>
        <p className="mt-1.5 text-[14px] text-stone-500">
          List a new product in your storefront. It will appear after admin approval.
        </p>
      </div>

      <div className="ap-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]" style={{ animationDelay: "60ms" }}>
        {/* Card header */}
        <div className="border-b border-stone-200 bg-stone-50/70 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p className="font-['Fraunces',serif] text-lg font-semibold text-stone-900">
                New product listing
              </p>
              <p className="text-[12px] text-stone-500">
                All fields below are required
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-6 sm:p-8"
        >
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-stone-700">
              Product Name
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </span>
              <input
                {...register("name")}
                placeholder="e.g. Handcrafted Leather Wallet"
                className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-stone-700">
              Description
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-0 top-3.5 pl-3.5 text-stone-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </span>
              <textarea
                {...register("description")}
                placeholder="Describe the product, materials, and key features..."
                rows="4"
                className="peer w-full resize-none rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
              />
            </div>
          </div>

          {/* Price + Stock row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                Price
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-500">
                  <span className="text-[15px] font-semibold">₹</span>
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("price")}
                  placeholder="0.00"
                  className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-9 pr-4 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                Stock
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </span>
                <input
                  type="number"
                  {...register("stock")}
                  placeholder="0"
                  className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-stone-700">
              Image URL
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </span>
              <input
                {...register("imageUrl")}
                placeholder="https://..."
                className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-stone-700">
              Category
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </span>
              <select
                {...register("categoryId")}
                className="peer w-full cursor-pointer appearance-none rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-11 pr-11 text-[15px] text-stone-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-6">
            <p className="text-[12px] text-stone-500">
              Admin will review before publishing.
            </p>
            <button
              type="submit"
              className="group inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-8 py-3 text-[14px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all hover:bg-emerald-900 active:scale-[0.99]"
            >
              Submit Product
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
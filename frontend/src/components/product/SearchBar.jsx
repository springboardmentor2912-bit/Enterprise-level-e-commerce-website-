import { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProducts } from "../../redux/productSlice";

export default function SearchBar() {
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    dispatch(fetchProducts(keyword));
  }

  function handleChange(e) {
    setKeyword(e.target.value);

    // user cleared the box → show all products again
    if (e.target.value === "") {
      dispatch(fetchProducts(""));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto mb-10 flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-stone-200/80 bg-white p-2 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.15)] focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10 transition-all"
    >
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </span>

        <input
          type="text"
          value={keyword}
          onChange={handleChange}
          placeholder="Search products by name or description..."
          className="w-full bg-transparent py-3 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 outline-none"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-emerald-800 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm shadow-emerald-800/20 transition-all duration-200 hover:bg-emerald-900 active:scale-[0.98] sm:px-6"
      >
        Search
      </button>
    </form>
  );
}
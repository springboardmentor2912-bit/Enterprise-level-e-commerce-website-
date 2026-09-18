import { useNavigate } from "react-router-dom";

export default function ProductCard({
  product,
  inWishlist,
  onToggleWishlist,
  onAddToCart,
}) {
  const navigate = useNavigate();

  // 🆕 Discount math (SRS: System calculates final price)
  const discount = product.discountPercentage || 0;
  const finalPrice =
    discount > 0
      ? Math.round(product.price * (1 - discount / 100))
      : product.price;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(6,35,31,0.28)]">
      {/* ============ IMAGE ============ */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Category chip */}
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-700 shadow-sm backdrop-blur">
            {product.category}
          </span>
        )}

        {/* 🆕 Sale badge */}
        {discount > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
            {discount}% off
          </span>
        )}

        {/* Wishlist toggle */}
        <button
          onClick={onToggleWishlist}
          title="Wishlist"
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-all duration-200 ${
            inWishlist
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-100"
              : "bg-white/90 text-stone-600 hover:bg-white hover:text-rose-500 hover:scale-105"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={inWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className="h-[18px] w-[18px] transition-transform duration-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Out-of-stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/35 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-800 shadow-sm">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* ============ BODY ============ */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-['Fraunces',serif] text-[17px] font-semibold leading-snug tracking-tight text-stone-900">
          {product.name}
        </h3>

        {/* 🆕 Price with strikethrough original */}
        <div className="mt-2 flex items-baseline gap-2">
          <p className="font-['Fraunces',serif] text-2xl font-semibold tracking-tight text-emerald-800 tabular-nums">
            ₹{finalPrice}
          </p>
          {discount > 0 && (
            <p className="text-[13px] font-medium text-stone-400 line-through tabular-nums">
              ₹{product.price}
            </p>
          )}
        </div>

        {/* Stock indicator */}
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              product.stock > 0
                ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                : "bg-rose-500"
            }`}
          />
          <span
            className={`text-[12px] font-medium ${
              product.stock > 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            Stock: {product.stock}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="flex-1 rounded-xl bg-emerald-800 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-emerald-800/20 transition-all duration-200 hover:bg-emerald-900 active:scale-[0.98]"
          >
            View Details
          </button>

          <button
            onClick={onAddToCart}
            disabled={product.stock === 0}
            title="Add to Cart"
            className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition-all duration-200 hover:bg-emerald-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-[18px] w-[18px]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138m-14.64 0h14.64M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
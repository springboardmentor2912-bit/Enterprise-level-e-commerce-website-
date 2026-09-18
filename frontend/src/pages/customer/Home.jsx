import ProductGrid from "../../components/product/ProductGrid";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    // 🆕 Changed to bg-white
    <div className="min-h-screen bg-white font-['Manrope',sans-serif]">
      {/* ============ HERO ============ */}
      {/* 🆕 Changed gradient to pure white for consistency */}
      <section className="relative overflow-hidden border-b border-stone-200/60 bg-white">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-[100px]" />
          <div className="absolute -left-24 top-1/2 h-72 w-72 rounded-full bg-amber-200/40 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-600/15 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Now open
            </p>

            <h1 className="mt-6 font-['Fraunces',serif] text-5xl font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
              Welcome to{" "}
              <span className="italic text-emerald-700">ShopStack</span>
            </h1>

            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-stone-600 sm:text-[17px]">
              Discover the latest products from trusted vendors.
              Curated commerce, delivered with care.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
             <button
              onClick={() => {
                document.getElementById("shop-section")?.scrollIntoView({ 
                  behavior: "smooth" 
                });
              }}
              className="group inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all hover:bg-emerald-900 active:scale-[0.99]"
            >
              Start shopping
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform group-hover:translate-y-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </button>

              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-[14px] font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                View profile
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8 border-t border-stone-200/80 pt-8">
              {[
                { value: "300+", label: "Active vendors" },
                { value: "10k+", label: "Happy customers" },
                { value: "4.9★", label: "Avg. rating" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900">
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wider text-stone-500">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRODUCT GRID ============ */}
      <div id="shop-section" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <ProductGrid />
      </div>
    </div>
  );
}
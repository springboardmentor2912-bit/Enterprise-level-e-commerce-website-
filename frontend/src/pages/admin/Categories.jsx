import { useEffect, useState } from "react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../api/adminApi";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

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

  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      name,
      description,
    };

    try {
      if (editingId) {
        await updateCategory(editingId, data);
      } else {
        await addCategory(data);
      }

      setEditingId(null);
      setName("");
      setDescription("");

      loadCategories();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8 font-['Manrope',sans-serif]">
      <style>{`
        @keyframes cg-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .cg-fade-up { animation: cg-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="cg-fade-up">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
          Platform
        </p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Category Management
        </h1>
        <p className="mt-1.5 text-[14px] text-stone-500">
          Organize the marketplace taxonomy that vendors list against.
        </p>
      </div>

      {/* ===== ADD / EDIT FORM ===== */}
      <form
        onSubmit={handleSubmit}
        className={`cg-fade-up overflow-hidden rounded-2xl border bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)] transition-colors ${
          editingId ? "border-amber-300" : "border-stone-200/80"
        }`}
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-9 w-9 place-items-center rounded-lg ring-1 ${
                editingId
                  ? "bg-amber-50 text-amber-700 ring-amber-600/15"
                  : "bg-sky-50 text-sky-700 ring-sky-600/15"
              }`}
            >
              {editingId ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              )}
            </span>
            <div>
              <p className="font-['Fraunces',serif] text-lg font-semibold text-stone-900">
                {editingId ? "Edit Category" : "Add New Category"}
              </p>
              <p className="text-[12px] text-stone-500">
                {editingId
                  ? "You're updating an existing category"
                  : "Create a new taxonomy entry"}
              </p>
            </div>
          </div>

          {editingId && (
            <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-amber-700 ring-1 ring-amber-600/15 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Editing mode
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                Category Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Electronics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-600/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                Description
              </label>
              <input
                type="text"
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-600/10"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            {editingId && (
              <p className="mr-auto text-[12px] text-amber-700">
                Saving will overwrite the existing category.
              </p>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-6 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-sky-800/25 transition-all hover:bg-sky-800 active:scale-[0.99]"
            >
              {editingId ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Update Category
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Category
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ===== CATEGORIES TABLE ===== */}
      <div
        className="cg-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]"
        style={{ animationDelay: "120ms" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Description</th>
                <th className="w-[220px] px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className={`transition ${
                    editingId === category.id
                      ? "bg-amber-50/50"
                      : "hover:bg-stone-50/40"
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-600/10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                        </svg>
                      </span>
                      <span className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                        {category.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-stone-600">
                    {category.description || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-amber-700 transition-all hover:bg-amber-50 active:scale-[0.98]"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(category.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-rose-700 transition-all hover:bg-rose-50 active:scale-[0.98]"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.05.68-.099 1.022-.148m0 0a48.158 48.158 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-5 py-16 text-center">
                    <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      </svg>
                    </span>
                    <p className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                      No categories found.
                    </p>
                    <p className="mt-0.5 text-[12px] text-stone-500">
                      Add your first category using the form above.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
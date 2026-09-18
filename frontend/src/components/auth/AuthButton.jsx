export default function AuthButton({
  title,
  loading,
}) {
  return (
    <button
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-blue-400"
    >
      {loading ? "Please wait..." : title}
    </button>
  );
}
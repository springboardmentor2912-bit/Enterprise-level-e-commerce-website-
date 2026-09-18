import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function AuthInput({
  label,
  type,
  placeholder,
  register,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          placeholder={placeholder}
          {...register}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}
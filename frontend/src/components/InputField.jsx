import React from "react";

const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <label
        htmlFor={name}
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="
          w-full
          rounded-lg
          border
          border-slate-300
          px-4
          py-3
          text-slate-800
          placeholder:text-slate-400
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
          transition-all
          duration-200
        "
      />
    </div>
  );
};

export default InputField;
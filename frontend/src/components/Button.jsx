import React from "react";

const Button = ({
  type = "button",
  children,
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        bg-blue-600
        hover:bg-blue-700
        text-white
        font-semibold
        py-3
        rounded-lg
        transition-all
        duration-300
        shadow-md
        hover:shadow-lg
        disabled:bg-gray-400
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
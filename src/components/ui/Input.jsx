import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Input = ({
  label,
  id,
  type = "text",
  placeholder,
  required,
  autoComplete,
  className = "",
  maxLength,
  error,
  register,
  validation = {},
  classForLabel = "",
  showToggle = true,
}) => {
  const isInline = className.includes("!flex-1");
  const [charCount, setCharCount] = useState(0);

  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  const registerProps = register 
    ? register(id, { required, ...validation }) 
    : {};

  return (
    <div className={isInline ? "flex-1" : "mb-4"}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-bold text-gray-200 mb-2 ${classForLabel}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={isPassword && visible ? "text" : type}
          id={id}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          {...registerProps}
          value={registerProps.value ?? undefined}
          onChange={(e) => {
            registerProps.onChange?.(e);
            if (maxLength) setCharCount(e.target.value.length);
          }}
          className={`px-4 py-2 border ${
            error ? "border-red-500" : "border-gray-400"
          } rounded-md focus:outline-none focus:ring-2 w-full ${className}`}
        />

        {/* eye-icon toggle */}
        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
            tabIndex={-1}           /* no robar foco al tabular */
          >
            {visible ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>

      {maxLength && (
        <div
          className={`text-right text-xs mt-1 ${
            charCount >= maxLength ? "text-red-400" : "text-gray-400"
          }`}
        >
          {charCount}/{maxLength}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error.message || error}</p>}
    </div>
  );
};


export default Input;
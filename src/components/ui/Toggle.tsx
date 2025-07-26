import React from "react";
import { UseFormRegister } from "react-hook-form";

export interface ToggleProps {
  id: string;
  label?: string;
  register?: UseFormRegister<any>;
  validation?: {};
  error?: any;
  className?: string;
  classForLabel?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  id,
  label,
  register,
  validation = {},
  error,
  className = "",
  classForLabel = "",
  ...rest
}) => {
  // RHF or controlled props
  const inputProps = register ? register(id, validation) : rest;

  return (
    <div className={`mb-4 flex bg-gray-900 p-4 rounded-lg items-center justify-between ${className}`}>
      {/* Text label (click toggles as well thanks to htmlFor) */}
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-bold text-gray-200 select-none ${classForLabel}`}
        >
          {label}
        </label>
      )}

      {/* Entire switch wrapped in label so any click toggles */}
      <label
        htmlFor={id}
        className="relative inline-flex items-center cursor-pointer"
      >
        {/* Hidden checkbox controlled by RHF */}
        <input
          id={id}
          type="checkbox"
          className="sr-only peer"
          {...inputProps}
        />
        {/* Track */}
        <span
          className="w-10 h-6 rounded-full bg-gray-500
                     transition-colors duration-200
                     peer-checked:bg-emerald-600
                     peer-focus:ring-2 peer-focus:ring-emerald-400/50"
        />
        {/* Thumb */}
        <span
          className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white
                     transition-transform duration-200
                     peer-checked:translate-x-4"
        />
      </label>

      {error && (
        <p className="text-red-500 text-sm mt-1 w-full">
          {error.message || error}
        </p>
      )}
    </div>
  );
};

export default Toggle;

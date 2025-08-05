import React, { useState } from "react";
import {
  ControllerRenderProps,
  UseFormRegister,
  RegisterOptions,
} from "react-hook-form";
import { 
  EyeIcon,
  EyeSlashIcon,
 } from "@heroicons/react/24/solid";

interface InputProps {
  id: string;
  placeholder?: string;
  className?: string;
  classForLabel?: string;
  label?: string;
  watchValue?: string;
  type?: React.HTMLInputTypeAttribute;
  maxLength?: number;
  autoComplete?: string;
  error?: { message?: string } | string | undefined;
  register?: UseFormRegister<any>;
  validation?: RegisterOptions;
  field?: ControllerRenderProps<any, string>;
  showToggle?: boolean;
}

const Input = ({
  id,
  placeholder,
  className = "",
  classForLabel = "",
  label,
  type = "text",
  maxLength,
  watchValue,
  autoComplete,
  error,
  register,
  validation,
  field,
  showToggle = true,
}: InputProps) => {
  const [visible, setVisible] = useState(false);
  const [charCount, setCharCount] = useState(field?.value?.length || 0);
  const isPassword = type === "password";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field?.onChange) {
      field.onChange(e);
    }
    if (maxLength) setCharCount(e.target.value.length);
  };

  const registerProps = register ? register(id, validation) : {};

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`font-semibold text-sm mb-1 text-white ${classForLabel}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={`w-full rounded-md px-3 py-2 border bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            error ? "border-rose-600" : "border-gray-600"
          }`}
          {...(field ?? registerProps)}
          {...(field && {
            value: field.value,
            onChange: handleChange,
          })}
        />

        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
            tabIndex={-1}
          >
            {visible 
              ? <EyeSlashIcon className="w-4 h-4" /> 
              : <EyeIcon className="w-4 h-4" />}
          </button>
        )}
      </div>
      <div className="flex justify-between items-center">
        {error && (
        <span className="text-rose-600 text-xs">
          {typeof error === "string" ? error : error?.message}
        </span>
        )}

        {maxLength !== undefined && (
          <div
            className={`text-right text-xs mt-1 ${
              (watchValue?.length ?? 0) >= maxLength ? "text-red-400" : "text-gray-400"
            }`}
          >
            {watchValue?.length ?? 0}/{maxLength}
          </div>
        )}
      </div>

    </div>
  );
};

export default Input;

import React from "react";
import { UseFormRegister } from "react-hook-form";

interface InputProps {
  id: string;
  type?: string;
  label: string;
  placeholder?: string;
  register: ReturnType<UseFormRegister<any>>;
  validation?: Record<string, any>;
  error?: any;
  className?: string;
  autoComplete?: string;
  maxLength?: number;
}

const Input: React.FC<InputProps> = ({ id, type = "text", label, placeholder, register, validation, error, className, autoComplete, maxLength }) => (
  <div className={`flex flex-col gap-2 ${className ?? ""}`}>
    <label htmlFor={id} className="font-semibold text-sm mb-1">{label}</label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      maxLength={maxLength}
      {...register}
      {...validation}
      className="rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
    />
    {error && <span className="text-red-500 text-xs">{error.message}</span>}
  </div>
);

export default Input;

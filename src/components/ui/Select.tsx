import {
  Control,
  Controller,
  UseFormRegister,
  RegisterOptions,
} from "react-hook-form";
import React from "react";

export type Option = {
  value: string;
  label: string;
};

interface SelectProps {
  id: string;
  label: string;
  options: Option[];
  className?: string;
  classForLabel?: string;
  error?: any;

  control?: Control<any>;
  register?: UseFormRegister<any>;
  validation?: RegisterOptions;

  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select = ({
  id,
  label,
  options,
  className,
  classForLabel,
  error,
  control,
  register,
  validation,
  disabled = false,
  onChange,
}: SelectProps) => {
  const baseClasses =
    "rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500";

  if (control) {
    return (
      <Controller
        name={id}
        control={control}
        render={({ field }) => (
          <div className={`flex flex-col gap-2 ${className ?? ""}`}>
            <label
              htmlFor={id}
              className={`font-semibold text-sm mb-1 ${classForLabel}`}
            >
              {label}
            </label>
            <select
              id={id}
              {...field}
              className={baseClasses}
              disabled={disabled}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e);
              }}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && (
              <span className="text-red-500 text-xs">{error.message}</span>
            )}
          </div>
        )}
      />
    );
  }

  if (register) {
    return (
      <div className={`flex flex-col gap-2 ${className ?? ""}`}>
        <label
          htmlFor={id}
          className={`font-semibold text-sm mb-1 ${classForLabel}`}
        >
          {label}
        </label>
        <select
          id={id}
          {...register(id, {
            ...validation,
            onChange: (e) => {
              validation?.onChange?.(e);
              onChange?.(e);
            },
          })}
          className={baseClasses}
          disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-red-500 text-xs">{error.message}</span>
        )}
      </div>
    );
  }

  return null;
};

export default Select;

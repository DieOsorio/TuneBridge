import {
  Control,
  Controller,
  UseFormRegister,
  RegisterOptions,
} from "react-hook-form";
import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

export type Option = {
  value: string;
  label: string;
};

interface SelectProps {
  id: string;
  label?: string;
  options: Option[];
  defaultOption?: string;
  className?: string;
  classForLabel?: string;
  error?: any;

  control?: Control<any>;
  register?: UseFormRegister<any>;
  validation?: RegisterOptions;

  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement> | string) => void;
}

const Select = ({
  id,
  label,
  options,
  className,
  classForLabel,
  defaultOption,
  error,
  control,
  register,
  validation,
  disabled = false,
  onChange,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderDropdown = (
    value: string,
    onChangeFn: (value: string) => void
  ) => {
    const selectedLabel = options.find((o) => o.value === value)?.label || defaultOption;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className={`w-full flex justify-between items-center bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
        >
          <span>{selectedLabel}</span>
          <FaChevronDown className="w-4 h-4 ml-2" />
        </button>
        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-3 py-2 text-white hover:bg-gray-700 cursor-pointer ${
                  value === option.value ? "bg-gray-700" : ""
                }`}
                onClick={() => {
                  onChangeFn(option.value);
                  onChange?.(option.value); // notify external
                  setIsOpen(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

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
            {renderDropdown(field.value, field.onChange)}
            {error && (
              <span className="text-red-500 text-xs">{error.message}</span>
            )}
          </div>
        )}
      />
    );
  }

  if (register) {
    const { onChange: validationOnChange, ...restValidation } = validation ?? {};
    const [value, setValue] = useState<string>("");

    return (
      <div className={`flex flex-col gap-2 ${className ?? ""}`}>
        <label
          htmlFor={id}
          className={`font-semibold text-sm mb-1 ${classForLabel}`}
        >
          {label}
        </label>
        {renderDropdown(value, (val) => {
          setValue(val);
          register(id, validation);
          validationOnChange?.(val);
          onChange?.(val);
        })}
        <input type="hidden" value={value} {...register(id, validation)} />
        {error && (
          <span className="text-red-500 text-xs">{error.message}</span>
        )}
      </div>
    );
  }

  return null;
};

export default Select;

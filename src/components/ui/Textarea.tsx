import React from "react";
import { useTranslation } from "react-i18next";
import {
  FieldError,
  UseFormRegister,
  ValidationRule,
  FieldErrors,
} from "react-hook-form";

interface TextareaProps {
  id: string;
  label?: string;
  register: UseFormRegister<any>;
  validation?: Record<string, ValidationRule>;
  error?: FieldError | FieldErrors | undefined;
  placeholder?: string;
  maxLength?: number;
  watchValue?: string;
  className?: string;
  classForLabel?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  register,
  validation = {},
  error,
  placeholder = "",
  maxLength,
  watchValue,
  className = "",
  classForLabel = "",
}) => {
  const { t } = useTranslation("ui");

  return (
    <div className="sm:col-span-2 flex flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className={`font-semibold text-sm text-gray-200 ${classForLabel}`}
        >
          {label}
        </label>
      )}

      <textarea
        id={id}
        {...register(id, validation)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 p-2 resize-none h-24 ${className}`}
      />

      {(error as FieldError)?.message && (
        <span className="text-red-500 text-xs">{(error as FieldError).message}</span>
      )}

      {maxLength && (
        <p
          className={`text-sm ${
            (watchValue?.length ?? 0) >= maxLength ? "text-red-400" : "text-gray-400"
          }`}
        >
          {watchValue?.length || 0}/{maxLength} {t("form.textarea.limit")}
        </p>
      )}
    </div>
  );
};

export default Textarea;

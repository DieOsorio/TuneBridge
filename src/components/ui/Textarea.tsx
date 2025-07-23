import React from "react";
import { useTranslation } from "react-i18next";
import { FieldError, UseFormRegister, ValidationRule, FieldErrors } from "react-hook-form";

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
    <div className="sm:col-span-2">
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-bold mb-2 text-gray-200 ${classForLabel}`}
        >
          {label}
        </label>
      )}

      <textarea
        id={id}
        {...register(id, validation)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`mt-1 block w-full rounded-md border shadow-sm !border-gray-400 h-24 resize-none p-2 ${className}`}
      />

      {(error as FieldError)?.message && (
        <p className="text-sm text-red-500 mt-1">{(error as FieldError).message}</p>
      )}

      {maxLength && (
        <p
          className={`text-sm mt-1 ${
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

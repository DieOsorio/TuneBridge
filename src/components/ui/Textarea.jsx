import { useTranslation } from "react-i18next";

const Textarea = ({
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
          className={`text-sm font-medium text-gray-400 ${classForLabel}`}
        >
          {label}
        </label>
      )}

      <textarea
        id={id}
        {...register(id, validation)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`mt-1 block w-full rounded-md border shadow-sm !border-gray-400 sm:text-sm h-24 resize-none p-2 ${className}`}
      />

      {error && (
        <p className="text-sm text-red-500 mt-1">{error.message}</p>
      )}

      {maxLength && (
        <p className="text-sm text-gray-500 mt-1">
          {watchValue?.length || 0}/{maxLength} {t("form.textarea.limit")}
        </p>
      )}
    </div>
  );
};

export default Textarea;

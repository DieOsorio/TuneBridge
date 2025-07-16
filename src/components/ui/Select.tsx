import React from "react";
import { Control, Controller, FieldValues } from "react-hook-form";


export type Option = {
  value: string;
  label: string;
};

interface SelectProps {
  id: string;
  label: string;
  control: Control<any>;
  options: Option[];
  className?: string;
}

const Select: React.FC<SelectProps> = ({ id, label, control, options, className }) => (
  <Controller
    name={id}
    control={control}
    render={({ field }) => (
      <div className={`flex flex-col gap-2 ${className ?? ""}`}>
        <label htmlFor={id} className="font-semibold text-sm mb-1">{label}</label>
        <select
          id={id}
          {...field}
          className="rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )}
  />
);

export default Select;

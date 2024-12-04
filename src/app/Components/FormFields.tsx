import type React from "react";

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  className?: string;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  readOnly = false,
  className = "",
}) => (
  <div className="flex w-full flex-col gap-2">
    <label className="font-bold text-md">{label}</label>
    <input
      type={type}
      className={`border text-lg rounded-lg py-3 px-5 outline-0 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  </div>
);

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
};

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
  maxLength,
}) => (
  <div className="flex flex-col w-full gap-2">
    <label className="font-bold text-md">{label}</label>
    <textarea
      className={`border text-lg rounded-lg py-3 px-5 outline-0 min-h-[120px] ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
    />
  </div>
);

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, checked, onChange, className = "" }) => (
  <label className={`flex flex-row gap-2 font-bold text-md items-center ${className}`}>
    <input type="checkbox" className="w-5 h-5" checked={checked} onChange={onChange} />
    {label}
  </label>
);

type SelectOption = {
  value: string | number;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
  containerClassName?: string;
};

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  className = "",
  containerClassName = "",
}) => (
  <div className={`flex flex-col gap-2 ${containerClassName}`}>
    <label className="font-bold text-md">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full p-3 bg-white rounded-md border border-gray-200 text-lg text-right appearance-none ${className}`}
      style={{
        backgroundImage: `url('/dropdown.svg')`,
        backgroundPosition: "left 1rem center",
        backgroundSize: "1.5rem 1.5rem",
        backgroundRepeat: "no-repeat",
        paddingRight: "1.5rem",
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

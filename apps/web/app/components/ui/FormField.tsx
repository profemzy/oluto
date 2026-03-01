"use client";

import { ReactNode, useState } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-bold text-heading"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 font-medium" id={`${id}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// ============================================================================
// TEXT INPUT COMPONENT
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  error,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        className={`
          block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm
          ring-1 ring-inset transition-all duration-200
          placeholder:text-caption
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? "ring-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-950/20"
            : "ring-[var(--color-ring-default)] focus:ring-cyan-600 hover:ring-gray-400"
          }
          ${leftIcon ? "pl-10" : ""}
          ${rightIcon ? "pr-10" : ""}
          ${className}
        `}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          {rightIcon}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SELECT COMPONENT
// ============================================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
}

export function Select({ error, options, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`
        block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm
        ring-1 ring-inset transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? "ring-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-950/20"
          : "ring-[var(--color-ring-default)] focus:ring-cyan-600 hover:ring-gray-400"
        }
        ${className}
      `}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  maxLength?: number;
}

export function TextArea({ error, maxLength, className = "", ...props }: TextAreaProps) {
  const [count, setCount] = useState(props.value?.toString().length || 0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
    props.onChange?.(e);
  };

  return (
    <div className="relative">
      <textarea
        className={`
          block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm
          ring-1 ring-inset transition-all duration-200 resize-none
          placeholder:text-caption
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? "ring-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-950/20"
            : "ring-[var(--color-ring-default)] focus:ring-cyan-600 hover:ring-gray-400"
          }
          ${className}
        `}
        {...props}
        onChange={handleChange}
      />
      {maxLength && (
        <div className="absolute bottom-2 right-2 text-xs text-muted">
          {count}/{maxLength}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CURRENCY INPUT COMPONENT
// ============================================================================

interface CurrencyInputProps extends Omit<InputProps, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
}

export function CurrencyInput({
  value,
  onChange,
  currency = "CAD",
  ...props
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and one decimal point
    const val = e.target.value.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    onChange(val);
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold pointer-events-none">
        $
      </div>
      <input
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        className={`
          block w-full rounded-xl border-0 py-3 pl-8 pr-16 text-heading shadow-sm
          ring-1 ring-inset ring-[var(--color-ring-default)]
          placeholder:text-caption
          focus:ring-2 focus:ring-inset focus:ring-cyan-600
          hover:ring-gray-400 transition-all duration-200
        `}
        value={value}
        onChange={handleChange}
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-medium pointer-events-none">
        {currency}
      </div>
    </div>
  );
}

// ============================================================================
// DATE INPUT COMPONENT
// ============================================================================

interface DateInputProps extends Omit<InputProps, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export function DateInput({ value, onChange, ...props }: DateInputProps) {
  return (
    <div className="relative">
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        {...props}
      />
    </div>
  );
}

// ============================================================================
// TOGGLE/SWITCH COMPONENT
// ============================================================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? "bg-cyan-600" : "bg-surface-tertiary"}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && <span className="text-sm font-bold text-heading">{label}</span>}
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
}

export function RadioGroup({ name, value, onChange, options }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`
            flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
            ${value === opt.value
              ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30"
              : "border-edge bg-surface hover:bg-surface-hover"
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-0.5 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
          />
          <div className="flex-1">
            <span className="text-sm font-bold text-heading">{opt.label}</span>
            {opt.description && (
              <p className="text-xs text-muted mt-0.5">{opt.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

// ============================================================================
// FORM ACTIONS COMPONENT
// ============================================================================

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
}

export function FormActions({
  onCancel,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading,
  destructive,
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-edge-subtle">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2.5 text-sm font-bold text-body hover:text-heading transition-colors"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        onClick={onSubmit}
        disabled={loading}
        className={`
          inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white
          shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
          ${destructive
            ? "bg-gradient-to-r from-red-500 to-rose-500"
            : "bg-gradient-to-r from-cyan-500 to-teal-500"
          }
        `}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {submitLabel}
      </button>
    </div>
  );
}

export default FormField;

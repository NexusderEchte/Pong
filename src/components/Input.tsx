import type { ChangeEventHandler } from 'react';

interface InputProps {
  id: string;
  label?: string;
  type?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled,
  required,
}: InputProps) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`input ${error ? 'error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <p className="input-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

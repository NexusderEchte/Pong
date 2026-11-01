import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { classNames } from '../lib/classNames';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  endAdornment?: ReactNode;
}

export function FormField({
  label,
  error,
  hint,
  endAdornment,
  className,
  id,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className={classNames('field', error && 'field--error', className)}>
      <label htmlFor={fieldId}>{label}</label>
      <div
        className={classNames(
          'field-control',
          Boolean(endAdornment) && 'field-control--action',
        )}
      >
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          id={fieldId}
          {...props}
        />
        {endAdornment}
      </div>
      {hint && !error && (
        <p className="field-hint" id={`${fieldId}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

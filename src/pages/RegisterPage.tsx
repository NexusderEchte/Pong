import { useState, type FormEvent } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { useAuth } from '../context/auth-context';
import { useHashRoute } from '../hooks/useHashRoute';
import {
  validateRegister,
  type FieldErrors,
  type RegisterValues,
} from '../lib/validation';

const INITIAL_VALUES: RegisterValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useHashRoute();
  const [values, setValues] = useState<RegisterValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<RegisterValues>>({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (
    field: keyof RegisterValues,
    value: string | boolean,
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const result = register(values.username, values.email, values.password);

    if (!result.ok) {
      setFormError(result.error ?? 'Unable to create your account.');
      return;
    }

    navigate('dashboard');
  };

  return (
    <AuthLayout
      footer={
        <>
          <span>Already have an account?</span>
          <button
            className="text-link"
            onClick={() => navigate('login')}
            type="button"
          >
            Sign in
          </button>
        </>
      }
      subtitle="Create your player identity and start climbing the ranks."
      title="Join the arena"
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <FormField
          autoComplete="username"
          error={errors.username}
          hint="Letters, numbers, dots, dashes and underscores."
          label="Username"
          onChange={(event) => updateField('username', event.target.value)}
          placeholder="rallylegend"
          type="text"
          value={values.username}
        />
        <FormField
          autoComplete="email"
          error={errors.email}
          label="Email address"
          onChange={(event) => updateField('email', event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={values.email}
        />
        <FormField
          autoComplete="new-password"
          endAdornment={
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="field-action"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          }
          error={errors.password}
          label="Password"
          onChange={(event) => updateField('password', event.target.value)}
          placeholder="At least 6 characters"
          type={showPassword ? 'text' : 'password'}
          value={values.password}
        />
        <FormField
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Confirm password"
          onChange={(event) =>
            updateField('confirmPassword', event.target.value)
          }
          placeholder="Repeat your password"
          type={showPassword ? 'text' : 'password'}
          value={values.confirmPassword}
        />

        <div className="checkbox-field">
          <label>
            <input
              checked={values.acceptTerms}
              onChange={(event) =>
                updateField('acceptTerms', event.target.checked)
              }
              type="checkbox"
            />
            <span>
              I agree to the fair play rules and community guidelines.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="field-error" role="alert">
              {errors.acceptTerms}
            </p>
          )}
        </div>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <Button fullWidth size="lg" type="submit">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;

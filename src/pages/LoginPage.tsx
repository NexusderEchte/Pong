import { useState, type FormEvent } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { Icon } from '../components/icons';
import { useAuth } from '../context/auth-context';
import { useHashRoute } from '../hooks/useHashRoute';
import {
  validateLogin,
  type FieldErrors,
  type LoginValues,
} from '../lib/validation';

const INITIAL_VALUES: LoginValues = {
  email: 'nova@pingpong.dev',
  password: 'pong1234',
};

function LoginPage() {
  const { login } = useAuth();
  const { navigate } = useHashRoute();
  const [values, setValues] = useState<LoginValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field: keyof LoginValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const result = login(values.email, values.password);

    if (!result.ok) {
      setFormError(result.error ?? 'Unable to sign in. Try again.');
      return;
    }

    navigate('dashboard');
  };

  return (
    <AuthLayout
      footer={
        <>
          <span>New to the arena?</span>
          <button
            className="text-link"
            onClick={() => navigate('register')}
            type="button"
          >
            Create an account
          </button>
        </>
      }
      subtitle="Sign in to pick up your paddle and continue your rally."
      title="Welcome back"
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
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
          autoComplete="current-password"
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

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <Button fullWidth size="lg" type="submit">
          Sign in
        </Button>

        <div className="demo-note">
          <span className="demo-note-icon">
            <Icon name="spark" size={16} />
          </span>
          <span>
            <strong>Demo mode</strong>
            Any valid email works. Use a password with at least 6 characters.
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;

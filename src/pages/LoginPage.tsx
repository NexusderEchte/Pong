import { useState, type FormEvent } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { ArrowRightIcon, LockIcon, MailIcon } from '../components/icons';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../lib/RouterContext';
import { isValidEmail } from '../lib/validation';

interface FormValues {
  email: string;
  password: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Please enter your password.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
}

function LoginPage() {
  const { login } = useAuth();
  const { navigate } = useRouter();
  const [values, setValues] = useState<FormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(values.email, values.password);

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      navigate('dashboard');
    } catch {
      setFormError('Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <header className="auth-card-head">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your account</h2>
          <p>Pick up where you left off and get back to the table.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<MailIcon />}
            value={values.email}
            error={errors.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<LockIcon />}
            value={values.password}
            error={errors.password}
            onChange={(event) => updateField('password', event.target.value)}
          />

          {formError ? (
            <p className="form-alert" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            Sign in
            <ArrowRightIcon />
          </Button>
        </form>

        <p className="auth-switch">
          New to the table?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('register')}
          >
            Create an account
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;

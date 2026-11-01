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

const DEMO_EMAIL = 'demo@pingpong.app';
const DEMO_PASSWORD = 'pong1234';

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

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const result = login(values.email, values.password);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    navigate('dashboard');
  };

  const fillDemoAccount = () => {
    setValues({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    setErrors({});
    setFormError('');
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

          <Button type="submit" size="lg" fullWidth>
            Sign in
            <ArrowRightIcon />
          </Button>
        </form>

        <div className="demo-credentials">
          <div>
            <span className="eyebrow">Demo access</span>
            <p>
              <code>{DEMO_EMAIL}</code>
              <span> / </span>
              <code>{DEMO_PASSWORD}</code>
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={fillDemoAccount}>
            Use demo account
          </Button>
        </div>

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

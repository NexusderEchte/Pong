import { useState, type FormEvent } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import {
  ArrowRightIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from '../components/icons';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../lib/RouterContext';
import { isValidEmail, isValidUsername } from '../lib/validation';

interface FormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const username = values.username.trim();

  if (!username) {
    errors.username = 'Please choose a username.';
  } else if (username.length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  } else if (username.length > 20) {
    errors.username = 'Username must be 20 characters or fewer.';
  } else if (!isValidUsername(username)) {
    errors.username = 'Use letters, numbers and underscores only.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Please create a password.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useRouter();
  const [values, setValues] = useState<FormValues>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    const result = register({
      username: values.username,
      email: values.email,
      password: values.password,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    navigate('dashboard');
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <header className="auth-card-head">
          <p className="eyebrow">Create your player card</p>
          <h2>Join the table</h2>
          <p>Set up a profile and start building your match record.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            type="text"
            name="username"
            autoComplete="username"
            placeholder="e.g. TopspinTom"
            icon={<UserIcon />}
            value={values.username}
            error={errors.username}
            onChange={(event) => updateField('username', event.target.value)}
          />
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            icon={<LockIcon />}
            value={values.password}
            error={errors.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
          <TextField
            label="Confirm password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your password"
            icon={<LockIcon />}
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) =>
              updateField('confirmPassword', event.target.value)
            }
          />

          {formError ? (
            <p className="form-alert" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" size="lg" fullWidth>
            Create account
            <ArrowRightIcon />
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('login')}
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;

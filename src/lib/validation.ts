export interface LoginValues {
  email: string;
  password: string;
}

export interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return 'Enter your email address.';
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Enter a valid email address.';
  }

  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Enter your password.';
  }

  if (password.length < 6) {
    return 'Use at least 6 characters.';
  }

  return undefined;
}

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};
  const emailError = validateEmail(values.email);
  const passwordError = validatePassword(values.password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

export function validateRegister(
  values: RegisterValues,
): FieldErrors<RegisterValues> {
  const errors: FieldErrors<RegisterValues> = {};
  const emailError = validateEmail(values.email);
  const passwordError = validatePassword(values.password);

  if (!values.username.trim()) {
    errors.username = 'Choose a username.';
  } else if (values.username.trim().length < 3) {
    errors.username = 'Use at least 3 characters.';
  } else if (!/^[a-zA-Z0-9._-]+$/.test(values.username.trim())) {
    errors.username = 'Use letters, numbers, dots, dashes or underscores.';
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!values.acceptTerms) {
    errors.acceptTerms = 'Accept the fair play rules to continue.';
  }

  return errors;
}

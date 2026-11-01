import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../hooks/useRoute';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const { navigate } = useRoute();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.',
      );
    }
  };

  return (
    <section className="section">
      <div className="auth-form">
        <Card>
          <h2>Willkommen zurück</h2>
          <p>
            Melden Sie sich an, um Ihr Profil und Ihre Statistiken zu sehen.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex.col"
            style={{ gap: '1rem' }}
          >
            <Input
              id="email"
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
            <Input
              id="password"
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && (
              <p className="input-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Anmelden...' : 'Anmelden'}
            </Button>
          </form>
          <p className="auth-footer">
            Noch kein Konto?{' '}
            <span
              onClick={() => navigate('register')}
              className="cursor-pointer text-primary underline underline-offset-4 hover:text-primary-hover"
            >
              Jetzt registrieren
            </span>
          </p>
        </Card>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '../hooks/useRoute';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const { navigate } = useRoute();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      navigate('dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.',
      );
    }
  };

  return (
    <section className="section">
      <div className="auth-form">
        <Card>
          <h2>Konto erstellen</h2>
          <p>Registrieren Sie sich, um Ihren Spielerprofil zu speichern.</p>
          <form
            onSubmit={handleSubmit}
            className="flex flex.col"
            style={{ gap: '1rem' }}
          >
            <Input
              id="username"
              label="Benutzername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="z. B. Nova"
              required
            />
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
              {loading ? 'Konto erstellen...' : 'Konto erstellen'}
            </Button>
          </form>
          <p className="auth-footer">
            Schon ein Konto?{' '}
            <span
              onClick={() => navigate('login')}
              className="cursor-pointer text-primary underline underline-offset-4 hover:text-primary-hover"
            >
              Jetzt anmelden
            </span>
          </p>
        </Card>
      </div>
    </section>
  );
}

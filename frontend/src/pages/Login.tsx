import { useState, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Field } from '../components/ui';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.includes('@')) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const u = await login(email.trim(), password);
      navigate(u.role === 'admin' ? '/admin' : '/app');
    } catch (err: any) {
      setErrors({ form: err.message });
    }
  };

  return (
    <main className="page-narrow">
      <div className="auth-box">
        <h1>Sign in</h1>
        <p className="muted">Enter your email and password to access WorkDesk.</p>
        <form onSubmit={handleSubmit} noValidate>
          {errors.form && <div className="notice err-box">{errors.form}</div>}
          <Field id="l-email" label="Email" error={errors.email}>
            <input id="l-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field id="l-pass" label="Password" error={errors.password}>
            <input id="l-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <div className="form-actions">
            <button className="btn">Sign in</button>
          </div>
        </form>
        <p className="demo-hint">
          New here? <Link to="/register">Create an account</Link>.<br />
          Demo admin: admin@workdesk.com / Password@123
        </p>
      </div>
    </main>
  );
}

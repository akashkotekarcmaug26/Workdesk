import { useState, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Field } from '../components/ui';

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.includes('@')) errs.email = 'Enter a valid email address';
    if (phone && !/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (confirm !== password) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await api('/auth/register', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), phone, password },
      });
      await login(email.trim(), password);
      navigate('/app');
    } catch (err: any) {
      setErrors({ form: err.message });
    }
  };

  return (
    <main className="page-narrow">
      <div className="auth-box">
        <h1>Create your account</h1>
        <p className="muted">New accounts start as employees.</p>
        <form onSubmit={handleSubmit} noValidate>
          {errors.form && <div className="notice err-box">{errors.form}</div>}
          <Field id="r-name" label="Full name" error={errors.name}>
            <input id="r-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field id="r-email" label="Email" error={errors.email}>
            <input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field id="r-phone" label="Mobile number (optional)" error={errors.phone}>
            <input id="r-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <div className="form-row">
            <Field id="r-pass" label="Password" error={errors.password} hint="At least 8 characters">
              <input id="r-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Field id="r-conf" label="Confirm password" error={errors.confirm}>
              <input id="r-conf" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </Field>
          </div>
          <div className="form-actions">
            <button className="btn">Create account</button>
          </div>
        </form>
        <p className="demo-hint">
          Already registered? <Link to="/login">Sign in</Link>.
        </p>
      </div>
    </main>
  );
}

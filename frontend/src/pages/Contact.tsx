import { useState, FormEvent } from 'react';
import { api } from '../api/client';
import { Field, useToast } from '../components/ui';

export default function Contact() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Enter your name (2+ characters)';
    if (!email.includes('@')) errs.email = 'Enter a valid email address';
    if (message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await api<{ message: string }>('/contact', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), message: message.trim() },
      });
      toast(res.message);
      setName('');
      setEmail('');
      setMessage('');
      setErrors({});
    } catch (err: any) {
      setErrors({ form: err.message });
    }
  };

  return (
    <main className="page-narrow">
      <div className="auth-box">
        <h1>Contact us</h1>
        <p className="muted">Send us a message and an admin will reply.</p>
        <form onSubmit={handleSubmit} noValidate>
          {errors.form && <div className="notice err-box">{errors.form}</div>}
          <Field id="c-name" label="Your name" error={errors.name}>
            <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field id="c-email" label="Email" error={errors.email}>
            <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field id="c-msg" label="Message" error={errors.message}>
            <textarea id="c-msg" value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
          <div className="form-actions">
            <button className="btn">Send message</button>
          </div>
        </form>
      </div>
    </main>
  );
}

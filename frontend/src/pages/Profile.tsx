import { useState, useEffect, FormEvent } from 'react';
import { api, useApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ErrorBox, Field, Loading, PageHeader, label, useToast } from '../components/ui';
import { User } from '../types';

export default function Profile() {
  const { updateUser } = useAuth();
  const toast = useToast();
  const { data: me, loading, error, reload } = useApi<User>('/auth/me');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (me) {
      setName(me.name);
      setPhone(me.phone || '');
    }
  }, [me]);

  if (loading) return <Loading />;
  if (error || !me) return <ErrorBox message={error || 'Unable to load profile'} onRetry={reload} />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (phone && !/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    await api('/auth/me', { method: 'PUT', body: { name: name.trim(), phone } });
    updateUser({ name: name.trim() });
    toast('Profile updated');
  };

  return (
    <>
      <PageHeader title="Profile" sub="Your name and contact number." />
      <section className="panel" style={{ maxWidth: 560 }}>
        <form className="panel-body" onSubmit={handleSubmit} noValidate>
          <Field id="p-email" label="Email">
            <input id="p-email" value={me.email} disabled />
          </Field>
          <Field id="p-role" label="Role">
            <input id="p-role" value={label(me.role)} disabled />
          </Field>
          <Field id="p-name" label="Full name" error={errors.name}>
            <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field id="p-phone" label="Mobile number" error={errors.phone}>
            <input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <div className="form-actions">
            <button className="btn">Save changes</button>
          </div>
        </form>
      </section>
    </>
  );
}

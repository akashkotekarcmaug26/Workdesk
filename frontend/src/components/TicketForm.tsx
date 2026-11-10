import { useState, FormEvent } from 'react';
import { api } from '../api/client';
import { Ticket } from '../types';
import { Field } from './ui';

export default function TicketForm({
  initial = {},
  onClose,
  onSaved,
}: {
  initial?: Partial<Ticket>;
  onClose: () => void;
  onSaved: (msg: string, id?: number) => void;
}) {
  const isNew = !initial.id;
  const [subject, setSubject] = useState(initial.subject || '');
  const [description, setDescription] = useState(initial.description || '');
  const [category, setCategory] = useState(initial.category || 'technical');
  const [priority, setPriority] = useState(initial.priority || 'medium');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (subject.trim().length < 5) errs.subject = 'Subject must be at least 5 characters';
    if (description.trim().length < 10) errs.description = 'Describe the issue in at least 10 characters';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await api<{ id?: number }>(isNew ? '/tickets' : `/tickets/${initial.id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: { subject: subject.trim(), description: description.trim(), category, priority },
      });
      onSaved(isNew ? 'Ticket raised' : 'Ticket updated', res.id);
    } catch (err: any) {
      setErrors({ form: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.form && <div className="notice err-box">{errors.form}</div>}
      <Field id="k-subject" label="Subject" error={errors.subject}>
        <input id="k-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field id="k-desc" label="Description" error={errors.description}>
        <textarea id="k-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="form-row">
        <Field id="k-cat" label="Category">
          <select id="k-cat" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            <option value="technical">Technical</option>
            <option value="hr">HR</option>
            <option value="payroll">Payroll</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field id="k-prio" label="Priority">
          <select id="k-prio" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn">{isNew ? 'Raise ticket' : 'Save changes'}</button>
      </div>
    </form>
  );
}

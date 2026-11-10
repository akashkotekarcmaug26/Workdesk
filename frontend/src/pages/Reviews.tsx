import { useState, FormEvent } from 'react';
import { api, useApi } from '../api/client';
import { currentPeriod } from '../utils/format';
import { Review, User } from '../types';
import {
  ConfirmButton,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Modal,
  PageHeader,
  useToast,
} from '../components/ui';

export default function Reviews() {
  const toast = useToast();
  const [editing, setEditing] = useState<Partial<Review> | null>(null);
  const [userId, setUserId] = useState<string | number>('');
  const [period, setPeriod] = useState(currentPeriod());
  const [rating, setRating] = useState<string | number>(4);
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading, error, reload } = useApi<Review[]>('/reviews');
  const { data: people } = useApi<User[]>('/employees?status=active');

  const openModal = (r: Partial<Review>) => {
    setEditing(r);
    setUserId(r.user_id || '');
    setPeriod(r.period || currentPeriod());
    setRating(r.rating || 4);
    setRemarks(r.remarks || '');
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isNew = !editing?.id;
    const errs: Record<string, string> = {};
    if (isNew && !userId) errs.userId = 'Choose an employee';
    if (!/^\d{4}-Q[1-4]$/.test(period)) errs.period = 'Use format YYYY-Q1..Q4 (e.g. 2026-Q3)';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await api(isNew ? '/reviews' : `/reviews/${editing!.id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: { user_id: Number(userId), period, rating: Number(rating), remarks },
      });
      setEditing(null);
      toast(isNew ? 'Review added' : 'Review updated');
      reload();
    } catch (err: any) {
      setErrors({ form: err.message });
    }
  };

  const remove = async (r: Review) => {
    await api(`/reviews/${r.id}`, { method: 'DELETE' });
    toast('Review deleted');
    reload();
  };

  return (
    <>
      <PageHeader title="Reviews" sub="Quarterly performance reviews.">
        <button type="button" className="btn" onClick={() => openModal({})}>Add review</button>
      </PageHeader>

      <section className="panel">
        {loading ? (
          <div className="panel-body"><Loading /></div>
        ) : error ? (
          <div className="panel-body"><ErrorBox message={error} onRetry={reload} /></div>
        ) : !data || data.length === 0 ? (
          <Empty title="No reviews yet" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Rating</th>
                  <th>Remarks</th>
                  <th>Reviewed by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td>{r.employee_name}</td>
                    <td>{r.period}</td>
                    <td><span className="rating">{r.rating}</span> / 5</td>
                    <td>{r.remarks || '—'}</td>
                    <td>{r.reviewer_name}</td>
                    <td className="row-actions">
                      <button type="button" className="btn-link" onClick={() => openModal(r)}>Edit</button>
                      <ConfirmButton onConfirm={() => remove(r)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <Modal title={editing.id ? 'Edit review' : 'Add review'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} noValidate>
            {errors.form && <div className="notice err-box">{errors.form}</div>}
            <Field id="v-emp" label="Employee" error={errors.userId}>
              <select id="v-emp" disabled={!!editing.id} value={userId} onChange={(e) => setUserId(e.target.value)}>
                <option value="">Choose an employee</option>
                {(people || []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <div className="form-row">
              <Field id="v-period" label="Period (e.g. 2026-Q3)" error={errors.period}>
                <input id="v-period" value={period} onChange={(e) => setPeriod(e.target.value)} />
              </Field>
              <Field id="v-rating" label="Rating">
                <select id="v-rating" value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="1">1 - Needs improvement</option>
                  <option value="2">2 - Below expectations</option>
                  <option value="3">3 - Meets expectations</option>
                  <option value="4">4 - Exceeds expectations</option>
                  <option value="5">5 - Outstanding</option>
                </select>
              </Field>
            </div>
            <Field id="v-remarks" label="Remarks">
              <textarea id="v-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </Field>
            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn">Save review</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

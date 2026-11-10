import { useState, FormEvent } from 'react';
import { api, useApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { fmtDate, today } from '../utils/format';
import { ImpactedTask, Leave, User } from '../types';
import {
  ConfirmButton,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Modal,
  PageHeader,
  Status,
  useToast,
} from '../components/ui';

export default function Leaves() {
  const { user } = useAuth();
  const admin = user?.role === 'admin';
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: leaves, loading, error, reload } = useApi<Leave[]>('/leaves');
  const { data: impacted, reload: reloadImpacted } = useApi<ImpactedTask[]>(
    admin ? '/leaves/impacted-tasks' : null
  );
  const { data: people } = useApi<User[]>(admin ? '/employees?status=active' : null);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (admin && !userId) errs.userId = 'Select an employee';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && endDate < startDate) errs.endDate = 'End date cannot be before start date';
    if (reason.trim().length < 3) errs.reason = 'Enter a brief reason (3+ characters)';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await api('/leaves', {
        method: 'POST',
        body: {
          user_id: admin && userId ? Number(userId) : undefined,
          start_date: startDate,
          end_date: endDate,
          reason: reason.trim(),
        },
      });
      setAdding(false);
      setReason('');
      setErrors({});
      toast('Leave saved');
      reload();
      if (admin) reloadImpacted();
    } catch (err: any) {
      setErrors({ form: err.message });
    }
  };

  const updateLeaveStatus = async (leaveId: number, status: string) => {
    await api(`/leaves/${leaveId}`, { method: 'PUT', body: { status } });
    toast(`Leave ${status}`);
    reload();
    if (admin) reloadImpacted();
  };

  const reassignTask = async (taskId: number, newUserId: number, newUserName: string) => {
    await api(`/tasks/${taskId}`, { method: 'PUT', body: { assigned_to: newUserId } });
    toast(`Reassigned to ${newUserName}`);
    reloadImpacted();
  };

  const removeLeave = async (id: number) => {
    await api(`/leaves/${id}`, { method: 'DELETE' });
    toast('Leave deleted');
    reload();
    if (admin) reloadImpacted();
  };

  return (
    <>
      <PageHeader title={admin ? 'Leaves & Task Reassignment' : 'My Leaves'}>
        <button type="button" className="btn" onClick={() => { setErrors({}); setAdding(true); }}>
          {admin ? 'Record employee leave' : 'Apply for leave'}
        </button>
      </PageHeader>

      {admin && impacted && impacted.length > 0 && (
        <section className="panel border-rose">
          <h2 className="text-rose">
            ⚠ Open Tasks of Employees on Leave ({impacted.length}) — Click to Reassign
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Employee on Leave</th>
                  <th>Story Points</th>
                  <th>Suggested Replacements</th>
                </tr>
              </thead>
              <tbody>
                {impacted.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.title}</strong></td>
                    <td>
                      <span className="overdue">{t.assigned_name}</span>
                      <span className="sub">{fmtDate(t.leave_start)} → {fmtDate(t.leave_end)}</span>
                    </td>
                    <td><strong>{t.story_points} pts</strong></td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {t.suggested_Candidates.map((cand) => (
                          <button
                            key={cand.id}
                            type="button"
                            onClick={() => reassignTask(t.id, cand.id, cand.name)}
                            className="btn-outline sm text-xs"
                          >
                            Assign to <strong>{cand.name}</strong> (
                            {cand.in_pool ? '★ In Pool' : `${cand.active_story_points}/${cand.max_capacity} pts`})
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Leave Requests</h2>
        {loading ? (
          <div className="panel-body"><Loading /></div>
        ) : error ? (
          <div className="panel-body"><ErrorBox message={error} onRetry={reload} /></div>
        ) : !leaves || leaves.length === 0 ? (
          <Empty title="No leave records" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {admin && <th>Employee</th>}
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id}>
                    {admin && <td><strong>{l.employee_name}</strong></td>}
                    <td>{fmtDate(l.start_date)} → {fmtDate(l.end_date)}</td>
                    <td>{l.reason}</td>
                    <td><Status value={l.status} /></td>
                    <td className="row-actions">
                      {admin && l.status === 'pending' && (
                        <>
                          <button type="button" className="btn-link" onClick={() => updateLeaveStatus(l.id, 'approved')}>
                            Approve
                          </button>
                          <button type="button" className="btn-link danger" onClick={() => updateLeaveStatus(l.id, 'rejected')}>
                            Reject
                          </button>
                        </>
                      )}
                      <ConfirmButton onConfirm={() => removeLeave(l.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {adding && (
        <Modal title="Leave Request" onClose={() => setAdding(false)}>
          <form onSubmit={handleCreate} noValidate>
            {errors.form && <div className="notice err-box">{errors.form}</div>}
            {admin && (
              <Field id="lv-user" label="Employee" error={errors.userId}>
                <select id="lv-user" value={userId} onChange={(e) => setUserId(e.target.value)}>
                  <option value="">Select employee</option>
                  {(people || [])
                    .filter((p) => p.role === 'employee')
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </Field>
            )}
            <div className="form-row">
              <Field id="lv-start" label="Start date" error={errors.startDate}>
                <input id="lv-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Field>
              <Field id="lv-end" label="End date" error={errors.endDate}>
                <input id="lv-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </Field>
            </div>
            <Field id="lv-reason" label="Reason" error={errors.reason}>
              <textarea id="lv-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={() => setAdding(false)}>Cancel</button>
              <button className="btn">Save leave</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

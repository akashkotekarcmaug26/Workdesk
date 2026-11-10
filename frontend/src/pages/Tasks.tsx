import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, useApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { fmtDate, toInputDate, today } from '../utils/format';
import { CandidateRecommendation, Task, User } from '../types';
import {
  ConfirmButton,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Modal,
  PageHeader,
  Status,
  label,
  useToast,
} from '../components/ui';

function TaskForm({
  initial,
  people,
  onClose,
  onSaved,
}: {
  initial: Partial<Task>;
  people: User[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isNew = !initial.id;
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [storyPoints, setStoryPoints] = useState(initial.story_points || 3);
  const [dueDate, setDueDate] = useState(toInputDate(initial.due_date));
  const [assignedTo, setAssignedTo] = useState<string | number>(initial.assigned_to || '');
  const [priority, setPriority] = useState(initial.priority || 'medium');
  const [status, setStatus] = useState(initial.status || 'pending');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: recommendations } = useApi<CandidateRecommendation[]>('/tasks/recommendations');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (title.trim().length < 3) errs.title = 'Task title must be at least 3 characters';
    if (!assignedTo) errs.assignedTo = 'Please select an employee to assign this task';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await api(isNew ? '/tasks' : `/tasks/${initial.id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: {
          title: title.trim(),
          description,
          story_points: Number(storyPoints),
          due_date: dueDate || null,
          assigned_to: Number(assignedTo),
          priority,
          status,
        },
      });
      onSaved(isNew ? 'Task created' : 'Task updated');
    } catch (err: any) {
      setErrors({ form: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.form && <div className="notice err-box">{errors.form}</div>}
      <Field id="t-title" label="Task title" error={errors.title}>
        <input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field id="t-desc" label="Description">
        <textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="form-row">
        <Field id="t-pts" label="Story Points (Effort)">
          <select id="t-pts" value={storyPoints} onChange={(e) => setStoryPoints(Number(e.target.value))}>
            <option value="1">1 pt (Quick fix)</option>
            <option value="2">2 pts (Small task)</option>
            <option value="3">3 pts (Standard task)</option>
            <option value="5">5 pts (Medium task)</option>
            <option value="8">8 pts (Large task)</option>
            <option value="13">13 pts (Very large task)</option>
          </select>
        </Field>
        <Field id="t-due" label="Due date">
          <input id="t-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="notice info-box text-xs mb-4">
          <div className="font-bold mb-1">Recommended Assignees (Free in Pool or Lowest Load):</div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {recommendations.slice(0, 4).map((rec) => (
              <button
                key={rec.id}
                type="button"
                onClick={() => setAssignedTo(rec.id)}
                className={`px-2 py-1 rounded border text-left ${
                  Number(assignedTo) === rec.id ? 'bg-ink text-white' : 'bg-white text-ink border-teal'
                }`}
              >
                <strong>{rec.name}</strong> ({label(rec.experience_level)}) •{' '}
                {rec.in_pool ? '★ In Pool (0 pts)' : `${rec.active_story_points}/${rec.max_capacity} pts`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="form-row">
        <Field id="t-assignee" label="Assign to" error={errors.assignedTo}>
          <select id="t-assignee" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">Choose a person</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.active_story_points || 0}/{p.max_capacity || 10} pts)
              </option>
            ))}
          </select>
        </Field>
        <Field id="t-prio" label="Priority">
          <select id="t-prio" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
      </div>

      <Field id="t-status" label="Status">
        <select id="t-status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </Field>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn">Save task</button>
      </div>
    </form>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const admin = user?.role === 'admin';
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<Partial<Task> | null>(null);

  useEffect(() => {
    const preselect = searchParams.get('assign_to');
    if (admin && preselect) {
      setEditing({ assigned_to: Number(preselect) });
      setSearchParams({}, { replace: true });
    }
  }, [admin, searchParams, setSearchParams]);

  const { data, loading, error, reload } = useApi<Task[]>('/tasks');
  const { data: people, reload: reloadPeople } = useApi<User[]>(admin ? '/employees?status=active' : null);

  const rows = (data || []).filter((t) => !statusFilter || t.status === statusFilter);

  const changeStatus = async (task: Task, next: string) => {
    try {
      await api(`/tasks/${task.id}`, { method: 'PUT', body: { status: next } });
      toast('Status updated');
      reload();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const remove = async (task: Task) => {
    try {
      await api(`/tasks/${task.id}`, { method: 'DELETE' });
      toast('Task deleted');
      reload();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <>
      <PageHeader title={admin ? 'Tasks & Story Points' : 'My Tasks'}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        {admin && <button type="button" className="btn" onClick={() => setEditing({})}>Add task</button>}
      </PageHeader>

      <section className="panel">
        {loading ? (
          <div className="panel-body"><Loading /></div>
        ) : error ? (
          <div className="panel-body"><ErrorBox message={error} onRetry={reload} /></div>
        ) : rows.length === 0 ? (
          <Empty title="No tasks found" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  {admin && <th>Assigned to</th>}
                  <th>Story Points</th>
                  <th>Priority</th>
                  <th>Due</th>
                  <th>Status</th>
                  {admin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const late = t.due_date && t.status !== 'completed' && t.due_date.slice(0, 10) < today();
                  return (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.title}</strong>
                        {t.description && <span className="sub">{t.description}</span>}
                      </td>
                      {admin && (
                        <td>
                          {t.assigned_name}
                          {t.assignee_on_leave && t.status !== 'completed' && (
                            <span className="sub overdue">⚠ On Leave</span>
                          )}
                        </td>
                      )}
                      <td><strong>{t.story_points || 3} pts</strong></td>
                      <td><Status value={t.priority} /></td>
                      <td className={late ? 'overdue' : ''}>{fmtDate(t.due_date)}</td>
                      <td>
                        {admin ? (
                          <Status value={t.status} />
                        ) : (
                          <select value={t.status} onChange={(e) => changeStatus(t, e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                      </td>
                      {admin && (
                        <td className="row-actions">
                          <button type="button" className="btn-link" onClick={() => setEditing(t)}>Edit / Reassign</button>
                          <ConfirmButton onConfirm={() => remove(t)} />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <Modal title={editing.id ? 'Edit task' : 'Add task'} onClose={() => setEditing(null)}>
          <TaskForm
            initial={editing}
            people={(people || []).filter((p) => p.role === 'employee')}
            onClose={() => setEditing(null)}
            onSaved={(msg) => {
              setEditing(null);
              toast(msg);
              reload();
              reloadPeople();
            }}
          />
        </Modal>
      )}
    </>
  );
}

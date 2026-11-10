import { useState, FormEvent } from 'react';
import { api, useApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
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

function EmployeeForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Partial<User>;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isNew = !initial.id;
  const [name, setName] = useState(initial.name || '');
  const [email, setEmail] = useState(initial.email || '');
  const [phone, setPhone] = useState(initial.phone || '');
  const [role, setRole] = useState(initial.role || 'employee');
  const [experienceLevel, setExperienceLevel] = useState(initial.experience_level || 'mid');
  const [status, setStatus] = useState(initial.status || 'active');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.includes('@')) errs.email = 'Enter a valid email address';
    if (phone && !/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (isNew && password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!isNew && password && password.length < 8) errs.password = 'New password must be at least 8 characters';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await api(isNew ? '/employees' : `/employees/${initial.id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: { name: name.trim(), email: email.trim(), phone, role, experience_level: experienceLevel, status, password },
      });
      onSaved(isNew ? 'Employee added' : 'Employee updated');
    } catch (err: any) {
      setErrors({ form: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.form && <div className="notice err-box">{errors.form}</div>}
      <div className="form-row">
        <Field id="e-name" label="Full name" error={errors.name}>
          <input id="e-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field id="e-email" label="Email" error={errors.email}>
          <input id="e-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
      </div>
      <div className="form-row">
        <Field id="e-phone" label="Mobile number" error={errors.phone}>
          <input id="e-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field id="e-level" label="Experience Level (Capacity)">
          <select id="e-level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value as any)}>
            <option value="junior">Junior (6 Story Pts max)</option>
            <option value="mid">Mid-level (10 Story Pts max)</option>
            <option value="senior">Senior (15 Story Pts max)</option>
          </select>
        </Field>
      </div>
      <div className="form-row">
        <Field id="e-role" label="Role">
          <select id="e-role" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Field id="e-status" label="Status">
          <select id="e-status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
      </div>
      <Field id="e-pass" label={isNew ? 'Password' : 'New password'} error={errors.password} hint={isNew ? '8+ characters' : 'Leave blank to keep current'}>
        <input id="e-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn">Save employee</button>
      </div>
    </form>
  );
}

export default function Employees() {
  const toast = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [poolFilter, setPoolFilter] = useState('all');
  const [editing, setEditing] = useState<Partial<User> | null>(null);

  const { data, loading, error, reload } = useApi<User[]>('/employees');

  const rows = (data || []).filter((emp) => {
    if (poolFilter === 'pool' && !emp.in_pool) return false;
    if (poolFilter === 'leave' && !emp.on_leave) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!emp.name.toLowerCase().includes(q) && !emp.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const remove = async (emp: User) => {
    try {
      await api(`/employees/${emp.id}`, { method: 'DELETE' });
      toast('Employee deleted');
      reload();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <>
      <PageHeader title="Employees & Resource Pool" sub="Manage employees, experience levels, and Bench Pool.">
        <input
          type="search"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={poolFilter} onChange={(e) => setPoolFilter(e.target.value)}>
          <option value="all">All Availability</option>
          <option value="pool">Available Bench Pool Only</option>
          <option value="leave">Currently On Leave</option>
        </select>
        <button type="button" className="btn" onClick={() => setEditing({})}>Add employee</button>
      </PageHeader>

      <section className="panel">
        {loading ? (
          <div className="panel-body"><Loading /></div>
        ) : error ? (
          <div className="panel-body"><ErrorBox message={error} onRetry={reload} /></div>
        ) : rows.length === 0 ? (
          <Empty title="No employees found" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Level & Role</th>
                  <th>Phone</th>
                  <th>Current Load (Story Points)</th>
                  <th>Pool / Leave Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      {emp.name}
                      <span className="sub">{emp.email}</span>
                    </td>
                    <td>
                      <strong>{label(emp.experience_level || 'mid')}</strong>
                      <span className="sub">{label(emp.role)}</span>
                    </td>
                    <td>{emp.phone || '—'}</td>
                    <td>
                      {emp.role === 'admin' ? (
                        <span className="muted">Admin</span>
                      ) : (
                        <>
                          <span>{emp.active_story_points || 0} / {emp.max_capacity || 10} pts ({emp.load_percentage || 0}%)</span>
                          <span className="sub">{emp.active_tasks_count || 0} active task(s)</span>
                        </>
                      )}
                    </td>
                    <td>
                      {emp.on_leave ? (
                        <span className="overdue font-semibold">On Approved Leave</span>
                      ) : emp.in_pool ? (
                        <span className="text-moss font-bold">In Available Bench Pool</span>
                      ) : (
                        <Status value={emp.status || 'active'} />
                      )}
                    </td>
                    <td className="row-actions">
                      <button type="button" className="btn-link" onClick={() => setEditing(emp)}>Edit</button>
                      {user && emp.id !== user.id && <ConfirmButton onConfirm={() => remove(emp)} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <Modal title={editing.id ? 'Edit employee' : 'Add employee'} onClose={() => setEditing(null)}>
          <EmployeeForm
            initial={editing}
            onClose={() => setEditing(null)}
            onSaved={(msg) => {
              setEditing(null);
              toast(msg);
              reload();
            }}
          />
        </Modal>
      )}
    </>
  );
}

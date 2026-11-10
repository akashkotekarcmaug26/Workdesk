import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Ticket } from '../types';
import { fmtDate } from '../utils/format';
import TicketForm from '../components/TicketForm';
import {
  Empty,
  ErrorBox,
  Loading,
  Modal,
  PageHeader,
  Status,
  label,
  useToast,
} from '../components/ui';

export default function Tickets() {
  const { user } = useAuth();
  const admin = user?.role === 'admin';
  const base = admin ? '/admin' : '/app';
  const toast = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [raising, setRaising] = useState(false);

  const queryPath = useMemo(() => {
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    if (priority) qs.set('priority', priority);
    return `/tickets?${qs}`;
  }, [status, priority]);

  const { data, loading, error, reload } = useApi<Ticket[]>(queryPath);

  return (
    <>
      <PageHeader
        title="Tickets"
        sub={
          admin
            ? 'Support requests from employees.'
            : 'Ask for help and follow the answer here.'
        }
      >
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          aria-label="Filter by priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button type="button" className="btn" onClick={() => setRaising(true)}>
          Raise ticket
        </button>
      </PageHeader>

      <section className="panel">
        {loading ? (
          <div className="panel-body">
            <Loading />
          </div>
        ) : error ? (
          <div className="panel-body">
            <ErrorBox message={error} onRetry={reload} />
          </div>
        ) : !data || data.length === 0 ? (
          <Empty title="No tickets found">
            {admin
              ? 'Nothing needs your attention.'
              : 'Raise a ticket if something is blocking you.'}
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  {admin && <th>Raised by</th>}
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`${base}/tickets/${t.id}`}>{t.subject}</Link>
                    </td>
                    {admin && <td>{t.raised_by_name}</td>}
                    <td>{label(t.category)}</td>
                    <td>
                      <Status value={t.priority} />
                    </td>
                    <td>
                      <Status value={t.status} />
                    </td>
                    <td>{fmtDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {raising && (
        <Modal title="Raise a ticket" onClose={() => setRaising(false)}>
          <TicketForm
            onClose={() => setRaising(false)}
            onSaved={(msg, id) => {
              setRaising(false);
              toast(msg);
              if (id) navigate(`${base}/tickets/${id}`);
              else reload();
            }}
          />
        </Modal>
      )}
    </>
  );
}

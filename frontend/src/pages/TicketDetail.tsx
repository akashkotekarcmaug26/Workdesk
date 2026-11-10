import { useState, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, useApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { fmtDate, fmtDateTime } from '../utils/format';
import { Ticket } from '../types';
import TicketForm from '../components/TicketForm';
import {
  ConfirmButton,
  ErrorBox,
  Field,
  Loading,
  Modal,
  PageHeader,
  Status,
  label,
  useToast,
} from '../components/ui';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const admin = user?.role === 'admin';
  const base = admin ? '/admin' : '/app';
  const toast = useToast();
  const navigate = useNavigate();
  const { data: t, loading, error, reload } = useApi<Ticket>(`/tickets/${id}`);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  if (loading) return <Loading />;
  if (error || !t) return <ErrorBox message={error || 'Ticket not found'} onRetry={reload} />;

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await api(`/tickets/${id}/messages`, { method: 'POST', body: { message } });
    setMessage('');
    reload();
  };

  const update = async (body: Record<string, any>, okMsg: string) => {
    await api(`/tickets/${id}`, { method: 'PUT', body });
    toast(okMsg);
    reload();
  };

  const remove = async () => {
    await api(`/tickets/${id}`, { method: 'DELETE' });
    toast('Ticket deleted');
    navigate(`${base}/tickets`);
  };

  return (
    <>
      <p><Link to={`${base}/tickets`}>Back to tickets</Link></p>
      <PageHeader title={t.subject}>
        {!admin && t.status === 'open' && (
          <button type="button" className="btn-outline" onClick={() => setEditing(true)}>Edit ticket</button>
        )}
        {!admin && t.status !== 'closed' && (
          <ConfirmButton confirmText="Yes, close it" onConfirm={() => update({ status: 'closed' }, 'Ticket closed')}>
            Close ticket
          </ConfirmButton>
        )}
        {admin && <ConfirmButton onConfirm={remove}>Delete ticket</ConfirmButton>}
      </PageHeader>

      <section className="panel">
        <div className="panel-body">
          <dl className="detail-grid">
            <div><dt>Raised by</dt><dd>{t.raised_by_name}</dd></div>
            <div><dt>Created</dt><dd>{fmtDate(t.created_at)}</dd></div>
            <div><dt>Category</dt><dd>{label(t.category)}</dd></div>
            <div><dt>Handled by</dt><dd>{t.assigned_admin_name || 'Not assigned yet'}</dd></div>
            {admin ? (
              <>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <select value={t.status} onChange={(e) => update({ status: e.target.value }, 'Status updated')}>
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>
                    <select value={t.priority} onChange={(e) => update({ priority: e.target.value }, 'Priority updated')}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </dd>
                </div>
              </>
            ) : (
              <>
                <div><dt>Status</dt><dd><Status value={t.status} /></dd></div>
                <div><dt>Priority</dt><dd><Status value={t.priority} /></dd></div>
              </>
            )}
          </dl>
          <p>{t.description}</p>
        </div>
      </section>

      <section className="panel">
        <h2>Conversation</h2>
        <div className="panel-body">
          {!t.messages || t.messages.length === 0 ? (
            <p className="muted">No messages yet.</p>
          ) : (
            <div className="thread">
              {t.messages.map((m) => (
                <div key={m.id} className={`msg${m.sender_role === 'admin' ? ' from-admin' : ''}`}>
                  <span className="who">{m.sender_name}</span>
                  <span className="when">{label(m.sender_role)}, {fmtDateTime(m.sent_at)}</span>
                  <p>{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {t.status !== 'closed' && (
          <form className="panel-body" onSubmit={sendMessage} style={{ borderTop: '1px solid var(--line)' }}>
            <Field id="td-msg" label={admin ? 'Reply' : 'Add a message'}>
              <textarea id="td-msg" required value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
            <div className="form-actions">
              <button className="btn">Send message</button>
            </div>
          </form>
        )}
      </section>

      {editing && (
        <Modal title="Edit ticket" onClose={() => setEditing(false)}>
          <TicketForm
            initial={t}
            onClose={() => setEditing(false)}
            onSaved={(msg) => {
              setEditing(false);
              toast(msg);
              reload();
            }}
          />
        </Modal>
      )}
    </>
  );
}

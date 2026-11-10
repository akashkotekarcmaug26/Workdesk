import { useCallback } from 'react';
import { api, useApi } from '../api/client';
import { ContactMessage } from '../types';
import { fmtDateTime } from '../utils/format';
import {
  ConfirmButton,
  Empty,
  ErrorBox,
  Loading,
  PageHeader,
  useToast,
} from '../components/ui';

export default function Messages() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi<ContactMessage[]>('/contact');

  const remove = useCallback(
    async (m: ContactMessage) => {
      try {
        await api(`/contact/${m.id}`, { method: 'DELETE' });
        toast('Message deleted');
        reload();
      } catch (err: any) {
        toast(err.message, 'error');
      }
    },
    [reload, toast]
  );

  return (
    <>
      <PageHeader title="Messages" sub="Messages sent through the Contact us page." />
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
          <Empty title="No messages yet">
            Messages from the public Contact us form will show up here.
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>Message</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {m.name}
                      <span className="sub">
                        <a href={`mailto:${m.email}`}>{m.email}</a>
                      </span>
                    </td>
                    <td>{m.message}</td>
                    <td>{fmtDateTime(m.created_at)}</td>
                    <td className="row-actions">
                      <ConfirmButton onConfirm={() => remove(m)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

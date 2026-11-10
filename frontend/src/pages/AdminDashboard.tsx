import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../api/client';
import { AdminStats } from '../types';
import { Bars, Empty, ErrorBox, Loading, PageHeader, Strip, label } from '../components/ui';

const TASK_COLORS = {
  pending: 'var(--amber)',
  in_progress: 'var(--teal)',
  completed: 'var(--moss)',
};
const TICKET_COLORS = {
  open: 'var(--amber)',
  in_progress: 'var(--teal)',
  resolved: 'var(--moss)',
  closed: '#9aa3b8',
};

export default function AdminDashboard() {
  const { data: s, loading, error, reload } = useApi<AdminStats>('/stats/admin');

  const summaryItems = useMemo(() => {
    if (!s) return [];
    const openTasks = (s.tasks.pending || 0) + (s.tasks.in_progress || 0);
    const openTickets = (s.tickets.open || 0) + (s.tickets.in_progress || 0);
    return [
      { label: 'Employees', value: s.employees.total, note: `${s.employees.active} active` },
      {
        label: 'Available Bench Pool',
        value: s.available_pool?.length || 0,
        note: '0 active tasks & not on leave',
      },
      { label: 'Open tasks', value: openTasks },
      { label: 'Overdue tasks', value: s.overdue_tasks },
      { label: 'Open tickets', value: openTickets },
      {
        label: 'Average rating',
        value: s.avg_rating ?? '—',
        note: s.avg_rating ? 'out of 5' : 'No reviews yet',
      },
    ];
  }, [s]);

  if (loading) return <Loading />;
  if (error || !s) return <ErrorBox message={error || 'Unable to load stats'} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Load & Resource Overview"
        sub="Real-time story point workload, available bench pool, and leave status."
      >
        <Link to="/admin/tasks" className="btn">
          Assign Task
        </Link>
        <Link to="/admin/leaves" className="btn-outline">
          Leaves & Reassign
        </Link>
      </PageHeader>

      <Strip items={summaryItems} />

      <div className="two-col">
        <section className="panel">
          <h2>Available Resource Pool (Bench — Who have 0 Active Tasks)</h2>
          {!s.available_pool || s.available_pool.length === 0 ? (
            <Empty title="No employees idle in the pool">
              Every active employee currently has assigned tasks or is on leave.
            </Empty>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Level</th>
                    <th>Capacity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {s.available_pool.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <strong>{emp.name}</strong>
                      </td>
                      <td>{label(emp.experience_level)}</td>
                      <td>0 / {emp.max_capacity} pts (Free)</td>
                      <td>
                        <Link to={`/admin/tasks?assign_to=${emp.id}`} className="btn-link">
                          Assign task →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Employee Story-Point Load</h2>
          {!s.workload_overview || s.workload_overview.length === 0 ? (
            <Empty title="No active employees" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Active Tasks</th>
                    <th>Story Points Load</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {s.workload_overview.map((w) => {
                    const overloaded = w.load_percentage > 100;
                    return (
                      <tr key={w.id}>
                        <td>
                          {w.name}
                          <span className="sub">{label(w.experience_level)}</span>
                        </td>
                        <td>{w.active_tasks_count} task(s)</td>
                        <td>
                          <strong className={overloaded ? 'overdue' : ''}>
                            {w.active_story_points} / {w.max_capacity} pts ({w.load_percentage}%)
                          </strong>
                          <div className="bar-track mt-1">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${Math.min(100,w.load_percentage)}%`,
                                background: overloaded
                                  ? 'var(--rose)'
                                  : w.load_percentage > 75
                                  ? 'var(--amber)'
                                  : 'var(--teal)',
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          {w.on_leave ? (
                            <span className="overdue text-xs font-bold">On Leave</span>
                          ) : w.in_pool ? (
                            <span className="text-xs font-bold text-moss">In Available Pool</span>
                          ) : overloaded ? (
                            <span className="overdue text-xs font-bold">Overloaded</span>
                          ) : (
                            <span className="text-xs text-slate">Working</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="two-col" style={{ marginTop: '1.4rem' }}>
        <section className="panel">
          <h2>Tasks by status</h2>
          <div className="panel-body">
            <Bars
              data={s.tasks}
              order={['pending', 'in_progress', 'completed']}
              colors={TASK_COLORS}
            />
          </div>
        </section>
        <section className="panel">
          <h2>Tickets by status</h2>
          <div className="panel-body">
            <Bars
              data={s.tickets}
              order={['open', 'in_progress', 'resolved', 'closed']}
              colors={TICKET_COLORS}
            />
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: '1.4rem' }}>
        <h2>Top Performers (By Story Points Completed)</h2>
        {s.top_performers.length === 0 ? (
          <div className="panel-body muted">
            No completed tasks yet. Assign tasks from the <Link to="/admin/tasks">Tasks</Link> page.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Level</th>
                  <th>Completed Story Points</th>
                  <th>Completed Tasks</th>
                </tr>
              </thead>
              <tbody>
                {s.top_performers.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{label(p.experience_level || 'mid')}</td>
                    <td>
                      <strong>{p.completed_points} pts</strong>
                    </td>
                    <td>{p.completed}</td>
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

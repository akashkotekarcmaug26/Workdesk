import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { EmployeeStats, Task } from '../types';
import { fmtDate, today } from '../utils/format';
import { Empty, ErrorBox, Loading, PageHeader, Status, Strip, label } from '../components/ui';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const stats = useApi<EmployeeStats>('/stats/me');
  const tasks = useApi<Task[]>('/tasks');

  const open = useMemo(
    () => (tasks.data || []).filter((t) => t.status !== 'completed').slice(0, 5),
    [tasks.data]
  );

  if (stats.loading || tasks.loading) return <Loading />;
  if (stats.error || tasks.error || !stats.data)
    return (
      <ErrorBox
        message={stats.error || tasks.error || 'Failed to load dashboard'}
        onRetry={() => {
          stats.reload();
          tasks.reload();
        }}
      />
    );

  const s = stats.data;
  const openTasksCount = (s.tasks.pending || 0) + (s.tasks.in_progress || 0);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user ? user.name.split(' ')[0] : ''}`}
        sub={`Experience Level: ${label(s.experience_level)}`}
      >
        <Link to="/app/leaves" className="btn-outline">
          Apply for Leave
        </Link>
      </PageHeader>

      <Strip
        items={[
          {
            label: 'Story Points Load',
            value: `${s.active_story_points} / ${s.max_capacity} pts`,
            note: openTasksCount === 0 ? '★ In Available Pool' : `${s.load_percentage}% capacity`,
          },
          { label: 'Active Tasks', value: openTasksCount },
          {
            label: 'Completed Points',
            value: `${s.completed_story_points} pts`,
            note: `${s.tasks.completed || 0} task(s)`,
          },
          { label: 'Completion rate', value: `${s.completion_rate}%` },
          {
            label: 'Average rating',
            value: s.avg_rating ?? '—',
            note: s.avg_rating ? 'out of 5' : 'No reviews yet',
          },
        ]}
      />

      <section className="panel">
        <h2>Next up</h2>
        {open.length === 0 ? (
          <Empty title="You are all caught up (In Available Bench Pool)">
            You have 0 active tasks right now. New tasks from an admin will show up here.
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Story Points</th>
                  <th>Priority</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {open.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.title}</strong>
                    </td>
                    <td>
                      <strong>{t.story_points} pts</strong>
                    </td>
                    <td>
                      <Status value={t.priority} />
                    </td>
                    <td
                      className={
                        t.due_date && t.due_date.slice(0, 10) < today() ? 'overdue' : ''
                      }
                    >
                      {fmtDate(t.due_date)}
                    </td>
                    <td>
                      <Status value={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="panel-body">
          <Link to="/app/tasks">See all my tasks</Link>
        </div>
      </section>
    </>
  );
}

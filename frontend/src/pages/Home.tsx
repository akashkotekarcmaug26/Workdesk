import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../api/client';
import { PublicQueueResponse } from '../types';
import { Status } from '../components/ui';

const FALLBACK_ITEMS: PublicQueueResponse['items'] = [
  {
    id: 'task-1',
    kind: 'task',
    title: 'Build login & JWT module',
    meta: '8 pts • Assigned to Riya Sharma',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: 'task-2',
    kind: 'task',
    title: 'Design database schema',
    meta: '5 pts • Assigned to Riya Sharma',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'ticket-1',
    kind: 'ticket',
    title: 'Laptop not booting',
    meta: 'Support (technical) • Raised by Riya Sharma',
    status: 'open',
    priority: 'high',
  },
];

export default function Home() {
  const { data, loading, reload } = useApi<PublicQueueResponse>('/stats/public');
  const [filter, setFilter] = useState<'all' | 'task' | 'ticket'>('all');

  const items = useMemo(() => {
    const source = data?.items && data.items.length > 0 ? data.items : FALLBACK_ITEMS;
    if (filter === 'all') return source;
    return source.filter((i) => i.kind === filter);
  }, [data, filter]);

  const poolCount = data?.available_pool_count ?? 2;
  const leaveCount = data?.upcoming_leaves_count ?? 1;

  return (
    <main className="wrap">
      <section className="hero">
        <div>
          <h1>Smart load balancing, tasks & leaves on one desk.</h1>
          <p className="lead">
            WorkDesk tracks employee workload using story points, automatically places free
            employees into the Available Resource Pool, and suggests smart task reassignments when
            employees go on leave.
          </p>
          <div className="cta">
            <Link className="btn" to="/register">
              Create account
            </Link>
            <Link className="btn-outline" to="/login">
              Sign in
            </Link>
          </div>
        </div>

        <div className="queue" aria-label="Live desk queue">
          <div className="queue-head items-center">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
              <span>Today's Live Queue</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded ${
                  filter === 'all' ? 'bg-ink text-white' : 'bg-paper text-ink'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('task')}
                className={`px-2 py-0.5 rounded ${
                  filter === 'task' ? 'bg-ink text-white' : 'bg-paper text-ink'
                }`}
              >
                Tasks
              </button>
              <button
                type="button"
                onClick={() => setFilter('ticket')}
                className={`px-2 py-0.5 rounded ${
                  filter === 'ticket' ? 'bg-ink text-white' : 'bg-paper text-ink'
                }`}
              >
                Tickets
              </button>
              <button
                type="button"
                onClick={reload}
                className="btn-link text-xs ml-1"
                title="Refresh live queue"
              >
                {loading ? '…' : '↻'}
              </button>
            </div>
          </div>

          {items.map((item) => (
            <div className="queue-row" key={item.id}>
              <div className="flex justify-between items-center gap-2">
                <strong>{item.title}</strong>
                <span className="text-xs uppercase font-bold px-1.5 py-0.5 rounded bg-paper text-slate">
                  {item.kind}
                </span>
              </div>
              <div className="meta">
                <span>{item.meta}</span>
                <Status value={item.status} />
              </div>
            </div>
          ))}

          <div className="queue-row bg-teal-tint/40">
            <div className="flex justify-between items-center text-sm font-semibold text-teal-dark">
              <span>Available Bench Pool: {poolCount} free</span>
              <span>Employees on Leave: {leaveCount}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="split">
        <div>
          <h2>For admins</h2>
          <ul>
            <li>Assign tasks weighted by Story Points (1–21) and Experience Level (Junior/Mid/Senior).</li>
            <li>See real-time employee story-point load before assigning work.</li>
            <li>View the Available Bench Pool of employees with zero active tasks.</li>
            <li>Approve leaves and auto-reassign impacted tasks to free or low-load employees.</li>
          </ul>
        </div>
        <div>
          <h2>For employees</h2>
          <ul>
            <li>Fair workload visibility based on story points rather than raw task count.</li>
            <li>Apply for leaves so your admin can rebalance active tasks automatically.</li>
            <li>Update task status, raise support tickets, and read performance reviews.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

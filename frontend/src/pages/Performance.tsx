import { useApi } from '../api/client';
import { EmployeeStats, Review } from '../types';
import { fmtDate } from '../utils/format';
import { Bars, Empty, ErrorBox, Loading, PageHeader, Strip, label } from '../components/ui';

export default function Performance() {
  const stats = useApi<EmployeeStats>('/stats/me');
  const reviews = useApi<Review[]>('/reviews');
  if (stats.loading || reviews.loading) return <Loading />;
  if (stats.error || reviews.error || !stats.data)
    return (
      <ErrorBox
        message={stats.error || reviews.error || 'Failed to load performance'}
        onRetry={() => {
          stats.reload();
          reviews.reload();
        }}
      />
    );
  const s = stats.data;
  const revList = reviews.data || [];

  return (
    <>
      <PageHeader
        title="Performance & Workload Fairness"
        sub="Your progress weighted by Story Points and Experience Level."
      />
      <Strip
        items={[
          {
            label: 'Current Story Point Load',
            value: `${s.active_story_points} / ${s.max_capacity} pts`,
            note: `${s.load_percentage}% of ${label(s.experience_level)} capacity`,
          },
          {
            label: 'Story Points Delivered',
            value: `${s.completed_story_points} pts`,
            note: `${s.tasks.completed || 0} completed tasks`,
          },
          { label: 'Completion rate', value: `${s.completion_rate}%`, note: 'of assigned tasks' },
          {
            label: 'Average rating',
            value: s.avg_rating ?? '—',
            note: s.avg_rating ? 'out of 5' : 'No reviews yet',
          },
        ]}
      />

      <div className="two-col">
        <section className="panel">
          <h2>My tasks by status</h2>
          <div className="panel-body">
            <Bars
              data={s.tasks}
              order={['pending', 'in_progress', 'completed']}
              colors={{
                pending: 'var(--amber)',
                in_progress: 'var(--teal)',
                completed: 'var(--moss)',
              }}
            />
          </div>
        </section>
        <section className="panel">
          <h2>Reviews</h2>
          {revList.length === 0 ? (
            <Empty title="No reviews yet">Reviews from your admin will appear here.</Empty>
          ) : (
            <div className="panel-body thread">
              {revList.map((r) => (
                <div className="msg" key={r.id}>
                  <span className="who">{r.period}</span>
                  <span className="when">
                    Rated {r.rating} out of 5 by {r.reviewer_name}, {fmtDate(r.created_at)}
                  </span>
                  <p>{r.remarks || 'No remarks.'}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

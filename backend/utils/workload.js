import db from '../config/db.js';

const CAPACITY = { senior: 15, mid: 10, junior: 6 };

export async function getEmployeesWithWorkload() {
  const [users] = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.status, u.experience_level, u.created_at, r.name AS role
     FROM users u JOIN roles r ON r.id = u.role_id ORDER BY u.id`
  );
  const [tasks] = await db.query('SELECT assigned_to, story_points, status FROM tasks');
  const [leaves] = await db.query(
    "SELECT user_id, end_date FROM leaves WHERE status = 'approved' AND end_date >= CURDATE()"
  );

  return users.map((u) => {
    const myTasks = tasks.filter((t) => t.assigned_to === u.id);
    const openTasks = myTasks.filter((t) => t.status !== 'completed');
    const doneTasks = myTasks.filter((t) => t.status === 'completed');

    const activePts = openTasks.reduce((sum, t) => sum + Number(t.story_points || 0), 0);
    const completedPts = doneTasks.reduce((sum, t) => sum + Number(t.story_points || 0), 0);
    const maxCap = CAPACITY[u.experience_level] || 10;
    const loadPct = Math.round((activePts / maxCap) * 100);

    const activeLeave = leaves.find((l) => l.user_id === u.id);
    const onLeave = Boolean(activeLeave);
    const inPool = u.role === 'employee' && u.status === 'active' && openTasks.length === 0 && !onLeave;

    return {
      ...u,
      active_story_points: activePts,
      active_tasks_count: openTasks.length,
      completed_story_points: completedPts,
      max_capacity: maxCap,
      load_percentage: loadPct,
      on_leave: onLeave,
      in_pool: inPool,
    };
  });
}

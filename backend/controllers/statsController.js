import db from '../config/db.js';
import { getEmployeesWithWorkload } from '../utils/workload.js';

const toMap = (rows) => Object.fromEntries(rows.map((r) => [r.k, Number(r.n)]));

export const publicQueue = async (req, res, next) => {
  try {
    const [tasks] = await db.query(
      `SELECT t.id, t.title, t.priority, t.story_points, t.status, u.name AS person_name
       FROM tasks t JOIN users u ON u.id = t.assigned_to ORDER BY t.id DESC LIMIT 3`
    );
    const [tickets] = await db.query(
      `SELECT k.id, k.subject, k.category, k.priority, k.status, u.name AS person_name
       FROM tickets k JOIN users u ON u.id = k.raised_by ORDER BY k.id DESC LIMIT 2`
    );

    const allUsers = await getEmployeesWithWorkload();
    const employees = allUsers.filter((u) => u.role === 'employee' && u.status === 'active');

    const items = [
      ...tasks.map((t) => ({
        id: `task-${t.id}`,
        kind: 'task',
        title: t.title,
        meta: `${t.story_points} pts • Assigned to ${t.person_name}`,
        status: t.status,
        priority: t.priority,
      })),
      ...tickets.map((k) => ({
        id: `ticket-${k.id}`,
        kind: 'ticket',
        title: k.subject,
        meta: `Support (${k.category}) • Raised by ${k.person_name}`,
        status: k.status,
        priority: k.priority,
      })),
    ].slice(0, 4);

    res.json({
      items,
      available_pool_count: employees.filter((u) => u.in_pool).length,
      upcoming_leaves_count: employees.filter((u) => u.on_leave).length,
      updated_at: new Date().toISOString(),
    });
  } catch (err) { next(err); }
};

export const admin = async (req, res, next) => {
  try {
    const [tasks] = await db.query('SELECT status AS k, COUNT(*) AS n FROM tasks GROUP BY status');
    const [tickets] = await db.query('SELECT status AS k, COUNT(*) AS n FROM tickets GROUP BY status');
    const [[overdue]] = await db.query("SELECT COUNT(*) AS n FROM tasks WHERE due_date < CURDATE() AND status <> 'completed'");
    const [[avg]] = await db.query('SELECT ROUND(AVG(rating), 2) AS avg_rating FROM performance_reviews');

    const allUsers = await getEmployeesWithWorkload();
    const allEmployees = allUsers.filter((u) => u.role === 'employee');
    const activeEmployees = allEmployees.filter((u) => u.status === 'active');

    const topPerformers = [...activeEmployees]
      .filter((u) => u.completed_story_points > 0)
      .sort((a, b) => b.completed_story_points - a.completed_story_points)
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        name: u.name,
        experience_level: u.experience_level,
        completed_points: u.completed_story_points,
        completed: 1,
      }));

    res.json({
      employees: { total: allEmployees.length, active: activeEmployees.length },
      tasks: toMap(tasks),
      tickets: toMap(tickets),
      overdue_tasks: Number(overdue.n),
      avg_rating: avg.avg_rating ? Number(avg.avg_rating) : null,
      top_performers: topPerformers,
      available_pool: activeEmployees.filter((e) => e.in_pool),
      workload_overview: activeEmployees,
    });
  } catch (err) { next(err); }
};

export const me = async (req, res, next) => {
  try {
    const [tasks] = await db.query('SELECT status AS k, COUNT(*) AS n FROM tasks WHERE assigned_to = ? GROUP BY status', [req.user.id]);
    const [tickets] = await db.query('SELECT status AS k, COUNT(*) AS n FROM tickets WHERE raised_by = ? GROUP BY status', [req.user.id]);
    const [[avg]] = await db.query('SELECT ROUND(AVG(rating), 2) AS avg_rating FROM performance_reviews WHERE user_id = ?', [req.user.id]);

    const allUsers = await getEmployeesWithWorkload();
    const meUser = allUsers.find((u) => u.id === req.user.id);

    const t = toMap(tasks);
    const total = (t.pending || 0) + (t.in_progress || 0) + (t.completed || 0);

    res.json({
      tasks: t,
      tickets: toMap(tickets),
      completion_rate: total ? Math.round(((t.completed || 0) / total) * 100) : 0,
      avg_rating: avg.avg_rating ? Number(avg.avg_rating) : null,
      experience_level: meUser?.experience_level || 'mid',
      active_story_points: meUser?.active_story_points || 0,
      completed_story_points: meUser?.completed_story_points || 0,
      max_capacity: meUser?.max_capacity || 10,
      load_percentage: meUser?.load_percentage || 0,
    });
  } catch (err) { next(err); }
};

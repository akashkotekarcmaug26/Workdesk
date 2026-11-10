import db from '../config/db.js';
import { getEmployeesWithWorkload } from '../utils/workload.js';

export const list = async (req, res, next) => {
  try {
    let sql = `SELECT l.*, u.name AS employee_name, u.experience_level
               FROM leaves l JOIN users u ON u.id = l.user_id`;
    const params = [];
    if (req.user.role !== 'admin') {
      sql += ' WHERE l.user_id = ?';
      params.push(req.user.id);
    }
    sql += ' ORDER BY l.start_date DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { start_date, end_date, reason, user_id } = req.body;
    const targetUser = req.user.role === 'admin' && user_id ? user_id : req.user.id;
    const status = req.user.role === 'admin' ? 'approved' : 'pending';
    await db.query(
      'INSERT INTO leaves (user_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)',
      [targetUser, start_date, end_date, reason, status]
    );
    res.status(201).json({ message: 'Leave saved' });
  } catch (err) { next(err); }
};

export const updateStatus = async (req, res, next) => {
  try {
    await db.query('UPDATE leaves SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ message: 'Leave status updated' });
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM leaves WHERE id = ?', [req.params.id]);
    res.json({ message: 'Leave deleted' });
  } catch (err) { next(err); }
};

export const impactedTasks = async (req, res, next) => {
  try {
    const [tasks] = await db.query(
      `SELECT t.*, u.name AS assigned_name, l.start_date AS leave_start, l.end_date AS leave_end, l.reason AS leave_reason
       FROM tasks t
       JOIN users u ON u.id = t.assigned_to
       JOIN leaves l ON l.user_id = u.id
       WHERE t.status <> 'completed' AND l.status = 'approved' AND l.end_date >= CURDATE()`
    );

    const allUsers = await getEmployeesWithWorkload();
    const candidates = allUsers
      .filter((u) => u.role === 'employee' && u.status === 'active' && !u.on_leave)
      .sort((a, b) => (a.in_pool !== b.in_pool ? (a.in_pool ? -1 : 1) : a.load_percentage - b.load_percentage));

    res.json(
      tasks.map((t) => ({
        ...t,
        suggested_Candidates: candidates.filter((c) => c.id !== t.assigned_to).slice(0, 3),
      }))
    );
  } catch (err) { next(err); }
};

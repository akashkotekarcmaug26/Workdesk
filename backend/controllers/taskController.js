import db from '../config/db.js';
import { getEmployeesWithWorkload } from '../utils/workload.js';

export const list = async (req, res, next) => {
  try {
    let sql = `SELECT t.*, a.name AS assigned_name, a.experience_level AS assigned_level, c.name AS created_name
               FROM tasks t
               JOIN users a ON a.id = t.assigned_to
               JOIN users c ON c.id = t.created_by`;
    const params = [];

    if (req.user.role !== 'admin') {
      sql += ' WHERE t.assigned_to = ?';
      params.push(req.user.id);
    }
    sql += ' ORDER BY t.due_date IS NULL, t.due_date';

    let [rows] = await db.query(sql, params);
    if (req.query.status) rows = rows.filter((t) => t.status === req.query.status);
    if (req.query.priority) rows = rows.filter((t) => t.priority === req.query.priority);
    if (req.query.assigned_to) rows = rows.filter((t) => t.assigned_to === Number(req.query.assigned_to));

    const [leaves] = await db.query("SELECT user_id FROM leaves WHERE status = 'approved' AND end_date >= CURDATE()");
    const onLeaveIds = leaves.map((l) => l.user_id);

    res.json(rows.map((r) => ({ ...r, assignee_on_leave: onLeaveIds.includes(r.assigned_to) })));
  } catch (err) { next(err); }
};

export const recommendAssignees = async (req, res, next) => {
  try {
    const allUsers = await getEmployeesWithWorkload();
    const candidates = allUsers
      .filter((u) => u.role === 'employee' && u.status === 'active')
      .sort((a, b) => {
        if (a.on_leave !== b.on_leave) return a.on_leave ? 1 : -1;
        if (a.in_pool !== b.in_pool) return a.in_pool ? -1 : 1;
        return a.load_percentage - b.load_percentage;
      });
    res.json(candidates);
  } catch (err) { next(err); }
};

export const getOne = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { title, description, priority, story_points, status, due_date, assigned_to } = req.body;
    const [r] = await db.query(
      `INSERT INTO tasks (title, description, priority, story_points, status, due_date, assigned_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, priority || 'medium', story_points || 3, status || 'pending', due_date || null, assigned_to, req.user.id]
    );
    res.status(201).json({ message: 'Task created', id: r.insertId });
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (req.user.role !== 'admin') {
      await db.query('UPDATE tasks SET status = ? WHERE id = ? AND assigned_to = ?', [req.body.status, id, req.user.id]);
      return res.json({ message: 'Status updated' });
    }
    if (req.body.assigned_to && !req.body.title) {
      await db.query('UPDATE tasks SET assigned_to = ? WHERE id = ?', [req.body.assigned_to, id]);
      return res.json({ message: 'Task reassigned' });
    }
    const { title, description, priority, story_points, status, due_date, assigned_to } = req.body;
    await db.query(
      `UPDATE tasks SET title = ?, description = ?, priority = ?, story_points = ?, status = ?, due_date = ?, assigned_to = ?
       WHERE id = ?`,
      [title, description || null, priority, story_points, status, due_date || null, assigned_to, id]
    );
    res.json({ message: 'Task updated' });
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

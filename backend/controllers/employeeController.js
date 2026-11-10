import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { getEmployeesWithWorkload } from '../utils/workload.js';

export const list = async (req, res, next) => {
  try {
    let rows = await getEmployeesWithWorkload();
    if (req.query.status) rows = rows.filter((u) => u.status === req.query.status);
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      rows = rows.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    res.json(rows);
  } catch (err) { next(err); }
};

export const getOne = async (req, res, next) => {
  try {
    const rows = await getEmployeesWithWorkload();
    const emp = rows.find((u) => u.id === Number(req.params.id));
    res.json(emp);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, experience_level, status } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role_id, experience_level, status)
       VALUES (?, ?, ?, ?, (SELECT id FROM roles WHERE name = ?), ?, ?)`,
      [name, email, hash, phone || null, role || 'employee', experience_level || 'mid', status || 'active']
    );
    res.status(201).json({ message: 'Employee created', id: r.insertId });
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const { name, email, phone, role, experience_level, status, password } = req.body;
    const id = req.params.id;

    await db.query(
      `UPDATE users SET name = ?, email = ?, phone = ?,
       role_id = (SELECT id FROM roles WHERE name = ?),
       experience_level = ?, status = ? WHERE id = ?`,
      [name, email, phone || null, role || 'employee', experience_level || 'mid', status || 'active', id]
    );

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
    }
    res.json({ message: 'Employee updated' });
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deleted' });
  } catch (err) { next(err); }
};

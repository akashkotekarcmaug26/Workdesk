import db from '../config/db.js';

export const create = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    await db.query('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
    res.status(201).json({ message: 'Thanks! We will get back to you soon.' });
  } catch (err) { next(err); }
};

export const list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message deleted' });
  } catch (err) { next(err); }
};

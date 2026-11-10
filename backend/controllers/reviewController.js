import db from '../config/db.js';

export const list = async (req, res, next) => {
  try {
    let sql = `SELECT p.*, u.name AS employee_name, rv.name AS reviewer_name
               FROM performance_reviews p
               JOIN users u ON u.id = p.user_id
               JOIN users rv ON rv.id = p.reviewed_by`;
    const params = [];
    if (req.user.role !== 'admin') {
      sql += ' WHERE p.user_id = ?';
      params.push(req.user.id);
    } else if (req.query.user_id) {
      sql += ' WHERE p.user_id = ?';
      params.push(req.query.user_id);
    }
    sql += ' ORDER BY p.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

export const getOne = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM performance_reviews WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { user_id, period, rating, remarks } = req.body;
    await db.query(
      'INSERT INTO performance_reviews (user_id, reviewed_by, period, rating, remarks) VALUES (?, ?, ?, ?, ?)',
      [user_id, req.user.id, period, rating, remarks || null]
    );
    res.status(201).json({ message: 'Review added' });
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const { period, rating, remarks } = req.body;
    await db.query(
      'UPDATE performance_reviews SET period = ?, rating = ?, remarks = ? WHERE id = ?',
      [period, rating, remarks || null, req.params.id]
    );
    res.json({ message: 'Review updated' });
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM performance_reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) { next(err); }
};

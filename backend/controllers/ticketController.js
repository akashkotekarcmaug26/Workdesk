import db from '../config/db.js';

export const list = async (req, res, next) => {
  try {
    let sql = `SELECT t.*, u.name AS raised_by_name, a.name AS assigned_admin_name
               FROM tickets t
               JOIN users u ON u.id = t.raised_by
               LEFT JOIN users a ON a.id = t.assigned_admin`;
    const params = [];
    if (req.user.role !== 'admin') {
      sql += ' WHERE t.raised_by = ?';
      params.push(req.user.id);
    }
    sql += ' ORDER BY t.created_at DESC';

    let [rows] = await db.query(sql, params);
    if (req.query.status) rows = rows.filter((t) => t.status === req.query.status);
    if (req.query.priority) rows = rows.filter((t) => t.priority === req.query.priority);
    res.json(rows);
  } catch (err) { next(err); }
};

export const getOne = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.name AS raised_by_name, a.name AS assigned_admin_name
       FROM tickets t JOIN users u ON u.id = t.raised_by LEFT JOIN users a ON a.id = t.assigned_admin
       WHERE t.id = ?`,
      [req.params.id]
    );
    const ticket = rows[0];
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const [messages] = await db.query(
      `SELECT m.*, u.name AS sender_name, r.name AS sender_role
       FROM ticket_messages m JOIN users u ON u.id = m.sender_id JOIN roles r ON r.id = u.role_id
       WHERE m.ticket_id = ? ORDER BY m.sent_at`,
      [ticket.id]
    );
    res.json({ ...ticket, messages });
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { subject, description, category, priority } = req.body;
    const [r] = await db.query(
      'INSERT INTO tickets (subject, description, category, priority, raised_by) VALUES (?, ?, ?, ?, ?)',
      [subject, description, category || 'technical', priority || 'medium', req.user.id]
    );
    res.status(201).json({ message: 'Ticket raised', id: r.insertId });
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status, priority, subject, description, category } = req.body;

    if (subject && description) {
      await db.query(
        'UPDATE tickets SET subject = ?, description = ?, category = ?, priority = ? WHERE id = ?',
        [subject, description, category, priority, id]
      );
    } else if (status) {
      await db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
    } else if (priority) {
      await db.query('UPDATE tickets SET priority = ? WHERE id = ?', [priority, id]);
    }
    res.json({ message: 'Ticket updated' });
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await db.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Ticket deleted' });
  } catch (err) { next(err); }
};

export const addMessage = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    await db.query(
      'INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)',
      [ticketId, req.user.id, req.body.message]
    );
    if (req.user.role === 'admin') {
      await db.query(
        "UPDATE tickets SET status = IF(status='open', 'in_progress', status), assigned_admin = ? WHERE id = ?",
        [req.user.id, ticketId]
      );
    }
    res.status(201).json({ message: 'Message sent' });
  } catch (err) { next(err); }
};

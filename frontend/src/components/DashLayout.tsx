import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { label } from './ui';
import { Role } from '../types';

const NAV: Record<Role, Array<[string, string, boolean?]>> = {
  admin: [
    ['/admin', 'Load & Pool Overview', true],
    ['/admin/employees', 'Employees & Pool'],
    ['/admin/tasks', 'Tasks (Story Pts)'],
    ['/admin/leaves', 'Leaves & Reassign'],
    ['/admin/tickets', 'Tickets'],
    ['/admin/reviews', 'Reviews'],
    ['/admin/messages', 'Messages'],
  ],
  employee: [
    ['/app', 'Overview', true],
    ['/app/tasks', 'My tasks'],
    ['/app/leaves', 'My leaves'],
    ['/app/tickets', 'Tickets'],
    ['/app/performance', 'Performance'],
  ],
};

export default function DashLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const base = user.role === 'admin' ? '/admin' : '/app';

  return (
    <div className="dash">
      <aside className="side">
        <Link to="/" className="brand light">WorkDesk</Link>
        <nav>
          {NAV[user.role].map(([to, text, end]) => (
            <NavLink key={to} to={to} end={!!end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {text}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <Link to={`${base}/profile`}><strong>{user.name}</strong></Link>
          <span className="role-tag">{label(user.role)}</span>
          <button
            type="button"
            className="btn-outline sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Sign out
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

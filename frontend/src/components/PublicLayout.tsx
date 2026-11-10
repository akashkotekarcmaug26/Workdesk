import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="pub-head">
        <div className="wrap row">
          <Link to="/" className="brand">WorkDesk</Link>
          <nav>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
          <div className="head-actions">
            {user ? (
              <>
                <Link className="btn" to={user.role === 'admin' ? '/admin' : '/app'}>
                  Open dashboard
                </Link>
                <button type="button" className="btn-outline" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="btn-outline" to="/login">Sign in</Link>
                <Link className="btn" to="/register">Create account</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="pub-foot">
        <div className="wrap">
          <span>WorkDesk</span>
          <span>Employee Workload, Leave & Support Management System</span>
        </div>
      </footer>
    </>
  );
}

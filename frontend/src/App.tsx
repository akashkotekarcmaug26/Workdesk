import { Link, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import DashLayout from './components/DashLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks';
import Leaves from './pages/Leaves';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Reviews from './pages/Reviews';
import Performance from './pages/Performance';
import Messages from './pages/Messages';
import Profile from './pages/Profile';

const NotFound = () => (
  <main className="page-narrow">
    <div className="auth-box">
      <h1>Page not found</h1>
      <p className="muted">
        The page you are looking for does not exist. <Link to="/">Go to the home page</Link>.
      </p>
    </div>
  </main>
);

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/app"
        element={
          <ProtectedRoute roles={['employee']}>
            <DashLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="performance" element={<Performance />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

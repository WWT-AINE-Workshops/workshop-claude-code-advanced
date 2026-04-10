import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router';
import { UserSwitcher } from './components/UserSwitcher';
import { Approvals } from './pages/Approvals';
import { Catalog } from './pages/Catalog';
import { Dashboard } from './pages/Dashboard';
import { MyRequests } from './pages/MyRequests';
import { NewRequest } from './pages/NewRequest';
import { USER_EVENT, getCurrentUserId } from './session';

export function App() {
  const [userId, setUserId] = useState(getCurrentUserId());
  useEffect(() => {
    const onChange = () => setUserId(getCurrentUserId());
    window.addEventListener(USER_EVENT, onChange);
    return () => window.removeEventListener(USER_EVENT, onChange);
  }, []);

  return (
    <>
      <header className="top">
        <span className="brand">Copperline</span>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/requests">My requests</NavLink>
          <NavLink to="/requests/new">New request</NavLink>
          <NavLink to="/approvals">Approvals</NavLink>
          <NavLink to="/catalog">Catalog</NavLink>
        </nav>
        <UserSwitcher />
      </header>
      <main key={userId}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/requests/new" element={<NewRequest />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/catalog" element={<Catalog />} />
        </Routes>
      </main>
    </>
  );
}

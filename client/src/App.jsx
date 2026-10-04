import { NavLink, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <>
      <nav>
        <b>📚 Library</b>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/books">Books</NavLink>
        <NavLink to="/members">Members</NavLink>
        <NavLink to="/transactions">Issue / Return</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/members" element={<Members />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </main>
      <footer className="seed-footer">
        <p>🌱 Note: The data currently displayed is seed data for demonstration purposes.</p>
      </footer>
    </>
  );
}
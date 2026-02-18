// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import SupabaseTest from './components/SupabaseTest';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RentalTestPage from './pages/RentalTestPage';
import BrowsePage from './pages/BrowsePage';
import GameDetailPage from './pages/GameDetailPage';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<SupabaseTest />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rental-test" element={<RentalTestPage />} />
        <Route path="/browse-page" element={<BrowsePage />} />
        <Route path="/games/:id" element={<GameDetailPage />} />
      </Routes>
  );
}

export default App;
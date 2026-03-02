// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import WaitlistPage from './pages/WaitlistPage';
import SupabaseTest from './components/SupabaseTest';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import RegisterPage from './pages/RegisterPage';
import RentalTestPage from './pages/RentalTestPage';
import BrowsePage from './pages/BrowsePage';
import GameDetailPage from './pages/GameDetailPage';
import MyRentalsPage from './pages/MyRentalsPage';
import RentalDetail from './pages/RentalDetail';


function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<SupabaseTest />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} /> 
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rental-test" element={<RentalTestPage />} />
        <Route path="/browse-page" element={<BrowsePage />} />
        <Route path="/games/:id" element={<GameDetailPage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        <Route path='/my-rentals' element={<MyRentalsPage />} />
        <Route path="/rental/:rentalId/extend/:gameId" element={<RentalDetail />} />

      </Routes>
  );
}

export default App;
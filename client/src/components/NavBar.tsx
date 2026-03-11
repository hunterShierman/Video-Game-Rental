// src/components/common/Navbar.tsx
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';



function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold hover:opacity-80 transition-opacity">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            GameRent
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          <Link 
            to="/browse-page" 
            className="text-gray-300 hover:text-white transition-colors font-medium"
          >
            Browse
          </Link>
          <Link 
            to="/waitlist" 
            className="text-gray-300 hover:text-white transition-colors font-medium"
          >
            My Waitlist
          </Link>
          
          {user ? (
            // Logged in state
            <>
              <Link
                to="/my-rentals"
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                My Rentals
              </Link>
              <span className="text-gray-400 text-sm hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={() => { signOut(); navigate("/"); }}
                className="bg-slate-800 border border-indigo-500/30 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-700 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            // Logged out state
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
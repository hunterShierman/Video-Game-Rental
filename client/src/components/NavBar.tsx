// src/components/common/Navbar.tsx
import { Link } from 'react-router-dom';
import { Gamepad2, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type UserRole = 'Admin' | 'Customer';


function Navbar() {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('Customer');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadUserRole = async () => {
      if (!user) {
        setUserRole('Customer');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('Customer');
        return;
      }

      setUserRole(data?.role === 'Admin' ? 'Admin' : 'Customer');
    };

    void loadUserRole();
  }, [user]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

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

        <div className="flex gap-6 items-center">
          <Link 
            to="/browse-page" 
            className="text-gray-300 hover:text-white transition-colors font-medium"
          >
            Browse
          </Link>
          
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors focus:outline-none"
                aria-label="User menu"
              >
                <UserCircle className="w-9 h-9" />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`absolute right-0 mt-2 w-72 bg-slate-900 border border-indigo-500/30 rounded-xl shadow-xl py-3 z-50 transform transition-all duration-200 ease-out ${
                  isDropdownOpen
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                {/* User email */}
                <div className="px-5 py-3 text-base text-gray-400 border-b border-indigo-500/20 truncate">
                  {user.email}
                  {userRole === 'Admin' && (
                    <span className="block text-xs font-semibold text-indigo-400 mt-1">Admin Account</span>
                  )}
                </div>

                {/* Navigation items */}
                {userRole === 'Admin' ? (
                  <>
                    <Link
                      to="/admin-dashboard"
                      className="block px-5 py-3 text-base text-gray-300 hover:bg-indigo-600/20 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin-games"
                      className="block px-5 py-3 text-base text-gray-300 hover:bg-indigo-600/20 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Manage Games
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/my-rentals"
                      className="block px-5 py-3 text-base text-gray-300 hover:bg-indigo-600/20 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Rentals
                    </Link>
                    <Link
                      to="/waitlist"
                      className="block px-5 py-3 text-base text-gray-300 hover:bg-indigo-600/20 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Waitlist
                    </Link>
                  </>
                )}

                {/* Logout */}
                <div className="border-t border-indigo-500/20 mt-3 pt-3 pb-2 px-3">
                  <button
                    onClick={() => {
                      signOut();
                      setIsDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-base hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 text-center"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
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
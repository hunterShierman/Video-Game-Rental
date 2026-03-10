// src/components/common/Navbar.tsx
import { Link } from 'react-router-dom';
import { Gamepad2, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

function Navbar() {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          <Link 
            to="/browse-page" 
            className="text-gray-300 hover:text-white transition-colors font-medium"
          >
            Browse
          </Link>
          
          {user ? (
            // Logged in state – profile icon dropdown
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors focus:outline-none"
                aria-label="User menu"
              >
                <UserCircle className="w-8 h-8" />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown with smooth transition */}
              <div
                className={`absolute right-0 mt-2 w-56 bg-slate-900 border border-indigo-500/30 rounded-lg shadow-xl py-2 z-50 transform transition-all duration-200 ease-out ${
                  isDropdownOpen
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                {/* User email */}
                <div className="px-4 py-2 text-sm text-gray-400 border-b border-indigo-500/20 truncate">
                  {user.email}
                </div>

                {/* Navigation items */}
                <Link
                  to="/my-rentals"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-600/20 hover:text-white transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  My Rentals
                </Link>
                <Link
                  to="/waitlist"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-600/20 hover:text-white transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  My Waitlist
                </Link>

                {/* Divider and centered logout button */}
                <div className="border-t border-indigo-500/20 mt-2 pt-2 pb-1 px-2">
                  <button
                    onClick={() => {
                      signOut();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 text-center"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
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
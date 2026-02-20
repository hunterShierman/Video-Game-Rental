import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserWaitlist, leaveWaitlist, type WaitlistEntry } from '../services/waitlistService';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Gamepad2, Loader2, LogIn, AlertTriangle, X } from 'lucide-react';
import Navbar from '../components/NavBar';

export default function WaitlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (!user) return;
      const data = await getUserWaitlist(user.id);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirmLeaveId) return;
    try {
      await leaveWaitlist(confirmLeaveId);
      setItems((prev) => prev.filter((item) => item.id !== confirmLeaveId));
      setConfirmLeaveId(null);
    } catch (err) {
      setLeaveError('Something went wrong removing you from the waitlist. Please try again.');
      console.log(err);
    }
  };

  // The game title for the confirm modal
  const confirmItem = items.find((i) => i.id === confirmLeaveId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Navbar />

      {/* Confirm leave modal */}
      {confirmLeaveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => { setConfirmLeaveId(null); setLeaveError(null); }}
          />

          {/* Modal */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-indigo-500/10">
            <button
              onClick={() => { setConfirmLeaveId(null); setLeaveError(null); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/10 border border-red-500/30 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-white font-bold text-lg">Leave Waitlist?</h2>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to give up your spot for{' '}
              <span className="text-white font-semibold">
                {confirmItem?.games?.title || 'this game'}
              </span>
              ? You will lose your current position and will have to rejoin at the back of the queue.
            </p>

            {/* Error */}
            {leaveError && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{leaveError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleLeave}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-bold transition-all"
              >
                Leave Waitlist
              </button>
              <button
                onClick={() => { setConfirmLeaveId(null); setLeaveError(null); }}
                className="flex-1 text-gray-400 hover:text-white border border-slate-600 hover:border-slate-500 py-2.5 rounded-xl font-semibold transition-all"
              >
                Keep My Spot
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-4">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">Your Waitlist</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">My Waitlist</h1>
          <p className="text-gray-400">Games you are waiting to become available</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Loading your waitlist...</span>
            </div>
          </div>
        )}

        {/* Not logged in */}
        {!loading && !user && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl">
            <LogIn className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Sign in to view your waitlist</h3>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && user && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-dashed border-indigo-500/20 rounded-2xl">
            <Gamepad2 className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">You are not waiting for any games</h3>
            <p className="text-gray-500 mb-6">Browse the library and join a waitlist for unavailable games</p>
            <Link
              to="/browse-page"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
              Browse Library
            </Link>
          </div>
        )}

        {/* Waitlist items */}
        {!loading && user && items.length > 0 && (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 hover:border-indigo-500/40 transition-all"
              >
                {/* Game image */}
                <div className="w-full sm:w-20 h-20 bg-slate-800/60 rounded-xl overflow-hidden shrink-0">
                  {item.games?.image_url ? (
                    <img
                      src={item.games.image_url}
                      alt={item.games.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {item.games?.title || 'Unknown Game'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Joined on {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Position badge */}
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full font-bold text-indigo-300 text-sm shrink-0">
                  Position #{item.position}
                </div>

                {/* Leave button */}
                <button
                  onClick={() => { setConfirmLeaveId(item.id); setLeaveError(null); }}
                  className="text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 px-4 py-2 rounded-lg transition-all text-sm font-semibold shrink-0"
                >
                  Leave Line
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
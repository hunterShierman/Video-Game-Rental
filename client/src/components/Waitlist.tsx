import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWaitlistStatus, joinWaitlist, leaveWaitlist } from '../services/waitlistService';
import { Clock, Loader2, AlertTriangle, CheckCircle, X, LogIn } from 'lucide-react';

interface WaitlistButtonProps {
  gameId: string;
  gameTitle: string;
  onStatusChange?: () => void;
}

export default function Waitlist({ gameId, gameTitle, onStatusChange }: WaitlistButtonProps) {
  const { user } = useAuth();
  const [waitlistId, setWaitlistId] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newPosition, setNewPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    const check = async () => {
      const entry = await getWaitlistStatus(gameId, user.id);
      if (entry) {
        setWaitlistId(entry.id);
        setPosition(entry.position);
      }
      setChecking(false);
    };
    check();
  }, [gameId, user]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // If already on waitlist, show leave confirmation first
    if (waitlistId) {
      setShowLeaveConfirmModal(true);
      return;
    }

    // Join waitlist
    setLoading(true);
    try {
      const newEntry = await joinWaitlist(gameId, user.id);
      setWaitlistId(newEntry.id);
      setPosition(newEntry.position);
      setNewPosition(newEntry.position);
      setShowSuccessModal(true);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to join waitlist');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveConfirm = async () => {
    if (!waitlistId) return;
    setLoading(true);
    try {
      await leaveWaitlist(waitlistId);
      setWaitlistId(null);
      setPosition(null);
      setShowLeaveConfirmModal(false);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      setShowLeaveConfirmModal(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to leave waitlist');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        Checking status...
      </div>
    );
  }

  return (
    <>
      {/* ── Login required modal ── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-indigo-500/10">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-500/10 border border-indigo-500/30 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                <LogIn className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-white font-bold text-lg">Sign In Required</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              You need to be signed in to join the waitlist for{' '}
              <span className="text-white font-semibold">{gameTitle}</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 text-gray-400 hover:text-white border border-slate-600 hover:border-slate-500 py-2.5 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Leave waitlist confirmation modal ── */}
      {showLeaveConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowLeaveConfirmModal(false)}
          />
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-indigo-500/10">
            <button
              onClick={() => setShowLeaveConfirmModal(false)}
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
              <span className="text-white font-semibold">{gameTitle}</span>? You will lose
              your current position and have to rejoin at the back of the queue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLeaveConfirm}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Leave Waitlist
              </button>
              <button
                onClick={() => setShowLeaveConfirmModal(false)}
                disabled={loading}
                className="flex-1 text-gray-400 hover:text-white border border-slate-600 hover:border-slate-500 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                Keep My Spot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Successfully joined modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-green-500/10">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/10 border border-green-500/30 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-white font-bold text-lg">Added to Waitlist</h2>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              You have joined the waitlist for{' '}
              <span className="text-white font-semibold">{gameTitle}</span>.
            </p>
            {newPosition && (
              <div className="bg-slate-800/60 border border-green-500/20 rounded-xl p-4 mb-6">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Your Position</p>
                <p className="text-2xl font-bold text-green-400">#{newPosition} in line</p>
              </div>
            )}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ── Error modal ── */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowErrorModal(false)}
          />
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-red-500/10">
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/10 border border-red-500/30 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-white font-bold text-lg">Something Went Wrong</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Main button ── */}
      <div className="flex flex-col gap-1 items-start w-full relative z-10">
        <button
          onClick={handleClick}
          type="button"
          disabled={loading || checking}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            waitlistId
              ? 'bg-slate-800/60 border border-slate-700 text-gray-300 hover:border-red-500/40 hover:text-red-400'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transform hover:scale-[1.02] shadow-xl shadow-indigo-500/30'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Clock className="w-5 h-5" />
              {waitlistId ? 'Leave Waitlist' : 'Join Waitlist'}
            </>
          )}
        </button>

        {waitlistId && position && (
          <p className="text-indigo-400 text-sm font-medium ml-1">
            You are #{position} in line
          </p>
        )}
      </div>
    </>
  );
}
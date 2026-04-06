import { useState } from 'react';
import useAsyncData from '../hooks/useAsyncData';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Gamepad2, Star, Clock, Users, ArrowLeft,
  CheckCircle, AlertCircle, Loader2, Key, Clock3,
  CalendarClock, ShieldAlert, RefreshCw
} from 'lucide-react';
import Navbar from '../components/NavBar';
import { getGameById } from '../services/gameService';
import { checkExtensionEligibility, extendRental, getRentalRecord } from '../services/rentalService';
import RentalCountdown from '../components/RentalCountdown';
import { EXTENSION_DURATION_DAYS } from '../utils/constants';
import { formatLongDate } from '../utils/date';

const RentalExtensionPage = () => {
  const { rentalId, gameId } = useParams<{ rentalId: string; gameId: string }>();
  const navigate = useNavigate();   

  const [showConfirm, setShowConfirm] = useState(false);
  const [extending, setExtending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newEndDate, setNewEndDate] = useState<string | null>(null);

  const { data, loading, error: fetchError } = useAsyncData(
    async () => {
      if (!gameId || !rentalId) return null;
      const [gameData, eligibilityData, rentalData] = await Promise.all([
        getGameById(gameId),
        checkExtensionEligibility(rentalId),
        getRentalRecord(rentalId),
      ]);
      return { game: gameData, eligibility: eligibilityData, rental: rentalData };
    },
    [gameId, rentalId]
  );
  const game = data?.game ?? null;
  const eligibility = data?.eligibility ?? null;
  const rental = data?.rental ?? null;
  const eligibilityLoading = loading;

  const handleExtend = async () => {
    if (!rentalId) return;
    setExtending(true);
    setError(null);
    try {
      const updated = await extendRental(rentalId);
      setNewEndDate(updated.end_date);
      setSuccess(true);
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setExtending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Loading rental details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <Gamepad2 className="w-16 h-16 text-slate-600 mb-4" />
          <h2 className="text-white font-bold text-2xl mb-2">Rental not found</h2>
          <button
            onClick={() => navigate('/my-rentals')}
            className="text-indigo-400 hover:text-white mt-4 transition-colors"
          >
            ← Back to My Rentals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Navbar />

      <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate('/my-rentals')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to My Rentals
        </button>

        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column — image and quick stats */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl overflow-hidden">
              {/* Game image */}
              <div className="h-72 bg-slate-800/60 relative">
                {game.image_url ? (
                  <img
                    src={game.image_url}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gamepad2 className="w-16 h-16 text-slate-600" />
                  </div>
                )}

                {/* Extension badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                  Active Rental
                </div>
              </div>

              {/* Quick stats */}
              <div className="p-5 space-y-3">
                {[
                  { label: 'Platform', value: game.platform, icon: <Gamepad2 className="w-4 h-4 text-indigo-400" /> },
                  { label: 'Genre', value: game.genre, icon: <Star className="w-4 h-4 text-yellow-400" /> },
                  { label: 'Extension Period', value: `${EXTENSION_DURATION_DAYS} days`, icon: <Clock className="w-4 h-4 text-purple-400" /> },
                  { label: 'Copies Available', value: `${game.available_copies} / ${game.total_copies}`, icon: <Users className="w-4 h-4 text-green-400" /> },
                  { label: 'Popularity Score', value: String(game.popularity_score), icon: <Star className="w-4 h-4 text-pink-400" /> },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      {stat.icon}
                      {stat.label}
                    </div>
                    <span className="text-white text-sm font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title and extension price */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">{game.title}</h2>
              <div className="flex items-center gap-4">
                {eligibilityLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                ) : eligibility?.eligible ? (
                  <>
                    <span className="text-3xl font-bold text-indigo-400">${eligibility.extensionCost}</span>
                    <span className="text-gray-400 text-sm">/ {EXTENSION_DURATION_DAYS}-day extension</span>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">Extension unavailable</span>
                )}
              </div>
            </div>

            {/* Description */}
            {game.description && (
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-3">About This Game</h3>
                <p className="text-gray-400 leading-relaxed">{game.description}</p>
              </div>
            )}

            {/* Extension info panel */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">Extension Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Extension Period', value: `${EXTENSION_DURATION_DAYS} days`, icon: <Clock3 className="w-4 h-4 text-indigo-400" /> },
                  { label: 'Access Method', value: rental?.access_key ?? 'Loading...', icon: <Key className="w-4 h-4 text-purple-400" /> },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-800/40 rounded-xl p-4 flex items-center gap-3">
                    {item.icon}
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">{item.label}</p>
                      <p className="text-white font-semibold text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Projected new end date */}
              {!eligibilityLoading && eligibility?.eligible && (
                <div className="mt-4 bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
                  <CalendarClock className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">New Expiry Date</p>
                    <p className="text-white font-semibold">{formatLongDate(eligibility.newEndDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {rental && <RentalCountdown endDate={rental.end_date} rentalId={rental.id} />}


            {/* Ineligible state */}
            {!eligibilityLoading && eligibility && !eligibility.eligible && (
              <div className="flex items-start gap-3 bg-amber-900/20 border border-amber-500/30 rounded-2xl p-5">
                <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">Extension Not Available</p>
                  <p className="text-amber-300 text-sm">{eligibility.reason}</p>
                </div>
              </div>
            )}

            {/* Success state */}
            {success && newEndDate && (
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-bold text-lg">Rental Extended!</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Your rental for <span className="text-white font-semibold">{game.title}</span> has been extended.
                  Your existing access key remains valid.
                </p>
                <div className="bg-slate-900/60 border border-green-500/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">New Expiry Date</p>
                  <p className="text-xl font-bold text-green-400">{formatLongDate(newEndDate)}</p>
                </div>
                <button
                  onClick={() => navigate('/my-rentals')}
                  className="mt-4 w-full text-gray-400 hover:text-white border border-slate-600 hover:border-slate-500 py-3 rounded-xl font-semibold transition-all"
                >
                  Back to My Rentals
                </button>
              </div>
            )}

            {/* Error state */}
            {(error || fetchError) && (
              <div className="flex items-start gap-3 bg-red-900/20 border border-red-500/30 rounded-2xl p-5">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">Something went wrong</p>
                  <p className="text-red-300 text-sm">{error ?? fetchError}</p>
                </div>
              </div>
            )}

            {/* Confirmation step */}
            {showConfirm && eligibility && (
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/30 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-2">Confirm Extension</h3>
                <p className="text-gray-400 text-sm mb-5">
                  You are about to extend your rental of{' '}
                  <span className="text-white font-semibold">{game.title}</span> for{' '}
                  <span className="text-indigo-400 font-bold">${eligibility.extensionCost}</span>.
                  Your access key stays the same and the new expiry date will be{' '}
                  <span className="text-white font-semibold">{formatLongDate(eligibility.newEndDate)}</span>.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleExtend}
                    disabled={extending}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {extending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Confirm Extension
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setShowConfirm(false); setError(null); }}
                    disabled={extending}
                    className="flex-1 text-gray-400 hover:text-white border border-slate-600 hover:border-slate-500 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Extend button */}
            {!success && !showConfirm && !eligibilityLoading && eligibility?.eligible && (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Extend for {EXTENSION_DURATION_DAYS} More Days — ${eligibility.extensionCost}
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalExtensionPage;
import { useState, useEffect } from 'react';
import ReviewsSection from "../components/ReviewsSection";
import { useParams, useNavigate } from 'react-router-dom';
import {
  Gamepad2, Star, Clock, Users, ArrowLeft,
  CheckCircle, AlertCircle, Loader2, Key, Clock3
} from 'lucide-react';
import Navbar from '../components/NavBar';
import { getGameById } from '../services/gameService';
import type { Game } from '../types/definitions';
import { rentGame, hasActiveRental } from '../services/rentalService';

const GameDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [renting, setRenting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [accessKey, setAccessKey] = useState<string | null>(null);
    const [alreadyRented, setAlreadyRented] = useState(false);

    useEffect(() => {
    const loadGame = async () => {
    if (!id) return;
      try {
        const data = await getGameById(id);
        setGame(data);

        const rented = await hasActiveRental(id);
        setAlreadyRented(rented);
      } catch (err) {
        console.error('Error loading game:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id]);

  const handleRent = async () => {
    if (!game) return;
    setRenting(true);
    setError(null);

    try {
        const rental = await rentGame(game.id);
        setAccessKey(rental.access_key);
        setSuccess(true);
        setShowConfirm(false);

        const updatedGame = await getGameById(game.id);
        if (updatedGame) setGame(updatedGame);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setRenting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Loading game...</span>
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
          <h2 className="text-white font-bold text-2xl mb-2">Game not found</h2>
          <button
            onClick={() => navigate('/browse-page')}
            className="text-indigo-400 hover:text-white mt-4 transition-colors"
          >
            ← Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = game.available_copies > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Navbar />

      <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate('/browse-page')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </button>

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

                {/* Availability badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                  isAvailable
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                    : 'bg-red-500/20 border border-red-500/40 text-red-400'
                }`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </div>
              </div>

              {/* Quick stats */}
              <div className="p-5 space-y-3">
                {[
                  { label: 'Platform', value: game.platform, icon: <Gamepad2 className="w-4 h-4 text-indigo-400" /> },
                  { label: 'Genre', value: game.genre, icon: <Star className="w-4 h-4 text-yellow-400" /> },
                  { label: 'Rental Duration', value: '7 days', icon: <Clock className="w-4 h-4 text-purple-400" /> },
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

          {/* Right column — details and rental action */}
          <div className="lg:col-span-2 space-y-6">
          
            {/* Title and price */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{game.title}</h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-indigo-400">${game.price}</span>
                <span className="text-gray-400 text-sm">/ week</span>
              </div>
            </div>

            {/* Description */}
            {game.description && (
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-3">About This Game</h2>
                <p className="text-gray-400 leading-relaxed">{game.description}</p>
              </div>
            )}

            {/* Rental info */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Rental Info</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Rental Period', value: '7 days', icon: <Clock3 className="w-4 h-4 text-indigo-400" /> },
                  { label: 'Access Method', value: 'Unique Key', icon: <Key className="w-4 h-4 text-purple-400" /> },
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
            </div>
            {/* Reviews */}
<div className="mt-6">
  <ReviewsSection gameId={game.id} />
</div>
            {/* Success state — show access key */}
            {success && accessKey && (
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h2 className="text-white font-bold text-lg">Rental Confirmed!</h2>
                </div>
                <p className="text-gray-400 text-sm mb-3">Your access key for <span className="text-white font-semibold">{game.title}</span>:</p>
                <div className="bg-slate-900/60 border border-green-500/20 rounded-xl p-4">
                  <p className="text-2xl font-bold text-green-400 font-mono tracking-wider">{accessKey}</p>
                </div>
                <p className="text-gray-500 text-xs mt-3">This key will expire in 7 days. Keep it safe!</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="flex items-start gap-3 bg-red-900/20 border border-red-500/30 rounded-2xl p-5">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">Something went wrong</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Confirmation step */}
            {showConfirm && (
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/30 rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-2">Confirm Rental</h2>
                <p className="text-gray-400 text-sm mb-5">
                  You are about to rent <span className="text-white font-semibold">{game.title}</span> for{' '}
                  <span className="text-indigo-400 font-bold">${game.price}</span> for 7 days.
                  Your access key will be generated immediately.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRent}
                    disabled={renting}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {renting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Rental'
                    )}
                  </button>
                  <button
                    onClick={() => { setShowConfirm(false); setError(null); }}
                    disabled={renting}
                    className="flex-1 text-gray-400 hover:text-white border border-slate-600 hover:border-slate-500 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Rent / Waitlist button */}
            {!success && !showConfirm && (
            alreadyRented ? (
                <div className="w-full bg-indigo-900/20 border border-indigo-500/30 text-indigo-300 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                You already have this game rented
                </div>
            ) : isAvailable ? (
                <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2"
                >
                <Key className="w-5 h-5" />
                Rent for 1 Week — ${game.price}
                </button>
            ) : (
                <button
                disabled
                className="w-full bg-slate-800/60 border border-slate-700 text-gray-400 py-4 rounded-xl font-bold text-lg cursor-not-allowed flex items-center justify-center gap-2"
                >
                Join Waitlist
                </button>
            )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;

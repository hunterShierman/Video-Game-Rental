// src/pages/RentalTestPage.tsx
import { useState } from 'react';
import { Key, Gamepad2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/NavBar';
import RentalCountdown from '../components/RentalCountdown';
import { rentGame, getMyActiveRentals } from '../services/rentalService';
import type { Rental, RentalWithGame } from '../types/definitions';

const RentalTestPage = () => {
  const [gameId, setGameId] = useState('');
  const [rental, setRental] = useState<Rental | null>(null);
  const [activeRentals, setActiveRentals] = useState<RentalWithGame[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRent = async () => {
    if (!gameId.trim()) return;
    setLoading(true);
    setError(null);
    setRental(null);

    try {
      const result = await rentGame(gameId.trim());
      setRental(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchActiveRentals = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMyActiveRentals();
      setActiveRentals(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Navbar />

      <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-4">
            <Key className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">Developer Test Page</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Rental Service Tester</h1>
          <p className="text-gray-400">Temporary page for testing rental logic — not part of the final UI</p>
        </div>

        {/* Rent a Game */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/30 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 w-10 h-10 rounded-xl flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Rent a Game</h2>
          </div>

          <p className="text-gray-400 text-sm mb-4">Paste a game UUID from your Supabase games table</p>

          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="e.g. 1ce90c94-975b-45ef-aab6-a461cb2a26f9"
            className="w-full bg-slate-800/60 border border-indigo-500/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />

          <button
            onClick={handleRent}
            disabled={loading || !gameId.trim()}
            className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Rent Game
              </>
            )}
          </button>
        </div>

        {/* Success Result */}
        {rental && (
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/30 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Rental Created Successfully</h2>
            </div>

            <div className="bg-slate-900/60 border border-green-500/20 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Access Key</p>
              <p className="text-2xl font-bold text-green-400 font-mono">{rental.access_key}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Rental ID', value: rental.id.substring(0, 18) + '...' },
                { label: 'Status', value: rental.status.toUpperCase() },
                { label: 'Start', value: new Date(rental.start_date).toLocaleString() },
                { label: 'Expires', value: new Date(rental.end_date).toLocaleString() },
                { label: 'Price', value: `$${rental.price}` },
              ].map((item) => (
                <div key={item.label} className="bg-slate-900/40 rounded-lg p-3">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-white text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Countdown timer on the newly created rental */}
            <RentalCountdown endDate={rental.end_date}  />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-br from-red-900/20 to-rose-900/10 border border-red-500/30 rounded-2xl p-6 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white font-semibold mb-1">Something went wrong</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Active Rentals */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/30 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">My Active Rentals</h2>
            </div>

            <button
              onClick={handleFetchActiveRentals}
              disabled={loading}
              className="text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-indigo-500/60 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Fetch Rentals
            </button>
          </div>

          {activeRentals.length > 0 ? (
            <div className="space-y-4">
              {activeRentals.map((r) => (
                <div key={r.id} className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">{r.games.title}</h3>
                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                      ACTIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Platform', value: r.games.platform },
                      { label: 'Access Key', value: r.access_key },
                      { label: 'Expires', value: new Date(r.end_date).toLocaleString() },
                      { label: 'Price', value: `$${r.price}` },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-gray-300 text-sm font-mono">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Countdown timer on each active rental */}
                  <RentalCountdown endDate={r.end_date}  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No active rentals found</p>
              <p className="text-gray-600 text-sm">Hit "Fetch Rentals" to load your rentals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalTestPage;
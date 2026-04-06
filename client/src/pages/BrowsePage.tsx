import { useState, useEffect, useMemo } from 'react';
import useAsyncData from '../hooks/useAsyncData';
import { Search, Filter, Gamepad2, Loader2, X } from 'lucide-react';
import Navbar from '../components/NavBar';
import GameCard from '../components/GameCard';
import GameRecommendations from '../components/GameRecommendations';
import {
  getAllGames,
  getGamesByGenre,
  getGamesByPlatform,
  searchGames,
  getAvailableGames,
} from '../services/gameService';
import type { Game } from '../types/definitions';

const getUniqueValues = (games: Game[], key: keyof Game): string[] => {
  return [...new Set(games.map((g) => g[key] as string))].sort();
};

const BrowsePage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedEra, setSelectedEra] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const { data: allGames } = useAsyncData(() => getAllGames(), []);
  const genres = useMemo(() => (allGames ? getUniqueValues(allGames, 'genre') : []), [allGames]);
  const platforms = useMemo(() => (allGames ? getUniqueValues(allGames, 'platform') : []), [allGames]);

  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      try {
        let data: Game[] = [];

        if (searchTerm) {
          data = await searchGames(searchTerm);
        } else if (selectedGenre) {
          data = await getGamesByGenre(selectedGenre);
        } else if (selectedPlatform) {
          data = await getGamesByPlatform(selectedPlatform);
        } else if (availableOnly) {
          data = await getAvailableGames();
        } else {
          data = await getAllGames();
        }

        if (availableOnly) {
          data = data.filter((g) => g.available_copies > 0);
        }

        if (selectedEra) {
          const [start, end] = selectedEra === '70s' ? [1970, 1979] : selectedEra === '80s' ? [1980, 1989] : [1990, 1999];
          data = data.filter((g) => g.release_year !== null && g.release_year >= start && g.release_year <= end);
        }

        setGames(data);
      } catch (err) {
        console.error('Error applying filters:', err);
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [searchTerm, selectedGenre, selectedPlatform, selectedEra, availableOnly]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedPlatform('');
    setSelectedEra('');
    setAvailableOnly(false);
  };

  const hasActiveFilters = searchTerm || selectedGenre || selectedPlatform || selectedEra || availableOnly;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Navbar />

      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-white mb-3">Browse Games</h1>
          <p className="text-gray-400 text-lg">Rent any game for a week, no commitment required</p>
        </div>

        <GameRecommendations />

        {/* Search and Filters */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search games..."
                className="w-full bg-slate-800/60 border border-indigo-500/20 text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>

            <select
              value={selectedGenre}
              onChange={(e) => { setSelectedGenre(e.target.value); setSelectedPlatform(''); }}
              className="bg-slate-800/60 border border-indigo-500/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/60 transition-colors"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={selectedPlatform}
              onChange={(e) => { setSelectedPlatform(e.target.value); setSelectedGenre(''); }}
              className="bg-slate-800/60 border border-indigo-500/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/60 transition-colors"
            >
              <option value="">All Platforms</option>
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value)}
              className="bg-slate-800/60 border border-indigo-500/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500/60 transition-colors"
            >
              <option value="">All Eras</option>
              <option value="70s">70s (1970–1979)</option>
              <option value="80s">80s (1980–1989)</option>
              <option value="90s">90s (1990–1999)</option>
            </select>

            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold border transition-all ${
                availableOnly
                  ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                  : 'bg-slate-800/60 border-indigo-500/20 text-gray-400 hover:text-white hover:border-indigo-500/40'
              }`}
            >
              <Filter className="w-4 h-4" />
              Available Only
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-gray-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-400 text-sm mb-6">
          {loading ? 'Loading...' : `${games.length} game${games.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Game Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Loading games...</span>
            </div>
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Gamepad2 className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">No games found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
            <button
              onClick={clearFilters}
              className="text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-indigo-500/60 px-6 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
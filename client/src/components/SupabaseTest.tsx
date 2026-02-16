// src/components/SupabaseTest.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Game } from '../types/definitions';

function SupabaseTest() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .limit(5);

      if (error) throw error;

      setGames(data || []);
      setError(null);
    } catch (err) {
          if (err instanceof Error) {
            setError(err.message);   
        } else {
            setError('An unknown error occurred');
        }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-900 rounded-xl border border-indigo-500/30">
        <p className="text-white">Loading games from Supabase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-900/20 rounded-xl border border-red-500/30">
        <p className="text-red-400">❌ Error: {error}</p>
        <p className="text-gray-400 text-sm mt-2">Check your .env file and Supabase credentials</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 rounded-xl border border-green-500/30">
      <h2 className="text-2xl font-bold text-white mb-4">
        ✅ Supabase Connected Successfully!
      </h2>
      <p className="text-gray-400 mb-4">Found {games.length} games in database:</p>
      
      <div className="space-y-2">
        {games.map((game) => (
          <div key={game.id} className="bg-slate-800 p-3 rounded-lg border border-indigo-500/20">
            <p className="text-white font-semibold">{game.title}</p>
            <p className="text-gray-400 text-sm">{game.genre} • {game.platform} • ${game.price}/week</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SupabaseTest;
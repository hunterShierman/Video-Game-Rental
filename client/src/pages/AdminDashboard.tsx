import Navbar from '../components/NavBar';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Crown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  BarChart3,
} from 'lucide-react';
type StatCard = {
  label: string;
  value: string;
  icon: ReactNode;
  accent: string;
  note: string;
};

type GamesLite = { id: string; title: string; genre: string };
type RentalsLite = { game_id: string | null; created_at: string | null };
type TransactionsLite = { amount: number | null; created_at: string | null };
type WaitlistLite = { game_id: string | null; created_at: string | null };

type DashboardData = {
  genrePopularity: Array<{ name: string; value: number }>;
  gamePopularity: Array<{ name: string; value: number }>;
  waitlistLengths: Array<{ name: string; value: number }>;
  monthlyRevenue: number[];
  mostPopularGenre: { name: string; count: number };
  leastPopularGenre: { name: string; count: number };
  mostPopularGame: { name: string; count: number };
  leastPopularGame: { name: string; count: number };
  longestWaitlist: { name: string; count: number };
  totalRevenue: number;
  totalTransactions: number;
};

const countBy = (items: string[]) => {
  const map: Record<string, number> = {};
  items.forEach((value) => {
    if (!value) return;
    map[value] = (map[value] || 0) + 1;
  });
  return map;
};

const topN = (map: Record<string, number>, n = 5) => {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));
};

const maxItem = (items: Array<{ name: string; value: number }>) => {
  if (items.length === 0) return { name: 'N/A', count: 0 };
  const top = [...items].sort((a, b) => b.value - a.value)[0];
  return { name: top.name, count: top.value };
};

const minItem = (items: Array<{ name: string; value: number }>) => {
  if (items.length === 0) return { name: 'N/A', count: 0 };
  const bottom = [...items].sort((a, b) => a.value - b.value)[0];
  return { name: bottom.name, count: bottom.value };
};

const isInCurrentMonth = (value: string | null) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const buildCurrentMonthWeeklyRevenue = (transactions: TransactionsLite[]) => {
  const now = new Date();
  const buckets: number[] = [0, 0, 0, 0, 0, 0];
  transactions.forEach((row) => {
    if (!row.created_at || !row.amount) return;
    const txDate = new Date(row.created_at);
    if (Number.isNaN(txDate.getTime())) return;
    if (txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()) {
      const day = txDate.getDate();
      const weekOfMonth = Math.min(Math.floor((day - 1) / 7), 5);
      buckets[weekOfMonth] += Number(row.amount);
    }
  });
  return buckets;
};

const emptyData: DashboardData = {
  genrePopularity: [],
  gamePopularity: [],
  waitlistLengths: [],
  monthlyRevenue: [0, 0, 0, 0, 0, 0],
  mostPopularGenre: { name: 'N/A', count: 0 },
  leastPopularGenre: { name: 'N/A', count: 0 },
  mostPopularGame: { name: 'N/A', count: 0 },
  leastPopularGame: { name: 'N/A', count: 0 },
  longestWaitlist: { name: 'N/A', count: 0 },
  totalRevenue: 0,
  totalTransactions: 0,
};

function PercentageBar({ value, max, color }: { value: number; max: number; color: string }) {
  const width = `${Math.round((value / max) * 100)}%`;

  return (
    <div className="h-2 w-full rounded-full bg-slate-800/90 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width }} />
    </div>
  );
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState<DashboardData>(emptyData);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setErrorMessage('');

      const [gamesRes, rentalsRes, transactionsRes, waitlistRes] = await Promise.all([
        supabase.from('games').select('id, title, genre'),
        supabase.from('rentals').select('game_id, created_at'),
        supabase.from('transactions').select('amount, created_at'),
        supabase.from('waitlist').select('game_id, created_at'),
      ]);

      if (gamesRes.error || rentalsRes.error || transactionsRes.error || waitlistRes.error) {
        console.error('Admin dashboard query errors:', {
          gamesError: gamesRes.error,
          rentalsError: rentalsRes.error,
          transactionsError: transactionsRes.error,
          waitlistError: waitlistRes.error,
        });
        setErrorMessage('Some analytics could not be loaded. Check table permissions/RLS policies.');
      }

      const games = (gamesRes.data || []) as GamesLite[];
      const rentals = (rentalsRes.data || []) as RentalsLite[];
      const transactions = (transactionsRes.data || []) as TransactionsLite[];
      const waitlist = (waitlistRes.data || []) as WaitlistLite[];
      const currentMonthRentals = rentals.filter((r) => isInCurrentMonth(r.created_at));
      const currentMonthTransactions = transactions.filter((t) => isInCurrentMonth(t.created_at));
      const currentMonthWaitlist = waitlist.filter((w) => isInCurrentMonth(w.created_at));

      const gameById = new Map(games.map((g) => [g.id, g]));

      const rentalGameTitles = currentMonthRentals
        .map((r) => (r.game_id ? gameById.get(r.game_id)?.title || 'Unknown Game' : 'Unknown Game'))
        .filter(Boolean);

      const rentalGenres = currentMonthRentals
        .map((r) => (r.game_id ? gameById.get(r.game_id)?.genre || 'Unknown Genre' : 'Unknown Genre'))
        .filter(Boolean);

      const waitlistGameTitles = currentMonthWaitlist
        .map((w) => (w.game_id ? gameById.get(w.game_id)?.title || 'Unknown Game' : 'Unknown Game'))
        .filter(Boolean);

      const genreCounts = countBy(rentalGenres);
      const gameCounts = countBy(rentalGameTitles);
      const waitlistCounts = countBy(waitlistGameTitles);

      const genrePopularity = topN(genreCounts, 5);
      const gamePopularity = topN(gameCounts, 5);
      const waitlistLengths = topN(waitlistCounts, 5);
      const monthlyRevenue = buildCurrentMonthWeeklyRevenue(currentMonthTransactions);
      const totalRevenue = currentMonthTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      const totalTransactions = currentMonthTransactions.length;

      setData({
        genrePopularity,
        gamePopularity,
        waitlistLengths,
        monthlyRevenue,
        mostPopularGenre: maxItem(genrePopularity),
        leastPopularGenre: minItem(genrePopularity),
        mostPopularGame: maxItem(gamePopularity),
        leastPopularGame: minItem(gamePopularity),
        longestWaitlist: maxItem(waitlistLengths),
        totalRevenue,
        totalTransactions,
      });

      setLoading(false);
    };

    void loadDashboard();
  }, []);

  const maxGenre = useMemo(() => {
    if (data.genrePopularity.length === 0) return 1;
    return Math.max(...data.genrePopularity.map((g) => g.value));
  }, [data.genrePopularity]);

  const maxGame = useMemo(() => {
    if (data.gamePopularity.length === 0) return 1;
    return Math.max(...data.gamePopularity.map((g) => g.value));
  }, [data.gamePopularity]);

  const maxWaitlist = useMemo(() => {
    if (data.waitlistLengths.length === 0) return 1;
    return Math.max(...data.waitlistLengths.map((g) => g.value));
  }, [data.waitlistLengths]);

  const peakRevenue = useMemo(() => {
    if (data.monthlyRevenue.length === 0) return 1;
    return Math.max(...data.monthlyRevenue, 1);
  }, [data.monthlyRevenue]);

  const statCards: StatCard[] = [
    {
      label: 'Total Revenue',
      value: loading ? '' : `$${data.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5 text-emerald-300" />,
      accent: 'from-emerald-500/25 to-lime-500/20 border-emerald-500/30',
      note: loading ? '' : 'Current month only',
    },
    {
      label: 'Most Popular Genre',
      value: loading ? '' : data.mostPopularGenre.name,
      icon: <Crown className="w-5 h-5 text-amber-300" />,
      accent: 'from-amber-500/25 to-orange-500/20 border-amber-500/30',
      note: loading ? '' : `${data.mostPopularGenre.count} rentals`,
    },
    {
      label: 'Most Popular Game',
      value: loading ? '' : data.mostPopularGame.name,
      icon: <TrendingUp className="w-5 h-5 text-indigo-300" />,
      accent: 'from-indigo-500/25 to-violet-500/20 border-indigo-500/30',
      note: loading ? '' : `${data.mostPopularGame.count} rentals`,
    },
    {
      label: 'Least Popular Genre',
      value: loading ? '' : data.leastPopularGenre.name,
      icon: <TrendingDown className="w-5 h-5 text-pink-300" />,
      accent: 'from-pink-500/25 to-rose-500/20 border-pink-500/30',
      note: loading ? '' : `${data.leastPopularGenre.count} rentals`,
    },
    {
      label: 'Least Popular Game',
      value: loading ? '' : data.leastPopularGame.name,
      icon: <TrendingDown className="w-5 h-5 text-cyan-300" />,
      accent: 'from-cyan-500/25 to-sky-500/20 border-cyan-500/30',
      note: loading ? '' : `${data.leastPopularGame.count} rentals`,
    },
    {
      label: 'Total Transactions',
      value: loading ? '' : data.totalTransactions.toLocaleString(),
      icon: <Receipt className="w-5 h-5 text-purple-300" />,
      accent: 'from-purple-500/25 to-fuchsia-500/20 border-purple-500/30',
      note: loading ? '' : 'Current month only',
    },
    {
      label: 'Longest Waitlist',
      value: loading ? '' : data.longestWaitlist.name,
      icon: <Users className="w-5 h-5 text-teal-300" />,
      accent: 'from-teal-500/25 to-cyan-500/20 border-teal-500/30',
      note: loading ? '' : `${data.longestWaitlist.count} entries this month`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-4">
              <BarChart3 className="w-4 h-4 text-indigo-300" />
              <span className="text-sm font-semibold text-indigo-200">Admin Analytics (Live Data)</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">Admin Dashboard</h1>
            <p className="text-gray-400 text-lg">All metrics below represent current-month platform stats from Supabase.</p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {errorMessage}
            </div>
          )}

          {loading && (
            <div className="mb-6 rounded-xl border border-indigo-500/25 bg-slate-900/40 px-4 py-3 text-sm text-indigo-200">
              Loading analytics...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border bg-gradient-to-br ${card.accent} p-5 backdrop-blur-sm shadow-lg shadow-black/20`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-gray-300 text-sm mb-2">{card.label}</p>
                    <h3 className="text-2xl font-bold text-white leading-tight">{card.value}</h3>
                  </div>
                  <div className="p-2 rounded-lg bg-black/20">{card.icon}</div>
                </div>
                <p className="text-xs text-gray-300 mt-3">{card.note}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-indigo-500/25 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white mb-2">Genre Popularity</h2>
              <p className="text-sm text-gray-400 mb-5">Current-month rental count by genre</p>
              <div className="space-y-4">
                {data.genrePopularity.map((genre) => (
                  <div key={genre.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-200">{genre.name}</span>
                      <span className="text-sm text-indigo-300 font-semibold">{genre.value}</span>
                    </div>
                    <PercentageBar value={genre.value} max={maxGenre} color="bg-gradient-to-r from-indigo-500 to-violet-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/25 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white mb-2">Game Popularity</h2>
              <p className="text-sm text-gray-400 mb-5">Current-month rentals by game</p>
              <div className="space-y-4">
                {data.gamePopularity.map((game) => (
                  <div key={game.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-200">{game.name}</span>
                      <span className="text-sm text-pink-300 font-semibold">{game.value}</span>
                    </div>
                    <PercentageBar value={game.value} max={maxGame} color="bg-gradient-to-r from-pink-500 to-rose-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/25 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white mb-2">Revenue Trend</h2>
              <p className="text-sm text-gray-400 mb-5">Current-month revenue by week</p>
              <div className="grid grid-cols-6 gap-2 items-end h-48">
                {data.monthlyRevenue.map((amount, index) => {
                  const barHeight = `${Math.round((amount / peakRevenue) * 100)}%`;
                  return (
                    <div key={index} className="h-full flex flex-col justify-end gap-2">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-lime-400 shadow-lg shadow-emerald-500/20"
                        style={{ height: barHeight }}
                        title={`$${amount.toLocaleString()}`}
                      />
                      <span className="text-[11px] text-gray-400 text-center">W{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/25 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white mb-2">Longest Waitlists</h2>
              <p className="text-sm text-gray-400 mb-5">Games with most new waitlist entries this month</p>
              <div className="space-y-4">
                {data.waitlistLengths.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-200">{item.name}</span>
                      <span className="text-sm text-teal-300 font-semibold">{item.value} users</span>
                    </div>
                    <PercentageBar value={item.value} max={maxWaitlist} color="bg-gradient-to-r from-teal-500 to-cyan-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
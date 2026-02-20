import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserWaitlist, leaveWaitlist, type WaitlistEntry } from '../services/waitlistService';
import { Link } from 'react-router-dom';

export default function WaitlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleLeave = async (id: string) => {
    if (!confirm("Are you sure you want to give up your spot?")) return;
    try {
      await leaveWaitlist(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Error removing item");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading your list...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Waitlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 mb-4">You aren't waiting for any games yet.</p>
          <Link to="/games" className="text-blue-600 hover:underline font-semibold">
            Browse Library
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col sm:flex-row items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200 gap-4"
            >
              {/* Game Image */}
              <div className="w-full sm:w-24 h-24 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                {item.games?.image_url ? (
                  <img 
                    src={item.games.image_url} 
                    alt={item.games.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg text-slate-800">{item.games?.title || 'Unknown Game'}</h3>
                <p className="text-slate-500 text-sm">Joined on: {new Date(item.created_at).toLocaleDateString()}</p>
              </div>

              {/* Status Badge */}
              <div className="px-6 py-2 bg-amber-50 text-amber-700 rounded-full font-bold border border-amber-100">
                Position #{item.position}
              </div>

              {/* Action */}
              <button
                onClick={() => handleLeave(item.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded transition-colors text-sm font-semibold"
              >
                Leave Line
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
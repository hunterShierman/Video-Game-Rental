import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWaitlistStatus, joinWaitlist, leaveWaitlist } from '../services/waitlistService';
import { Clock } from 'lucide-react'; 

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
    e.preventDefault();  // <-- FORCES the browser to ignore the card click
    e.stopPropagation(); // <-- Stops the click from bubbling up
    
    if (!user) {
      alert("You must be logged in to join the waitlist.");
      return;
    }

    setLoading(true);
    try {
      if (waitlistId) {
        await leaveWaitlist(waitlistId);
        setWaitlistId(null);
        setPosition(null);
        alert(`Removed from waitlist for ${gameTitle}`);
      } else {
        const newEntry = await joinWaitlist(gameId, user.id);
        setWaitlistId(newEntry.id);
        setPosition(newEntry.position);
        alert(`Joined waitlist for ${gameTitle}! You are #${newEntry.position} in line.`);
      }
      if (onStatusChange) onStatusChange();
    } catch (err: any) {
      alert(err.message || "Failed to update waitlist");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="text-xs text-gray-400">Loading status...</div>;

  return (
    <div className="flex flex-col gap-1 items-start w-full relative z-50">
      <button
        onClick={handleClick}
        type="button" 
        className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all w-full justify-center !cursor-pointer !pointer-events-auto ${
          waitlistId
            ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
            : 'bg-indigo-600 text-white hover:bg-indigo-500'
        }`}
      >
        <Clock size={16} />
        {loading 
          ? 'Processing...' 
          : waitlistId 
            ? 'Leave Waitlist' 
            : 'Join Waitlist'}
      </button>
      
      {waitlistId && position && (
        <span className="text-xs font-medium text-amber-600 ml-1">
          You are #{position} in line
        </span>
      )}
    </div>
  );
}
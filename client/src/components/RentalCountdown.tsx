import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface RentalCountdownProps {
  endDate: string;
  rentalId: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Calculates how much time is left between now and the end date
const calculateTimeLeft = (endDate: string): TimeLeft | null => {
  const difference = new Date(endDate).getTime() - new Date().getTime();

  // Rental has expired
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

// Pads single digit numbers with a leading zero (e.g. 5 → "05")
const pad = (n: number): string => String(n).padStart(2, '0');

// add this comment to ignore the unused parameter error for rentalID, not needed now but will be needed in the future
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RentalCountdown = ({ endDate, rentalId }: RentalCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(endDate));

  useEffect(() => {
    // Recalculate every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(timer);
  }, [endDate]);

  // Expired state
  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <p className="text-red-400 text-sm font-semibold">Rental expired</p>
      </div>
    );
  }

  // Warning state — less than 24 hours left
  const isUrgent = timeLeft.days === 0;

  return (
    <div className={`border rounded-xl p-4 ${
      isUrgent
        ? 'bg-red-900/20 border-red-500/30'
        : 'bg-slate-900/60 border-indigo-500/20'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-indigo-400'}`} />
        <p className={`text-xs font-semibold uppercase tracking-wider ${
          isUrgent ? 'text-red-400' : 'text-gray-400'
        }`}>
          {isUrgent ? 'Expiring soon' : 'Time remaining'}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map((unit) => (
          <div
            key={unit.label}
            className={`rounded-lg p-2 text-center ${
              isUrgent ? 'bg-red-900/30' : 'bg-slate-800/60'
            }`}
          >
            <p className={`text-2xl font-bold font-mono ${
              isUrgent ? 'text-red-300' : 'text-white'
            }`}>
              {pad(unit.value)}
            </p>
            <p className="text-gray-500 text-xs uppercase tracking-wider mt-0.5">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RentalCountdown;
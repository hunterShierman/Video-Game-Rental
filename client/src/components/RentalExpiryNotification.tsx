import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface RentalExpiryNotificationProps {
  startDate: string;
  endDate: string;
  gameTitle: string;
  gameId: string;
}

type RentalStatus = 'active' | 'halfway';

const getRentalStatus = (startDate: string, endDate: string): RentalStatus => {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 'active';
  }

  if (now >= end) {
    return 'active';
  }

  const halfwayPoint = start + (end - start) / 2;

  if (now >= halfwayPoint) {
    return 'halfway';
  }

  return 'active';
};

const RentalExpiryNotification = ({
  startDate,
  endDate,
  gameTitle,
}: RentalExpiryNotificationProps) => {
  const [status, setStatus] = useState<RentalStatus>(
    getRentalStatus(startDate, endDate)
  );

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getRentalStatus(startDate, endDate));
    };

    updateStatus();

    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (status === 'active') {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/30 rounded-xl p-4 mt-4">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-yellow-300 font-bold mb-1">
            Reminder! You are halfway into your expiry date!
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Make sure you lock in and finish that game! School or Work can wait,
            but <span className="text-white font-semibold">{gameTitle}</span> can&apos;t.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RentalExpiryNotification;
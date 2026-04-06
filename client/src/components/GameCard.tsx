import { useNavigate } from 'react-router-dom';
import { Gamepad2, Star, Clock } from 'lucide-react';
import type { Game } from '../types/definitions';
import { RENTAL_DURATION_DAYS } from '../utils/constants';

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  const navigate = useNavigate();
  const isAvailable = game.available_copies > 0;

  return (
    <div
      onClick={() => navigate(`/games/${game.id}`)}
      className="group bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer relative"
    >
      <div className="relative h-64 bg-slate-800/60 overflow-hidden">
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={game.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2 className="w-12 h-12 text-slate-600" />
          </div>
        )}

        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
          isAvailable
            ? 'bg-green-500/50 border border-green-500/40 text-green-400'
            : 'bg-red-500/50 border border-red-500/40 text-red-400'
        }`}>
          {isAvailable ? `${game.available_copies} Available` : 'Unavailable'}
        </div>

        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-300 border border-slate-700/50">
          {game.platform}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-lg leading-tight">{game.title}</h3>
          <span className="text-indigo-400 font-bold text-lg ml-2 shrink-0">${game.price}</span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-400 bg-slate-800/60 px-2 py-1 rounded-full">
            {game.genre}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Star className="w-3 h-3 text-yellow-400" />
            <span>{game.popularity_score}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>{RENTAL_DURATION_DAYS} days</span>
          </div>
        </div>

        {game.description && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
            {game.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-indigo-400 text-sm font-semibold group-hover:text-indigo-300 transition-colors">
            View details →
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
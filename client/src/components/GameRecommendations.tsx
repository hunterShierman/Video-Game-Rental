import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gamepad2, Film, Users, Loader2 } from 'lucide-react';
import { getRecommendedGames } from '../services/gameService';
import type { Game } from '../types/definitions';

const GameRecommendations = () => {
    const [recommendations, setRecommendations] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const data = await getRecommendedGames();
                setRecommendations(data);
            } catch (error) {
                console.error('Failed to load recommendations', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    // If still loading, or if the user has no recommendations (e.g., no rental history), render nothing or a loader
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null; // Don't show the section at all if there's nothing to recommend
    }

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 w-10 h-10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
                    <p className="text-sm text-gray-400">Based on your rental history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((game) => (
                    <div
                        key={game.id}
                        onClick={() => navigate(`/games/${game.id}`)}
                        className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group"
                    >
                        {/* Game Image */}
                        <div className="h-48 bg-gradient-to-br from-indigo-900/10 to-purple-900/40 relative overflow-hidden">
                            {game.image_url ? (
                                <img
                                    src={game.image_url}
                                    alt={game.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Film className="w-12 h-12 text-indigo-500/30" />
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className="bg-indigo-500/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {game.genre}
                                </span>
                            </div>
                        </div>

                        {/* Game Details */}
                        <div className="p-5">
                            <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Gamepad2 className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">{game.platform}</span>
                                    </div>
                                    <span className="text-indigo-400 font-bold">${game.price}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span className="text-green-400">{game.available_copies} Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameRecommendations;
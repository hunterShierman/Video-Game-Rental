import { useState, useEffect } from 'react';
import {
    Clock, Gamepad2, History, Key, Calendar, DollarSign,
    Film, Loader2, AlertCircle, CheckCircle, RefreshCw
} from 'lucide-react';
import Navbar from '../components/NavBar';
import { getMyActiveRentals, getMyRentalHistory, expireStaleRentals } from '../services/rentalService';
import type { RentalWithGame } from '../types/definitions';
import { useNavigate } from 'react-router-dom';
import RentalExpiryNotification from '../components/RentalExpiryNotification';
import { formatDisplayDate } from '../utils/date';


const MyRentalsPage = () => {
    const [activeRentals, setActiveRentals] = useState<RentalWithGame[]>([]);
    const [rentalHistory, setRentalHistory] = useState<RentalWithGame[]>([]);
    const [loading, setLoading] = useState({
        active: true,
        history: true
    });
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // fetch both active and history rentals on page load
    useEffect(() => {
        fetchAllRentals();
    }, []);

    const fetchAllRentals = async () => {
        setError(null);

        try {
            // fetch active rentals
            try {
                await expireStaleRentals();
                const active = await getMyActiveRentals();
                setActiveRentals(active);
            } catch (err) {
                console.error('Error fetching active rentals:', err);
                setError(err instanceof Error ? err.message : 'Failed to load active rentals');

            } finally {
                setLoading(prev => ({ ...prev, active: false }));
            }
            // fetch rental history 
            try {
                const history = await getMyRentalHistory();
                setRentalHistory(history);
            } catch (err) {
                console.error('Error fetching rental history:', err);
                setError(err instanceof Error ? err.message : 'Failed to load rental history');

            } finally {
                setLoading(prev => ({ ...prev, history: false }));
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load your rentals. Please try again.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className='inline-flex items-center gap-1 text-xs font-bold text-green-300 bg-green-500/50 border border-green-500/50 px-3 py-1 rounded-full'>
                        <CheckCircle className='w-3 h-3' />
                        ACTIVE
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 bg-blue-500/50 border border-blue-500/50 px-3 py-1 rounded-full">
                        <History className='w-3 h-3' />
                        COMPLETED
                    </span>
                );
            case 'extended':
                return (
                    <span className='inline-flex items-center gap-1 text-xs font-bold text-orange-300 bg-orange-500/50 border border-orange-500/50 px-3 py-1 rounded-full'>
                        <RefreshCw className='w-3 h-3' />
                        EXTENDED
                    </span>
                );
            default:
                return (
                    <span className='inline-flex items-center gap-1 text-xs font-bold text-gray-300 bg-gray-500/10 border border-gray-500/50 px-3 py-1 rounded-full'>
                        {status.toUpperCase()}
                    </span>
                );
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950'>
            <Navbar />

            <div className='pt-32 pb-20 px-6 max-w-7xl mx-auto'>
                <div className='mb-10'>
                    <div className='inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-4'>
                        <Gamepad2 className='w-4 h-4 text-indigo-400' />
                        <span className='text-sm text-indigo-300 font-medium'>Game Library</span>
                    </div>
                    <h1 className='text-4xl font-bold text-white mb-2'>My Rentals</h1>
                    <p className='text-gray-400'>Locate your Active Rentals and view your rental history</p>

                </div>
                {/*error handling*/}
                {error && (
                    <div className='bg-gradient-to-br from-red-900/10 border border-red-500/30 rounded-2x1 p-6 mb-6 flex items-start gap-3'>
                        <AlertCircle className='w-5 h-5 text-red-400 mt-0.5 shrink-0' />
                        <div>
                            <p className='text-white font-semibold mb-1'>Something went wrong</p>
                            <p className='text-red-300 text-sm'>{error}</p>
                        </div>
                        <button
                            onClick={fetchAllRentals}
                            className='ml-auto bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors'>
                            Try Again
                        </button>
                    </div>
                )}

                {/* Active Rentals */}
                <div className='mb-12'>
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='bg-gradient-to-br from green-600/20 to-emerald-600/20 w-10 h-10 rounded-xl flex items-center justify-center'>
                            <Clock className='w-5 h-5 text-green-400' />
                        </div>
                        <h2 className='text-2xl font-bold text-white'>Active Rentals</h2>
                        {!loading.active && (
                            <span className='bg-green-500/20 text-green-400 text-sm font-semibold x-3 py-1 rounded-full'>
                                {activeRentals.length} {activeRentals.length === 1 ? 'game' : 'games'}
                            </span>
                        )}
                    </div>
                    {loading.active ? (
                        <div className='flex items-center justify-center py-12'>
                            <Loader2 className='w-8 h-8 text-indigo-400 animate-spin' />
                        </div>
                    ) : activeRentals.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {activeRentals.map((rental) => (
                                <div
                                    key={rental.id}
                                    onClick={() => navigate(`/rental/${rental.id}/extend/${rental.game_id}`)}
                                    className='bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-green-500/30 rounded-2xl overflow-hidden cursor-pointer hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10'>
                                    {/* game images */}
                                    <div className='h-40 bg-gradient-to-br from-indigo-900/10 to-purple-900/40 relative'>
                                        {rental.games.image_url ? (
                                            <img
                                                src={rental.games.image_url}
                                                alt={rental.games.title}
                                                className='w-full h-full object-cover' />
                                        ) : (
                                            <div className='w-full h-full flex items-center justify-center'>
                                                <Film className='w-12 h-12 text-indigo-500/30' />
                                            </div>
                                        )}
                                        <div className='absolute top-3 right-3'>
                                            {getStatusBadge(rental.status)}
                                        </div>
                                    </div>
                                    <div className='p-5'>

                                        <h3 className='text-xl font-bold text-white mb-2'>{rental.games.title}</h3>
                                        <div className='space-y-2 mb-4'>
                                            <div className='flex items-center gap-2 text-sm'>
                                                <Gamepad2 className='w-4 h-4 text-gray-500' />
                                                <span className='text-gray-400'>{rental.games.platform || 'Multi-platform'}</span>

                                            </div>
                                            <div className='flex items-center gap-2 text-sm'>
                                                <Key className='w-4 h-4 text-gray-500' />
                                                <span className='text-gray-400 font-mono text-xs'>{rental.access_key}</span>

                                            </div>
                                            <div className='flex items-center gap-2 text-sm'>
                                                <Calendar className='w-4 h-4 text-gray-500' />
                                                <span className='text-gray-400'>Returns: {formatDisplayDate(rental.end_date)}</span>

                                            </div>
                                            <div className='flex items-center gap-2 text-sm'>
                                                <DollarSign className='w-4 h-4 text-gray-500' />
                                                <span className='text-gray-400'>${rental.price}</span>

                                            </div>
                                        </div>
                                        <RentalExpiryNotification
                                            startDate={rental.start_date}
                                            endDate={rental.end_date}
                                            gameTitle={rental.games.title}
                                            gameId={rental.game_id}
                                        />
                                        {/* Coutdown timer */}

                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='bg-gradient-to-br from-slate-900/30 to-slate-800/20 border border-indigo-500/20 rounded-2xl p-12 text-center'>
                            <Clock className='w-16 h-16 text-gray-600 mx-auto mb-4' />
                            <h3 className='text-xl font-bold text-white mb-2'>No Active Rentals</h3>
                            <p className='text-gray-400 mb-6'>No active game rentals found.</p>
                            <a href="/games"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30">
                                <Gamepad2 className='w-4 h-4' />
                                Browse Games

                            </a>
                        </div>


                    )}
                </div>

                {/*Rental History Section*/}
                <div>
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='bg-gradient-to-br from-purple-600/20 to-pink-600/20 w-10 h-10 rounded-xl flex items-center justify-center'>
                            <History className='w-5 h-5 text-purple-400' />
                        </div>
                        <h2 className='text-2xl font-bold text-white'>Rental History</h2>
                        {!loading.history && (
                            <span className='bg-purple-500/20 text-purple-400 text-sm font-semibold px-3 py-1 rounded-full'>
                                {rentalHistory.length} {rentalHistory.length === 1 ? 'rental' : 'rentals'}
                            </span>
                        )}
                    </div>

                    {loading.history ? (
                        <div className='flex items-center justify-center py-12'>
                            <Loader2 className='w-8 h-8 text-indigo-400 animate-spin' />
                        </div>
                    ) : rentalHistory.length > 0 ? (
                        <div className='bg-gradient-to-br from-slate-900/40 to-slate-800/20 border border-purple-500/20 rounded-2xl overflow-hidden'>
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='border-b border-purple-500/20'>
                                            <th className='text-left text-gray-400 text-sm font-semibold py-4 px-6'>Game</th>
                                            <th className="text-left text-gray-400 text-sm font-semibold py-4 px-6">Platform</th>
                                            <th className="text-left text-gray-400 text-sm font-semibold py-4 px-6">Rented On</th>
                                            <th className="text-left text-gray-400 text-sm font-semibold py-4 px-6">Returned On</th>
                                            <th className="text-left text-gray-400 text-sm font-semibold py-4 px-6">Price</th>
                                            <th className="text-left text-gray-400 text-sm font-semibold py-4 px-6">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rentalHistory.map((rental) => (
                                            <tr key={rental.id} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors align-top">
                                                <td className='py-4 px-6'>
                                                    <div className='flex items-center gap-3'>
                                                        {rental.games.image_url ? (
                                                            <img
                                                                src={rental.games.image_url}
                                                                alt={rental.games.title}
                                                                className='w-10 h-10 rounded object-cover'
                                                            />
                                                        ) : (
                                                            <div className='w-10 h-10 bg-indigo-500/30 rounded flex items-center justify-center'>
                                                                <Film className='w-5 h-5 text-indigo-500/30' />
                                                            </div>
                                                        )}
                                                        <span className='text-white font-medium'>{rental.games.title}</span>
                                                    </div>
                                                </td>

                                                <td className='py-4 px-6 text-gray-400'>
                                                    {rental.games.platform || 'Multi-platform'}
                                                </td>

                                                <td className='py-4 px-6 text-gray-400'>
                                                    {formatDisplayDate(rental.start_date)}
                                                </td>

                                                <td className='py-4 px-6 text-gray-400'>
                                                    {rental.end_date ? formatDisplayDate(rental.end_date) : '-'}
                                                </td>

                                                <td className='py-4 px-6 text-gray-400'>
                                                    ${rental.price}
                                                </td>

                                                <td className='py-4 px-6'>
                                                    {getStatusBadge(rental.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className='bg-gradient-to-br from-slate-900/30 to-slate-800/20 border border-indigo-500/20 rounded-2xl p-12 text-center'>
                            <History className='w-16 h-16 text-gray-600 mx-auto mb-4' />
                            <h3 className='text-xl font-bold text-white mb-2'>No Rental History</h3>
                            <p className='text-gray-400'>Rental history will appear once you start renting games</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};




export default MyRentalsPage


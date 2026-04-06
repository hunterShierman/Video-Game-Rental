// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { Gamepad2, Key, Star, Clock, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '../components/NavBar';
import type { Game } from '../types/definitions';
import GameCard from '../components/GameCard';
import { getTrendingGames } from '../services/gameService';

function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    const loadTrendingGames = async () => {
      try {
        const data = await getTrendingGames();
        setTrendingGames(data);
      } catch (error) {
        console.error('Failed to load trending games:', error);
      } finally {
        setTrendingLoading(false);
      }
    };

    loadTrendingGames();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Floating Animation */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">500+ retro classics from NES to PS2</span>
          </div>

          {/* Main Headline with Hover Float Animation */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-normal">
            <span className="inline-block hover:animate-float transition-transform duration-300">
              Rent Retro Games,
            </span>
            <br />
            <span className="inline-block hover:animate-float transition-transform duration-300 delay-75 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pb-4">
              Skip the Cartridge Hunt
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Why hunt down old cartridges or pay collector prices? Rent the classics you loved,
            or discover the ones you missed, and only pay for what you actually play.
          </p>

          {/* Social Proof Numbers */}
          <div className="flex justify-center gap-8 mb-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>15,000+ classics rented</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>4.8/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>No commitment</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/browse-page"
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-2xl shadow-indigo-500/50 flex items-center gap-2"
            >
              Browse Games
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Trending Games Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Trending Games</h2>
            <p className="text-gray-400">
              Most rented classics right now
            </p>
          </div>
        </div>

        {trendingLoading ? (
          <div className="text-gray-400">Loading trending games...</div>
        ) : trendingGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {trendingGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-gray-400">No trending games available right now.</div>
        )}
      </div>

      {/* Live Activity Ticker */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-y border-indigo-500/20 py-4 overflow-hidden">
        <div className="flex gap-12 animate-scroll whitespace-nowrap">
          {[
            "🕹️ Sarah just rented Super Mario Bros 3",
            "⭐ Mike reviewed The Legend of Zelda: A Link to the Past - 5 stars",
            "🕹️ Alex added Sonic the Hedgehog 2 to waitlist",
            "⭐ Emma rented Street Fighter II",
            "🕹️ Tom just started playing Donkey Kong Country"
          ].concat([
            "🕹️ Sarah just rented Super Mario Bros 3",
            "⭐ Mike reviewed The Legend of Zelda: A Link to the Past - 5 stars",
            "🕹️ Alex added Sonic the Hedgehog 2 to waitlist"
          ]).map((activity, i) => (
            <span key={i} className="text-gray-400 text-sm font-medium">
              {activity}
            </span>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-gray-400 text-lg">A complete retro gaming rental experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Gamepad2 className="w-7 h-7 text-indigo-400" />,
              title: "Browse & Filter",
              description: "Explore our retro library with filtering by genre, console, and era. Find NES gems, SNES classics, N64 hits, and more in seconds.",
              stats: "500+ Classics"
            },
            {
              icon: <Key className="w-7 h-7 text-purple-400" />,
              title: "Instant Access Keys",
              description: "Get unique rental keys delivered instantly via email. Keys automatically expire at the end of your rental period, no cartridge hunting required.",
              stats: "Secure Key"
            },
            {
              icon: <Star className="w-7 h-7 text-pink-400" />,
              title: "User Reviews",
              description: "Read honest reviews from real retro gamers. Share your experiences and help others rediscover the classics that defined gaming.",
              stats: "4.8★ Rated"
            }
          ].map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-8 hover:border-indigo-500/60 transition-all hover:transform hover:scale-105 relative overflow-hidden h-full"
            >
              {/* Gradient Glow on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />

              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">
                  {feature.stats}
                </span>
              </div>

              <p className="text-gray-400 leading-relaxed">{feature.description}</p>

              {hoveredCard === index && (
                <div className="mt-4 text-indigo-400 font-semibold text-sm flex items-center gap-2">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Get started in just 4 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              icon: <Gamepad2 className="w-8 h-8" />,
              title: "Browse Games",
              description: "Filter by genre, console era, and rating to find your next retro adventure"
            },
            {
              step: "02",
              icon: <Clock className="w-8 h-8" />,
              title: "Rent for a Week",
              description: "Pay $3-7 depending on game rarity. No commitment, no cartridge shipping"
            },
            {
              step: "03",
              icon: <Key className="w-8 h-8" />,
              title: "Get Your Key",
              description: "Receive a unique access code instantly via email"
            },
            {
              step: "04",
              icon: <Star className="w-8 h-8" />,
              title: "Play & Review",
              description: "Relive the nostalgia and share your take with the retro gaming community"
            }
          ].map((item, index) => (
            <div
              key={index}
              className="relative group h-full"
            >
              {/* Connector Line */}
              {index < 3 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent -z-10" />
              )}

              <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-indigo-500/20 rounded-2xl p-8 hover:border-indigo-500/50 transition-all hover:transform hover:scale-105 h-full">
                <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-indigo-400/40 text-sm font-bold mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-indigo-900/30 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white text-xl font-bold mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span>GameRent</span>
              </div>
              <p className="text-gray-400 text-sm">Retro gaming for everyone. Rent, play, relive.</p>
            </div>
          </div>

          <div className="border-t border-indigo-900/30 pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 GameRent. All rights reserved. Making retro gaming accessible and affordable.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default HomePage;
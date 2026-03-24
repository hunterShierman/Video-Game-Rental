// src/services/gameService.ts
import { supabase } from '../lib/supabaseClient';
import type { Game } from '../types/definitions';

/**
 * Fetch all games from the database
 */
export const getAllGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching games:', error);
    throw error;
  }

  return data || [];
};

/**
 * Fetch a single game by ID
 */
export const getGameById = async (id: string): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching game:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch games by genre
 */
export const getGamesByGenre = async (genre: string): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('genre', genre)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching games by genre:', error);
    throw error;
  }

  return data || [];
};

/**
 * Fetch games by platform
 */
export const getGamesByPlatform = async (platform: string): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('platform', platform)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching games by platform:', error);
    throw error;
  }

  return data || [];
};

/**
 * Search games by title
 */
export const searchGames = async (searchTerm: string): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .ilike('title', `%${searchTerm}%`)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error searching games:', error);
    throw error;
  }

  return data || [];
};

/**
 * Fetch only available games (copies > 0)
 */
export const getAvailableGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .gt('available_copies', 0)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching available games:', error);
    throw error;
  }

  return data || [];
};


// Get game recommendations based on genres of game in rental history 
export const getRecommendedGames = async (): Promise<Game[]> => {
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Find genre of associated game
  const { data: rentals, error: rentalError } = await supabase
    .from('rentals')
    .select('game_id, games!inner(genre)')
    .eq('user_id', user.id);

  if (rentalError) {
    console.error('Error fetching rentals for recommendations:', rentalError);
    return [];
  }

  // No rental history
  if (!rentals || rentals.length === 0) return [];

  // Find unique game ID/genre
  const rentedGameIds = rentals.map(r => r.game_id);
  
  const genres = [...new Set(rentals.map(r => {
    // Bypass strict type error
    const gameData = r.games as any;
    // Check if Supabase returned an array or object then grab genre
    return Array.isArray(gameData) ? gameData[0]?.genre : gameData?.genre;
  }).filter(Boolean))];

  if (genres.length === 0) return [];

  // Get available games matching those genres
  const { data: matchingGames, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .in('genre', genres)
    .gt('available_copies', 0); // Only recommend available games

  if (gamesError) {
    console.error('Error fetching recommended games:', gamesError);
    return [];
  }

  // Filter out already rented games and limit to 3
  const recommended = (matchingGames || [])
    .filter(game => !rentedGameIds.includes(game.id))
    .slice(0, 3);

  return recommended;
};
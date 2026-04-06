// src/services/gameService.ts
import { supabase } from '../lib/supabaseClient';
import type { Game, CreateGameInput, UpdateGameInput } from '../types/definitions';

type RentalGenreJoinRow = {
  game_id: string;
  games: { genre: string } | Array<{ genre: string }> | null;
};

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

/**
 * Fetch trending games
 */
export const getTrendingGames = async () => {
  const { data, error } = await supabase.rpc('get_trending_games');

  if (error) {
    console.error('Error fetching trending games:', error);
    throw error;
  }

  return data || [];
}; // <-- FIXED: missing bracket added here

/**
 * Get game recommendations based on genres of games in rental history
 */
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

  const rentalRows = rentals as RentalGenreJoinRow[];

  // Find unique game ID/genre
  const rentedGameIds = rentalRows.map((r) => r.game_id);

  const genres = [
    ...new Set(
      rentalRows
        .map((r) => {
          const gameData = r.games;
          return Array.isArray(gameData)
            ? gameData[0]?.genre
            : gameData?.genre;
        })
        .filter((genre): genre is string => Boolean(genre))
    ),
  ];

  if (genres.length === 0) return [];

  // Get available games matching those genres
  const { data: matchingGames, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .in('genre', genres)
    .gt('available_copies', 0);

  if (gamesError) {
    console.error('Error fetching recommended games:', gamesError);
    return [];
  }

  // Filter out already rented games and limit to 3
  const recommended = (matchingGames || [])
    .filter((game) => !rentedGameIds.includes(game.id))
    .slice(0, 3);

  return recommended;
};

/**
 * Create a new game (admin only)
 */
export const createGame = async (input: CreateGameInput): Promise<Game> => {
  const { data, error } = await supabase
    .from('games')
    .insert({
      title: input.title,
      description: input.description ?? null,
      genre: input.genre,
      platform: input.platform,
      release_year: input.release_year ?? null,
      price: input.price,
      image_url: input.image_url ?? null,
      total_copies: input.total_copies ?? 1,
      available_copies: input.available_copies ?? input.total_copies ?? 1,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating game:', error);
    throw error;
  }

  return data;
};

/**
 * Update a game (admin only)
 */
export const updateGame = async (id: string, input: UpdateGameInput): Promise<Game> => {
  const { data, error } = await supabase
    .from('games')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating game:', error);
    throw error;
  }

  return data;
};

/**
 * Hard delete a game (admin only)
 */
export const deleteGame = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
};

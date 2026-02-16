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
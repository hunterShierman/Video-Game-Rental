// src/services/rentalService.ts
import { supabase } from '../lib/supabaseClient';
import type { Rental, RentalWithGame, CreateRentalInput } from '../types/definitions';

// Generates a rental access key in the format RENT-XXXX-XXXX-XXXX
const generateAccessKey = (): string => {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RENT-${segment()}-${segment()}-${segment()}`;
};

// Returns an ISO date string 7 days from now
const getRentalEndDate = (): string => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  return endDate.toISOString();
};

// Checks if the current user already has an active rental for a given game
// Call this before rentGame() to avoid duplicates
export const hasActiveRental = async (gameId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('rentals')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error checking active rental:', error);
    throw error;
  }

  return data !== null;
};

// Main rental function — runs through the full flow:
// 1. Auth check
// 2. Duplicate rental check
// 3. Availability check
// 4. Create rental record
// 5. Decrement available_copies
// 6. Log the transaction
export const rentGame = async (gameId: string): Promise<Rental> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const alreadyRented = await hasActiveRental(gameId);
  if (alreadyRented) throw new Error('You already have an active rental for this game');

  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id, price, available_copies')
    .eq('id', gameId)
    .single();

  if (gameError || !game) throw new Error('Game not found');
  if (game.available_copies <= 0) throw new Error('No copies available');

  const rentalInput: CreateRentalInput = {
    game_id: gameId,
    access_key: generateAccessKey(),
    end_date: getRentalEndDate(),
    price: game.price,
  };

  const { data: rental, error: rentalError } = await supabase
    .from('rentals')
    .insert({
      ...rentalInput,
      user_id: user.id,
      status: 'active',
    })
    .select()
    .single();

  if (rentalError || !rental) {
    console.error('Error creating rental:', rentalError);
    throw new Error('Failed to create rental');
  }

  // Decrement available_copies — not atomic with the rental insert above,
  // so if this fails we have an orphaned rental. Good enough for now, revisit later
  const { error: updateError } = await supabase
    .from('games')
    .update({ available_copies: game.available_copies - 1 })
    .eq('id', gameId);

  if (updateError) {
    console.error('Error updating game copies:', updateError);
    throw new Error('Rental created but failed to update game availability');
  }

  // Transaction log — non-fatal if this fails, rental still goes through
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      rental_id: rental.id,
      amount: game.price,
      transaction_type: 'rental',
    });

  if (transactionError) {
    console.error('Error creating transaction:', transactionError);
  }

  return rental;
};

// Fetches active rentals for the current user, joined with basic game info
// Sorted by end_date so soonest expiring shows first
export const getMyActiveRentals = async (): Promise<RentalWithGame[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('rentals')
    .select('*, games(title, image_url, platform)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('end_date', { ascending: true });

  if (error) {
    console.error('Error fetching active rentals:', error);
    throw error;
  }

  return (data as RentalWithGame[]) || [];
};

// Fetches full rental history for the current user, newest first
export const getMyRentalHistory = async (): Promise<RentalWithGame[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('rentals')
    .select('*, games(title, image_url, platform)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rental history:', error);
    throw error;
  }

  return (data as RentalWithGame[]) || [];
};
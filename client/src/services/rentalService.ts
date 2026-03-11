// src/services/rentalService.ts
import { supabase } from '../lib/supabaseClient';
import type { Rental, RentalWithGame, CreateRentalInput, ExtensionEligibility } from '../types/definitions';

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
    .in('status', ['active', 'extended'])
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
    .in('status', ['completed', 'expired'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rental history:', error);
    throw error;
  }

  return (data as RentalWithGame[]) || [];
};

// Call this BEFORE extending — use the result to show the cost confirmation UI.
// Returns eligibility, the extension cost, and the projected new end date.
// Blocks extension if an active waitlist exists for the game.
export const checkExtensionEligibility = async (rentalId: string): Promise<ExtensionEligibility> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Fetch the rental (must belong to current user and be active)
  const { data: rental, error: rentalError } = await supabase
    .from('rentals')
    .select('id, game_id, end_date, status, price')
    .eq('id', rentalId)
    .eq('user_id', user.id)
    .single();

  if (rentalError || !rental) throw new Error('Rental not found');
  if (rental.status == 'expired') {
    return { eligible: false, reason: 'Only active rentals can be extended.', extensionCost: 0, newEndDate: '' };
  }

  // Add a restriction that only allows users the ability to renew within 2 days of expiry (prevents spamming renew)
  const now = new Date();
  const endDate = new Date(rental.end_date);
  const daysRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (daysRemaining > 2) {
      return {
          eligible: false,
          reason: `Extensions are only available within 2 days of expiry. You have ${Math.ceil(daysRemaining)} days remaining.`,
          extensionCost: 0,
          newEndDate: '',
      };
  }

  // Check for an active waitlist on this game
  const { count, error: waitlistError } = await supabase
    .from('waitlist')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', rental.game_id);

  if (waitlistError) {
    console.error('Error checking waitlist:', waitlistError);
    throw waitlistError;
  }

  if (count && count > 0) {
    return {
      eligible: false,
      reason: 'This game has users on the waitlist. Extensions are not permitted while others are waiting.',
      extensionCost: 0,
      newEndDate: '',
    };
  }

  // Eligible — project the new end date (7 more days from current end_date)
  const currentEnd = new Date(rental.end_date);
  currentEnd.setDate(currentEnd.getDate() + 7);

  return {
    eligible: true,
    extensionCost: rental.price,
    newEndDate: currentEnd.toISOString(),
  };
};

// Call this after the user confirms the extension cost.
// Updates the rental's end_date and status, then logs an extension transaction.
export const extendRental = async (rentalId: string): Promise<Rental> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Re-run eligibility check — prevent extending if conditions changed between confirm and submit
  const eligibility = await checkExtensionEligibility(rentalId);
  if (!eligibility.eligible) throw new Error(eligibility.reason);

  // Fetch rental price for the transaction log
  const { data: rental, error: fetchError } = await supabase
    .from('rentals')
    .select('price')
    .eq('id', rentalId)
    .single();

  if (fetchError || !rental) throw new Error('Failed to fetch rental details');

  // Update rental with new end_date and mark as 'extended'
  const { data: updatedRental, error: updateError } = await supabase
    .from('rentals')
    .update({
      end_date: eligibility.newEndDate,
      status: 'extended',
    })
    .eq('id', rentalId)
    .select()
    .single();

  if (updateError || !updatedRental) {
    console.error('Error extending rental:', updateError);
    throw new Error('Failed to extend rental');
  }

  // Log extension transaction — non-fatal if this fails
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      rental_id: rentalId,
      amount: rental.price,
      transaction_type: 'extension',
    });

  if (transactionError) {
    console.error('Error logging extension transaction:', transactionError);
  }

  return updatedRental as Rental;
};

// Call this before getMyActiveRentals to clean up stale rentals
export const expireStaleRentals = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('rentals')
    .update({ status: 'expired' })
    .eq('user_id', user.id)
    .in('status', ['active', 'extended'])
    .lt('end_date', new Date().toISOString());

  if (error) {
    console.error('Error expiring stale rentals:', error);
    throw error;
  }
};

/**
 * get rental copy record and all its fields
 */
export const getRentalRecord = async (rentalId: string): Promise<Rental> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('id', rentalId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching rental record:', error);
    throw new Error('Rental not found');
  }

  return data as Rental;
};
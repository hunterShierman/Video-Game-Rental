import { supabase } from '../lib/supabaseClient';

export interface WaitlistEntry {
  id: string;
  user_id: string;
  game_id: string;
  position: number;
  notified: boolean;
  created_at: string;
  games?: {
    title: string;
    image_url: string;
    price: number;
  }; // For the "My Waitlist" page join
}

// 1. Check if user is already on the waitlist for a specific game
export const getWaitlistStatus = async (gameId: string, userId: string) => {
  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle(); // specific Supabase method that doesn't throw error on null

  if (error) {
    console.error('Error fetching waitlist status:', error);
    return null;
  }
  return data as WaitlistEntry | null;
};

// 2. Join the waitlist (Calculates position automatically)
export const joinWaitlist = async (gameId: string, userId: string) => {
  // Step A: Find the last person in line for this game
  const { data: lastPerson, error: fetchError } = await supabase
    .from('waitlist')
    .select('position')
    .eq('game_id', gameId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching last person in line:', fetchError);
  }

  console.log("DEBUG: Last person found ->", lastPerson);

  // Step B: Calculate new position (Last + 1, or 1 if empty)
  const nextPosition = lastPerson ? lastPerson.position + 1 : 1;

  // Step C: Insert the new entry
  const { data, error } = await supabase
    .from('waitlist')
    .insert({
      user_id: userId,
      game_id: gameId,
      position: nextPosition,
      notified: false
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WaitlistEntry;
};

// 3. Leave the waitlist
export const leaveWaitlist = async (waitlistId: string) => {
  const { error } = await supabase
    .from('waitlist')
    .delete()
    .eq('id', waitlistId);

  if (error) throw new Error(error.message);
  return true;
};

// 4. Get all games the user is waiting for (for the Dashboard)
export const getUserWaitlist = async (userId: string) => {
  // We join with the 'games' table to get the title and image
  const { data, error } = await supabase
    .from('waitlist')
    .select(`
      *,
      games (
        title,
        image_url,
        price
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as WaitlistEntry[];
};
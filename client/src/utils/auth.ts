import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export const getAuthenticatedUser = async (): Promise<User> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user;
};

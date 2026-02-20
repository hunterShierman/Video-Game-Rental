// src/services/reviewService.ts
import { supabase } from "../lib/supabaseClient";
import type { Review } from "../types/definitions";

/** Everyone can view reviews for a game */
export const getReviewsForGame = async (gameId: string): Promise<Review[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, game_id, rating, comment, created_at, updated_at")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const reviews = ((data as Review[]) ?? []).map((r) => ({
    ...r,
    reviewer_label: user && r.user_id === user.id ? "You" : maskUserId(r.user_id),
  }));

  return reviews;
};

// helper: turns a uuid into something short like "User 9f3a"
const maskUserId = (id: string) => `User ${id.slice(0, 4)}`;

/** Returns YOUR review for a game (or null if none) */
export const getMyReviewForGame = async (gameId: string): Promise<Review | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, game_id, rating, comment, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .maybeSingle();

  if (error) throw error;
  return (data as Review) ?? null;
};

/** Rented-only restriction:
    allow review if the current user has ANY rental for the game */
export const canCurrentUserReview = async (gameId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("rentals")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    // include all possible statuses in your project
    .in("status", ["active", "expired", "extended"])
    .maybeSingle();

  if (error) throw error;
  return data !== null;
};

/** Create OR update your review (works even if DB doesn't have a unique constraint) */
export const upsertMyReview = async (
  gameId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  comment: string
): Promise<Review> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const allowed = await canCurrentUserReview(gameId);
  if (!allowed) throw new Error("You can only review games you have rented.");

  const existing = await getMyReviewForGame(gameId);

  if (existing) {
    const { data, error } = await supabase
      .from("reviews")
      .update({ rating, comment: comment.trim() || null })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      game_id: gameId,
      rating,
      comment: comment.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Review;
};

export const deleteMyReview = async (gameId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("game_id", gameId);

  if (error) throw error;
};

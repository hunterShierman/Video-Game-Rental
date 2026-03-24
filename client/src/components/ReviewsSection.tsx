import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Star, Trash2, MessageSquare, Pencil } from "lucide-react";
import {
  canCurrentUserReview,
  deleteMyReview,
  getMyReviewForGame,
  getReviewsForGame,
  upsertMyReview,
} from "../services/reviewService";
import type { Review } from "../types/definitions";
import { supabase } from "../lib/supabaseClient";

type Props = { gameId: string };

const clamp = (n: number) => Math.max(1, Math.min(5, n)) as 1 | 2 | 3 | 4 | 5;

function StarRating({
  rating,
  interactive = false,
  size = "md",
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  onRate?: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-7 h-7" : "w-5 h-5";
  const active = hovered || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "transition-transform hover:scale-110 cursor-pointer" : "cursor-default"}
          aria-label={`${n} stars`}
        >
          <Star
            className={`${sz} transition-colors ${
              n <= active ? "text-yellow-400" : "text-slate-600"
            }`}
            fill={n <= active ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ gameId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const avg = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => counts[r.rating - 1]++);
    return counts.reverse();
  }, [reviews]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      const [all, mine, eligible] = await Promise.all([
        getReviewsForGame(gameId),
        getMyReviewForGame(gameId),
        canCurrentUserReview(gameId),
      ]);

      setReviews(all);
      setMyReview(mine);
      setCanReview(eligible);

      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment ?? "");
      } else {
        setRating(5);
        setComment("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const saved = await upsertMyReview(gameId, clamp(rating), comment);
      setMyReview(saved);
      setIsEditing(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError(null);
    try {
      await deleteMyReview(gameId);
      setMyReview(null);
      setRating(5);
      setComment("");
      setIsEditing(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 mt-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-indigo-400" />
        <h2 className="text-white font-bold text-xl">Customer Reviews</h2>
        {reviews.length > 0 && (
          <span className="text-gray-500 text-sm">({reviews.length})</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading reviews…</span>
        </div>
      ) : (
        <>
          {error && (
            <div className="flex items-start gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Rating summary bar */}
          {reviews.length > 0 && (
            <div className="bg-slate-900/50 border border-indigo-500/20 rounded-2xl p-5 flex gap-8 items-center">
              <div className="text-center shrink-0">
                <p className="text-5xl font-bold text-white">{avg}</p>
                <StarRating rating={Math.round(avg ?? 0)} size="sm" />
                <p className="text-gray-500 text-xs mt-1">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star, i) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-3">{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" />
                    <div className="flex-1 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full transition-all"
                        style={{
                          width: reviews.length
                            ? `${(ratingCounts[i] / reviews.length) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-4">{ratingCounts[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write review form — only shown if canReview and no existing review, or currently editing */}
          {canReview && (!myReview || isEditing) && (
            <div className="bg-slate-900/50 border border-indigo-500/20 rounded-2xl p-5">
              <p className="text-white font-semibold text-sm mb-4">
                {myReview ? "Edit your review" : "Write a Review"}
              </p>

              <div className="flex items-center gap-3 mb-4">
                <StarRating
                  rating={rating}
                  interactive
                  size="lg"
                  onRate={(n) => setRating(n as 1 | 2 | 3 | 4 | 5)}
                />
                <span className="text-gray-400 text-sm">{rating} / 5</span>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this game..."
                rows={4}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/60 resize-none text-sm leading-relaxed"
              />

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={submit}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </>
                  ) : myReview ? "Update Review" : "Post Review"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 border border-slate-700 text-gray-300 rounded-xl hover:border-slate-500 hover:text-white transition-all text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <p className="text-gray-500 text-sm text-center py-2">
              <span className="text-indigo-400 cursor-pointer hover:underline">Log in</span> to leave a review.
            </p>
          )}

          {isLoggedIn && !canReview && (
            <p className="text-gray-500 text-sm text-center py-2">
              You can only review games you've rented.
            </p>
          )}

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : (
              reviews.map((r) => {
                const isOwn = myReview?.id === r.id;
                return (
                  <div
                    key={r.id}
                    className={`bg-slate-900/40 border rounded-2xl p-5 ${
                      isOwn ? "border-indigo-500/40" : "border-slate-800/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(r.reviewer_label ?? "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-200 text-sm font-semibold">
                              {r.reviewer_label ?? "User"}
                            </p>
                            {isOwn && (
                              <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gray-500 text-xs">
                          {new Date(r.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {isOwn && !isEditing && (
                          <>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors p-1 rounded-lg hover:bg-indigo-500/10"
                              aria-label="Edit review"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={remove}
                              disabled={saving}
                              className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                              aria-label="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {r.comment && (
                      <p className="text-gray-300 text-sm leading-relaxed mt-3 pl-11">
                        {r.comment}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
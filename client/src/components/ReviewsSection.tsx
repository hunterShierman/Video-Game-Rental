import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Star, Trash2 } from "lucide-react";
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

  const avg = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-lg">Reviews</h2>
          <p className="text-gray-400 text-sm">
            {avg === null ? "No ratings yet" : `${avg} / 5.0 (${reviews.length})`}
          </p>
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4" />
          <span className="text-sm font-semibold">{avg ?? "—"}</span>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading reviews…
        </div>
      ) : (
        <>
          {error && (
            <div className="mt-4 flex items-start gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Write/Update form */}
          <div className="mt-5 border border-slate-700/60 rounded-xl p-4 bg-slate-900/30">
            {!isLoggedIn ? (
              <p className="text-gray-400 text-sm">Log in to leave a review.</p>
            ) : !canReview ? (
              <p className="text-gray-400 text-sm">
                You can only review games you’ve rented.
              </p>
            ) : (
              <>
                <p className="text-gray-300 text-sm font-semibold mb-3">
                  {myReview ? "Update your review" : "Write a review"}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                      className="transition-transform hover:scale-110"
                      aria-label={`${n} stars`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          n <= rating ? "text-yellow-400" : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-gray-400 text-sm ml-2">{rating}/5</span>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you think?"
                  className="w-full min-h-[90px] bg-slate-950/40 border border-slate-700 rounded-xl p-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/60"
                />

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={submit}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving…
                      </>
                    ) : myReview ? (
                      "Update Review"
                    ) : (
                      "Post Review"
                    )}
                  </button>

                  {myReview && (
                    <button
                      type="button"
                      onClick={remove}
                      disabled={saving}
                      className="px-4 border border-slate-700 text-gray-300 rounded-xl hover:border-slate-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* List */}
          <div className="mt-5 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet.</p>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="border border-slate-800 rounded-xl p-4 bg-slate-950/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-4 h-4 ${
                            n <= r.rating ? "text-yellow-400" : "text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {r.comment && (
                    <p className="text-gray-300 text-sm mt-2">{r.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

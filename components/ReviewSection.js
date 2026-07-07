'use client';
// components/ReviewSection.js
// VULN: Renders comment HTML without sanitization (Stored XSS)
import { useState, useEffect } from 'react';

function StarRating({ rating, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`w-6 h-6 transition-colors ${
            star <= (hover || rating) ? 'text-amber-400' : 'text-slate-600'
          } ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (e) {}
    }
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?productId=${productId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (e) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // VULN: Light client-side filter that can be bypassed
  const weakFilter = (input) => {
    // This filter is intentionally bypassable
    return input
      .replace(/javascript:/gi, '')
      .replace(/<script>/gi, '')
      .replace(/<\/script>/gi, '');
    // Does NOT filter: <img onerror=>, <svg onload=>, encoded entities, etc.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to leave a review');
      return;
    }

    setSubmitting(true);
    setError('');

    // VULN: Weak client-side filter applied before sending to server
    const filteredComment = weakFilter(newComment);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          comment: filteredComment,
          rating,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setNewComment('');
        setRating(5);
        fetchComments();
      }
    } catch (e) {
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
            clipRule="evenodd"
          />
        </svg>
        Customer Reviews
      </h2>

      {/* Submit Review Form */}
      {user ? (
        <div className="glass-card p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Your Rating</label>
              <StarRating rating={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Your Review</label>
              {/* VULN: Hint in placeholder about HTML support */}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts... (HTML formatting supported)"
                rows={4}
                className="input-dark resize-none"
                id="review-textarea"
                required
              />
              <p className="text-slate-600 text-xs mt-1">
                Basic HTML formatting is supported for rich reviews.
              </p>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              id="submit-review-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-card p-4 mb-6 text-center">
          <p className="text-slate-400 text-sm">
            <a href="/login" className="text-blue-400 hover:underline">Log in</a> to write a review
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-full mb-1" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-500">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {comment.user?.username || 'Anonymous'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StarRating rating={comment.rating || 5} />
              </div>
              {/* VULN: Raw HTML rendered without sanitization - Stored XSS */}
              <div
                className="text-slate-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: comment.comment }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

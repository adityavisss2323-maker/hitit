// components/ReviewSection.js
'use client';
import { useState, useEffect } from 'react';

export default function ReviewSection({ productId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?productId=${productId}`);
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch(e) {
          setError('Error parsing comments');
          setLoading(false);
          return;
        }
        
        if (data?.comments && Array.isArray(data.comments)) {
          setComments(data.comments);
        } else {
          setComments([]);
        }
      } catch (err) {
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to comment');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, comment: newComment, rating: 5 }),
      });
      const data = await res.json();
      if (data?.comment) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      } else {
        alert(typeof data?.error === 'string' ? data.error : 'Failed to post comment');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="mt-12"><div className="skeleton h-32" /></div>;

  return (
    <div className="mt-12 glass-card p-6 md:p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Customer Reviews</h2>
      
      {/* Post Comment Form */}
      <div className="mb-10 bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
        <h3 className="text-white font-medium mb-4">Write a Review</h3>
        <p className="text-slate-400 text-xs mb-3">HTML formatting is supported (e.g., &lt;b&gt;bold&lt;/b&gt;)</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input-dark min-h-[120px] resize-y"
            placeholder="Share your thoughts about this product..."
            required
            id="review-textarea"
          />
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn-primary"
            id="review-submit-btn"
          >
            {isSubmitting ? 'Posting...' : 'Post Review'}
          </button>
        </form>
      </div>

      {error && <p className="text-red-400 mb-6">{String(error)}</p>}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No reviews yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-slate-700/50 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {typeof comment.user?.username === 'string' ? comment.user.username[0]?.toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{String(comment.user?.username || 'Anonymous')}</p>
                  <p className="text-slate-500 text-xs">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              </div>
              {/* VULN: Stored XSS - HTML rendered directly */}
              <div 
                className="text-slate-300 text-sm leading-relaxed mt-3 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: String(comment.comment || '') }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

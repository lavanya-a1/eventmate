import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Loader2, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { useApi, useMutation } from '../hooks/useApi';
import { submitFeedback, getMyFeedback } from '../api/feedback';
import { getMyBookings } from '../api/bookings';

const StarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" onClick={() => onChange(s)}
                className="transition-colors">
                <Star size={24}
                    className={s <= value ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700 hover:text-yellow-400'}
                />
            </button>
        ))}
    </div>
);

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function Feedback() {
    const { data: bookingsData, loading: loadingBookings } = useApi(getMyBookings);
    const { data: feedbackData, loading: loadingFeedback, refetch: refetchFeedback } = useApi(getMyFeedback);
    const { execute, loading: submitting, error: submitError } = useMutation(submitFeedback);

    const [eventId, setEventId] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [success, setSuccess] = useState(false);

    // Only confirmed/completed bookings for the dropdown
    const bookings = (bookingsData?.data || []).filter((b) => b.status !== 'cancelled');
    const feedbackHistory = feedbackData?.data || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!eventId || rating === 0) return;
        const res = await execute({ event: eventId, rating, comment });
        if (res) {
            setSuccess(true);
            setEventId('');
            setRating(0);
            setComment('');
            refetchFeedback();
            setTimeout(() => setSuccess(false), 4000);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-xl font-bold text-white">Feedback</h1>
                <p className="text-slate-500 text-sm mt-1">Share your experience and help the community</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Submit Feedback Form */}
                <div className="bg-[#0d0e1a] border border-white/[0.07] rounded-2xl p-6 space-y-5">
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                        <MessageSquare size={16} className="text-primary-400" /> Leave Feedback
                    </h2>

                    {success && (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                            <CheckCircle2 size={16} /> Thanks for your feedback!
                        </div>
                    )}
                    {submitError && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                            <AlertCircle size={16} /> {submitError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Event</label>
                            <select value={eventId} onChange={(e) => setEventId(e.target.value)} required
                                disabled={loadingBookings}
                                className="w-full px-4 py-2.5 bg-[#070713] border border-white/[0.07] rounded-xl
                                           text-sm text-white focus:outline-none focus:border-primary-500/50
                                           disabled:opacity-50 appearance-none">
                                <option value="">Select an event…</option>
                                {bookings.map((b) => (
                                    <option key={b._id} value={b.event?._id}>
                                        {b.event?.title || 'Unknown Event'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Rating</label>
                            <StarRating value={rating} onChange={setRating} />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Comment</label>
                            <textarea
                                value={comment} onChange={(e) => setComment(e.target.value)}
                                rows={4} placeholder="Share your experience…"
                                className="w-full px-4 py-3 bg-[#070713] border border-white/[0.07] rounded-xl
                                           text-sm text-white placeholder-slate-600 resize-none
                                           focus:outline-none focus:border-primary-500/50"
                            />
                        </div>

                        <button type="submit" disabled={submitting || !eventId || rating === 0}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                       bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium
                                       disabled:opacity-50 transition-colors">
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Submit Feedback
                        </button>
                    </form>
                </div>

                {/* Feedback History */}
                <div className="space-y-4">
                    <h2 className="text-base font-semibold text-white">My Feedback History</h2>
                    {loadingFeedback && (
                        <div className="flex items-center gap-2 text-slate-500 text-sm py-6">
                            <Loader2 size={16} className="animate-spin" /> Loading…
                        </div>
                    )}
                    {!loadingFeedback && feedbackHistory.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-12 text-slate-600">
                            <MessageSquare size={28} className="text-slate-700" />
                            <p className="text-sm text-slate-500">No feedback submitted yet</p>
                        </div>
                    )}
                    {feedbackHistory.map((fb) => (
                        <div key={fb._id}
                            className="bg-[#0d0e1a] border border-white/[0.07] rounded-2xl p-5 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm font-semibold text-white">{fb.event?.title || 'Event'}</p>
                                    <p className="text-[10px] text-slate-600 mt-0.5">{formatDate(fb.createdAt)}</p>
                                </div>
                                <div className="flex gap-0.5 shrink-0">
                                    {[1,2,3,4,5].map((s) => (
                                        <Star key={s} size={14}
                                            className={s <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}
                                        />
                                    ))}
                                </div>
                            </div>
                            {fb.comment && <p className="text-sm text-slate-400 leading-relaxed">{fb.comment}</p>}
                            {fb.likes > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <ThumbsUp size={12} /> {fb.likes} helpful
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


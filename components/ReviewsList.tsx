
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, MessageCircle, ShieldCheck, X, AlertTriangle, Send } from 'lucide-react';
import { Review } from '../types';
import { getReviews, voteHelpful, reportReview, replyToReview } from '../services/reviewService';
import { Button } from './Button';

interface ReviewsListProps {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ isOpen, onClose, providerName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isProviderMode, setIsProviderMode] = useState(false); // Demo Toggle

  useEffect(() => {
    if (isOpen) {
      setReviews(getReviews(providerName));
    }
  }, [isOpen, providerName]);

  const handleVote = (id: string) => {
    voteHelpful(id);
    // Optimistic update
    setReviews(prev => prev.map(r => r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
  };

  const handleReport = (id: string) => {
    if (!reportReason) return;
    reportReview(id, reportReason);
    setActiveReportId(null);
    setReportReason('');
    alert("Review reported to moderation team.");
  };

  const handleReply = (id: string) => {
    if (!replyText) return;
    replyToReview(id, replyText, `${providerName} Support`);
    setActiveReplyId(null);
    setReplyText('');
    setReviews(getReviews(providerName)); // Refresh
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl transform scale-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
           <div>
               <h3 className="text-xl font-bold text-gray-900">{providerName} Reviews</h3>
               <p className="text-sm text-gray-500">{reviews.length} Verified Reviews</p>
           </div>
           <div className="flex items-center gap-3">
               <label className="flex items-center gap-2 cursor-pointer text-xs">
                   <input type="checkbox" checked={isProviderMode} onChange={e => setIsProviderMode(e.target.checked)} />
                   Provider Mode (Demo)
               </label>
               <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X className="h-5 w-5 text-gray-500"/></button>
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No reviews yet for this provider.</div>
            ) : (
                reviews.map(review => (
                    <div key={review.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-gray-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="font-bold text-gray-900 text-sm">{review.userName}</div>
                                {review.verifiedBooking && (
                                    <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 font-bold" title="Verified Booking">
                                        <ShieldCheck className="h-3 w-3" /> Verified
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                        </div>

                        <p className="text-gray-700 text-sm mb-4 leading-relaxed">{review.text}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                            <button onClick={() => handleVote(review.id)} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                <ThumbsUp className="h-3 w-3" /> Helpful ({review.helpfulCount})
                            </button>
                            
                            <button onClick={() => setActiveReportId(activeReportId === review.id ? null : review.id)} className="flex items-center gap-1 hover:text-red-600 transition-colors ml-auto">
                                <Flag className="h-3 w-3" /> Report
                            </button>

                            {isProviderMode && !review.providerResponse && (
                                <button onClick={() => setActiveReplyId(activeReplyId === review.id ? null : review.id)} className="flex items-center gap-1 text-brand-600 font-bold hover:underline">
                                    <MessageCircle className="h-3 w-3" /> Reply
                                </button>
                            )}
                        </div>

                        {/* Report Form */}
                        {activeReportId === review.id && (
                            <div className="mt-3 bg-red-50 p-3 rounded-lg animate-in fade-in">
                                <p className="text-xs font-bold text-red-700 mb-2">Why are you reporting this review?</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={reportReason} 
                                        onChange={e => setReportReason(e.target.value)}
                                        placeholder="Spam, Abusive, Fake..."
                                        className="flex-1 text-xs p-2 border border-red-200 rounded outline-none"
                                    />
                                    <button onClick={() => handleReport(review.id)} className="bg-red-600 text-white text-xs px-3 py-1 rounded font-bold">Report</button>
                                </div>
                            </div>
                        )}

                        {/* Provider Reply Display */}
                        {review.providerResponse && (
                            <div className="mt-3 bg-gray-50 p-3 rounded-lg border-l-4 border-brand-500">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-brand-700">{review.providerResponse.responderName}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(review.providerResponse.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-600 italic">"{review.providerResponse.text}"</p>
                            </div>
                        )}

                        {/* Reply Input */}
                        {activeReplyId === review.id && (
                            <div className="mt-3 bg-blue-50 p-3 rounded-lg animate-in fade-in">
                                <p className="text-xs font-bold text-blue-700 mb-2">Reply as {providerName}</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={replyText} 
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Write a response..."
                                        className="flex-1 text-xs p-2 border border-blue-200 rounded outline-none"
                                    />
                                    <button onClick={() => handleReply(review.id)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded font-bold flex items-center">
                                        <Send className="h-3 w-3 mr-1"/> Send
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Star, X, Camera, ThumbsUp } from 'lucide-react';
import { Button } from './Button';
import { Review } from '../types';
import { addReview } from '../services/reviewService';
import { getCurrentUser } from '../services/authService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  bookingId?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, providerName, bookingId }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a rating");
    setIsSubmitting(true);
    
    // Simulate API
    await new Promise(r => setTimeout(r, 1000));
    
    const user = getCurrentUser();
    const newReview: Review = {
        id: `rev-${Date.now()}`,
        providerName,
        userId: user?.email || 'anon',
        userName: user?.name || 'Traveler',
        rating,
        text,
        date: Date.now(),
        helpfulCount: 0,
        verifiedBooking: !!bookingId
    };
    
    addReview(newReview);
    setIsSubmitting(false);
    onClose();
    alert("Review submitted! Thank you for your feedback.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform scale-100 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-gray-900">Rate your trip</h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-5 w-5 text-gray-500"/></button>
        </div>

        <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-3">How was your experience with <strong>{providerName}</strong>?</p>
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <button 
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform active:scale-110"
                    >
                        <Star className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                ))}
            </div>
            <div className="mt-2 text-sm font-bold text-gray-700 h-5">
                {rating === 1 && "Terrible 😠"}
                {rating === 2 && "Bad 😞"}
                {rating === 3 && "Average 😐"}
                {rating === 4 && "Good 🙂"}
                {rating === 5 && "Excellent 🤩"}
            </div>
        </div>

        <textarea 
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none h-32 mb-4"
            placeholder="Tell us more about your trip (vehicle condition, staff behavior, punctuality)..."
            value={text}
            onChange={e => setText(e.target.value)}
        />

        <div className="flex items-center gap-2 mb-6">
            <button className="flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-2 rounded-lg border border-brand-100 hover:bg-brand-100 transition-colors">
                <Camera className="h-4 w-4" /> Add Photos
            </button>
            <span className="text-[10px] text-gray-400 ml-auto">Max 500 chars</span>
        </div>

        <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full" disabled={rating === 0}>
            Submit Review
        </Button>
      </div>
    </div>
  );
};

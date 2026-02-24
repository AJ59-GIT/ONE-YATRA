
import React, { useState } from 'react';
import { Smile, Frown, Meh, X } from 'lucide-react';
import { Button } from './Button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Submit logic
    setTimeout(() => {
        alert("Thanks for your feedback! ₹50 credited to your wallet.");
        onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">How was your trip?</h3>
                    <p className="text-sm text-gray-500">Your feedback helps us improve.</p>
                </div>
                <button onClick={onClose}><X className="h-5 w-5 text-gray-400"/></button>
            </div>

            <div className="flex justify-center gap-6 mb-6">
                <button 
                    onClick={() => setScore(1)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${score === 1 ? 'bg-red-50 text-red-600 scale-110' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <Frown className="h-10 w-10" />
                    <span className="text-xs font-bold">Bad</span>
                </button>
                <button 
                    onClick={() => setScore(2)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${score === 2 ? 'bg-yellow-50 text-yellow-600 scale-110' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <Meh className="h-10 w-10" />
                    <span className="text-xs font-bold">Okay</span>
                </button>
                <button 
                    onClick={() => setScore(3)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${score === 3 ? 'bg-green-50 text-green-600 scale-110' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <Smile className="h-10 w-10" />
                    <span className="text-xs font-bold">Great</span>
                </button>
            </div>

            {score !== null && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us what you liked or disliked..."
                        className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24 mb-4"
                    />
                    <Button onClick={handleSubmit} className="w-full">Submit & Get ₹50</Button>
                </div>
            )}
        </div>
    </div>
  );
};

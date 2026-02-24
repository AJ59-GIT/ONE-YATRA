
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, Search, Ticket, Wallet, User } from 'lucide-react';
import { Button } from './Button';

interface Step {
  title: string;
  desc: string;
  icon: any;
  target?: string; // Could be used for highlighting if complex logic added
}

const STEPS: Step[] = [
  { 
    title: "Welcome to OneYatra", 
    desc: "Your all-in-one travel companion for Cabs, Trains, Buses, and Flights in India.",
    icon: <div className="text-4xl">👋</div>
  },
  { 
    title: "Smart Search", 
    desc: "Compare prices and carbon footprints across all modes instantly. Just enter your destination.",
    icon: <Search className="h-8 w-8 text-brand-600" />
  },
  { 
    title: "Unified Booking", 
    desc: "Book multi-leg trips (Cab -> Flight -> Cab) in a single flow.",
    icon: <Ticket className="h-8 w-8 text-blue-600" />
  },
  { 
    title: "Wallet & Rewards", 
    desc: "Earn points on every trip and get instant refunds to your wallet.",
    icon: <Wallet className="h-8 w-8 text-green-600" />
  }
];

export const OnboardingGuide: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already seen
    const seen = localStorage.getItem('oneyatra_onboarding_seen');
    if (!seen) {
        setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('oneyatra_onboarding_seen', 'true');
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
            <div 
                className="h-full bg-brand-500 transition-all duration-300" 
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            ></div>
        </div>

        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-4 animate-in slide-in-from-right duration-300" key={step}>
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                {STEPS[step].icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{STEPS[step].title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 h-12">
                {STEPS[step].desc}
            </p>
        </div>

        <div className="flex gap-3">
            <button 
                onClick={handleClose}
                className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
            >
                Skip
            </button>
            <Button onClick={handleNext} className="flex-[2] rounded-xl shadow-lg shadow-brand-500/30">
                {step === STEPS.length - 1 ? "Get Started" : "Next"}
            </Button>
        </div>

        <div className="flex justify-center gap-1.5 mt-6">
            {STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-brand-600' : 'bg-gray-200'}`}></div>
            ))}
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';

export const TermsPage: React.FC<{onBack: () => void}> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in pb-20">
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-brand-600 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
        <p className="text-gray-500 mt-2">Effective Date: October 1, 2023</p>
      </div>

      <div className="space-y-6 text-sm text-gray-700">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-2">1. Introduction</h3>
            <p>Welcome to OneYatra. By accessing our app, you agree to these terms. OneYatra acts as an aggregator connecting you with third-party travel service providers.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-2">2. Booking & Cancellations</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Bookings are subject to availability and confirmation from the respective provider.</li>
                <li>Cancellation policies vary by provider (Airline/Bus Operator). OneYatra displays these policies but does not set them.</li>
                <li>Refunds are processed to the original payment source or OneYatra Wallet within 5-7 business days.</li>
            </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-2">3. User Responsibilities</h3>
            <p className="mb-2">You agree to provide accurate information during booking. OneYatra is not liable for issues arising from incorrect names, dates, or ID proofs.</p>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                <p className="text-orange-800 text-xs">Misuse of the platform (e.g., fake bookings, abusive behavior) will result in account suspension.</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-2">4. Liability Disclaimer</h3>
            <p>OneYatra is not responsible for provider-side delays, cancellations, or service quality issues. We act solely as a technology platform facilitating the transaction.</p>
        </div>
      </div>
    </div>
  );
};

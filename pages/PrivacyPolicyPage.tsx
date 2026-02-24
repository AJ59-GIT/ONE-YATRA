
import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Server } from 'lucide-react';

export const PrivacyPolicyPage: React.FC<{onBack: () => void}> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in pb-20">
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-brand-600 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-500 mt-2">Last Updated: October 2023</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-brand-600" /> 1. Overview
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            OneYatra is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information in compliance with the Digital Personal Data Protection (DPDP) Act 2023. We are a Data Fiduciary, and you are the Data Principal.
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-600" /> 2. Data We Collect
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 ml-2">
            <li><strong>Identity Data:</strong> Name, age, gender.</li>
            <li><strong>Contact Data:</strong> Email address, phone number.</li>
            <li><strong>Travel Data:</strong> Booking history, PNR, itineraries.</li>
            <li><strong>Technical Data:</strong> IP address, device ID, location (with explicit consent).</li>
            <li><strong>Sensitive Personal Data:</strong> Govt IDs (Passport/Aadhaar) stored in Vault (Encrypted).</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-green-600" /> 3. How We Use Your Data
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            We use your data strictly for legitimate purposes based on your consent:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 ml-2">
            <li>To process bookings with travel providers (Airlines, Cab Aggregators).</li>
            <li>To provide customer support and resolve grievances.</li>
            <li>To detect and prevent fraud.</li>
            <li>To send booking confirmations and travel alerts.</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Server className="h-5 w-5 mr-2 text-purple-600" /> 4. Data Storage & Localization
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            All critical personal data is stored on secure servers located within India (Mumbai/Hyderabad regions). We use AES-256 encryption for data at rest and TLS 1.3 for data in transit.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2">Contact Grievance Officer</h3>
          <p className="text-sm text-gray-600">
            Mr. Rahul Sharma<br/>
            OneYatra Tech Pvt Ltd, Bengaluru<br/>
            Email: privacy@oneyatra.app
          </p>
        </section>
      </div>
    </div>
  );
};

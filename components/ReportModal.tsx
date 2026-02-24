
import React, { useState } from 'react';
import { AlertTriangle, X, Camera, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { submitReport } from '../services/trustService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'REVIEW' | 'LISTING' | 'PROVIDER';
  targetName: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetId, targetType, targetName }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
      if (!reason) return;
      setIsSubmitting(true);
      await new Promise(r => setTimeout(r, 1000)); // Mock API delay
      
      submitReport({
          targetId,
          targetType,
          reason,
          description
      });
      
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
          setSuccess(false);
          setReason('');
          setDescription('');
          onClose();
      }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            {success ? (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Report Submitted</h3>
                    <p className="text-gray-500 text-sm mt-2">Thank you for helping keep OneYatra safe. We will investigate this shortly.</p>
                </div>
            ) : (
                <>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" /> Report {targetType === 'REVIEW' ? 'Review' : 'Listing'}
                        </h3>
                        <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-600"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-gray-600">
                            You are reporting <strong>"{targetName}"</strong>. Please tell us why.
                        </p>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Reason</label>
                            <select 
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)} 
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="">Select a reason</option>
                                <option value="FRAUD">Fraudulent or Scam</option>
                                <option value="INACCURATE">Inaccurate Information</option>
                                <option value="OFFENSIVE">Offensive Content</option>
                                <option value="SPAM">Spam or Advertising</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Details (Optional)</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-24 resize-none focus:ring-2 focus:ring-red-500 outline-none"
                                placeholder="Provide more context..."
                            />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 cursor-not-allowed opacity-60">
                            <Camera className="h-4 w-4" /> Upload Screenshot (Coming Soon)
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                            <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!reason} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Submit Report</Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

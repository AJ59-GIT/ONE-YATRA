
import React, { useState } from 'react';
import { Users, Upload, ArrowLeft, CheckCircle, FileText, DollarSign, PieChart, Download } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface GroupBookingPageProps {
  onBack: () => void;
}

export const GroupBookingPage: React.FC<GroupBookingPageProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 10,
    eventType: 'Corporate',
    isSplitPayment: false
  });
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
        setFileName(e.target.files[0].name);
    }
  };

  const calculateDiscount = () => {
      if (formData.passengers >= 50) return 20;
      if (formData.passengers >= 20) return 15;
      return 10;
  };

  const renderForm = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
                label="Origin City" 
                value={formData.origin} 
                onChange={e => setFormData({...formData, origin: e.target.value})}
                placeholder="e.g. Delhi"
            />
            <Input 
                label="Destination City" 
                value={formData.destination} 
                onChange={e => setFormData({...formData, destination: e.target.value})}
                placeholder="e.g. Goa"
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
                label="Travel Date" 
                type="date"
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
            />
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Group Size</label>
                <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={formData.passengers}
                    onChange={e => setFormData({...formData, passengers: parseInt(e.target.value)})}
                    className="w-full h-2 bg-brand-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10 Pax</span>
                    <span className="font-bold text-brand-600 text-lg">{formData.passengers} Passengers</span>
                    <span>100 Pax</span>
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Trip Type</label>
            <div className="flex gap-2">
                {['Corporate', 'Wedding', 'School Trip', 'Other'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFormData({...formData, eventType: type})}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border ${formData.eventType === type ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <PieChart className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
                <h4 className="font-bold text-sm text-blue-900">Bulk Discount Applied</h4>
                <p className="text-xs text-blue-700">
                    Based on a group size of {formData.passengers}, you are eligible for a <strong>{calculateDiscount()}% discount</strong> on base fare.
                </p>
            </div>
        </div>

        <Button onClick={() => setStep(2)} className="w-full">Next: Passenger Details</Button>
    </div>
  );

  const renderUpload = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-white hover:border-brand-300 transition-all">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900">Upload Passenger Manifest</h3>
              <p className="text-xs text-gray-500 mb-4">Upload an Excel/CSV file with Name, Age, Gender.</p>
              
              <input type="file" id="manifest" className="hidden" accept=".csv,.xlsx" onChange={handleFileUpload} />
              <label htmlFor="manifest" className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-50">
                  {fileName || "Choose File"}
              </label>
              
              {fileName && (
                  <div className="mt-4 flex items-center justify-center text-sm text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4 mr-2" /> File Uploaded Successfully
                  </div>
              )}
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg"><FileText className="h-5 w-5 text-gray-600"/></div>
                  <div className="text-sm">
                      <div className="font-bold text-gray-900">Download Template</div>
                      <div className="text-xs text-gray-500">Use this format for upload</div>
                  </div>
              </div>
              <button className="text-brand-600 hover:bg-brand-50 p-2 rounded"><Download className="h-5 w-5" /></button>
          </div>

          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
              <input 
                type="checkbox" 
                checked={formData.isSplitPayment} 
                onChange={e => setFormData({...formData, isSplitPayment: e.target.checked})}
                className="h-5 w-5 text-brand-600 rounded"
              />
              <div>
                  <div className="font-bold text-sm text-gray-900 flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-600"/> Enable Split Payment</div>
                  <div className="text-xs text-gray-500">Allow passengers to pay their share individually via a generated link.</div>
              </div>
          </div>

          <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Back</button>
              <Button onClick={() => setStep(3)} className="flex-[2]">Submit Request</Button>
          </div>
      </div>
  );

  const renderSuccess = () => (
      <div className="text-center py-12 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
              We have received your group booking request for {formData.passengers} passengers. 
              Our team will send you the best quotes within 2 hours.
          </p>
          <Button onClick={onBack}>Back to Home</Button>
      </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {step < 3 && (
        <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft className="h-5 w-5"/></button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-brand-600" /> Group Booking
            </h1>
        </div>
      )}

      {step === 1 && renderForm()}
      {step === 2 && renderUpload()}
      {step === 3 && renderSuccess()}
    </div>
  );
};

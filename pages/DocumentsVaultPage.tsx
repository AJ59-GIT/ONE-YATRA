
import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Upload, Trash2, Calendar, FileText, Lock, Plus, ArrowLeft, ScanLine, AlertTriangle, Share2, Download, Cloud, CheckCircle, X } from 'lucide-react';
import { UserDocument } from '../types';
import { getDocuments, saveDocument, deleteDocument, performOCR, checkExpiry } from '../services/documentService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useSettings } from '../contexts/SettingsContext';

interface DocumentsVaultPageProps {
  onBack: () => void;
}

export const DocumentsVaultPage: React.FC<DocumentsVaultPageProps> = ({ onBack }) => {
  const { t } = useSettings();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [visibleDocs, setVisibleDocs] = useState<Set<string>>(new Set());
  
  // OCR / Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [scanStep, setScanStep] = useState<'IDLE' | 'SCANNING' | 'REVIEW'>('IDLE');
  const [scannedData, setScannedData] = useState<Partial<UserDocument>>({});
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Share Modal
  const [shareDocId, setShareDocId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');

  useEffect(() => {
    setDocuments(getDocuments());
  }, []);

  const toggleVisibility = (id: string) => {
    const newSet = new Set(visibleDocs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setVisibleDocs(newSet);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
      setDocuments(deleteDocument(id));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);

    setScanStep('SCANNING');
    try {
      const result = await performOCR(file);
      setScannedData({
        type: 'PASSPORT', // Default, user can change
        holderName: result.holderName,
        number: result.number,
        expiryDate: result.expiryDate,
        dob: result.dob,
        gender: result.gender,
        isVerified: true
      });
      setScanStep('REVIEW');
    } catch (err) {
      alert("Scan failed. Please enter details manually.");
      setScanStep('REVIEW');
      setScannedData({ isVerified: false });
    }
  };

  const saveScannedDoc = () => {
    if (!scannedData.number || !scannedData.holderName) {
        alert("Name and Number are required.");
        return;
    }

    const newDoc: UserDocument = {
      id: `doc_${Date.now()}`,
      type: scannedData.type || 'OTHER',
      number: scannedData.number,
      holderName: scannedData.holderName,
      expiryDate: scannedData.expiryDate,
      dob: scannedData.dob,
      gender: scannedData.gender,
      isVerified: true,
      fileUrl: filePreview || undefined
    };

    setDocuments(saveDocument(newDoc));
    setScanStep('IDLE');
    setFilePreview(null);
    setScannedData({});
  };

  const handleBackup = () => {
    // Simulate Cloud Backup
    alert("Backing up encrypted vault to iCloud...");
    setTimeout(() => alert("Backup Successful!"), 1500);
  };

  const handleShare = () => {
    if(!shareEmail.includes('@')) { alert("Invalid email"); return; }
    alert(`Secure link sent to ${shareEmail}. Valid for 24 hours.`);
    setShareDocId(null);
    setShareEmail('');
  };

  const getStatusColor = (status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED') => {
      switch(status) {
          case 'EXPIRED': return 'bg-red-100 text-red-700 border-red-200';
          case 'EXPIRING_SOON': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
          default: return 'bg-green-100 text-green-700 border-green-200';
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><ArrowLeft className="h-5 w-5"/></button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-6 w-6 text-brand-600" /> Secure Vault
                </h1>
                <p className="text-sm text-gray-500">AES-256 Encrypted storage for travel documents.</p>
            </div>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBackup}>
                <Cloud className="h-4 w-4 mr-2" /> Backup
            </Button>
            <Button size="sm" onClick={() => setIsUploading(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Document
            </Button>
         </div>
      </div>

      {/* Main Content */}
      {isUploading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-lg mx-auto relative overflow-hidden">
              <button onClick={() => { setIsUploading(false); setScanStep('IDLE'); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>
              
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Document</h2>

              {scanStep === 'IDLE' && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative">
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="bg-blue-50 p-4 rounded-full inline-flex mb-4">
                          <ScanLine className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Scan Document</h3>
                      <p className="text-xs text-gray-500 mt-1">Upload Passport, Aadhaar, or PAN Card</p>
                      <p className="text-[10px] text-brand-600 mt-4 font-medium">Auto-fill enabled by OCR</p>
                  </div>
              )}

              {scanStep === 'SCANNING' && (
                  <div className="text-center py-12">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                          <ScanLine className="absolute inset-0 m-auto h-8 w-8 text-brand-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Scanning Document...</h3>
                      <p className="text-sm text-gray-500 mt-2">Extracting details securely on-device.</p>
                  </div>
              )}

              {scanStep === 'REVIEW' && (
                  <div className="space-y-4 animate-in slide-in-from-right">
                      {filePreview && (
                          <div className="h-32 bg-gray-100 rounded-lg overflow-hidden relative mb-4">
                              <img src={filePreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">Preview</div>
                          </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Doc Type</label>
                              <select 
                                value={scannedData.type} 
                                onChange={e => setScannedData({...scannedData, type: e.target.value as any})}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                              >
                                  <option value="PASSPORT">Passport</option>
                                  <option value="AADHAAR">Aadhaar</option>
                                  <option value="PAN">PAN Card</option>
                                  <option value="VISA">Visa</option>
                                  <option value="OTHER">Other</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Number</label>
                              <input 
                                type="text" 
                                value={scannedData.number || ''} 
                                onChange={e => setScannedData({...scannedData, number: e.target.value})}
                                className="w-full p-2 border rounded-lg text-sm"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={scannedData.holderName || ''} 
                            onChange={e => setScannedData({...scannedData, holderName: e.target.value})}
                            className="w-full p-2 border rounded-lg text-sm"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Expiry Date</label>
                              <input 
                                type="date" 
                                value={scannedData.expiryDate || ''} 
                                onChange={e => setScannedData({...scannedData, expiryDate: e.target.value})}
                                className="w-full p-2 border rounded-lg text-sm"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                              <select 
                                value={scannedData.gender || ''} 
                                onChange={e => setScannedData({...scannedData, gender: e.target.value as any})}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                              >
                                  <option value="">Select</option>
                                  <option value="M">Male</option>
                                  <option value="F">Female</option>
                              </select>
                          </div>
                      </div>

                      <Button onClick={saveScannedDoc} className="w-full mt-4">Save to Vault</Button>
                  </div>
              )}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {documents.length === 0 ? (
                 <div className="md:col-span-2 text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
                     <Lock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                     <h3 className="text-gray-900 font-bold">Vault is empty</h3>
                     <p className="text-gray-500 text-sm mb-6">Upload your ID proofs for faster bookings.</p>
                     <Button variant="outline" onClick={() => setIsUploading(true)}>Upload Now</Button>
                 </div>
             ) : (
                 documents.map(doc => {
                    const isVisible = visibleDocs.has(doc.id);
                    const expiryStatus = checkExpiry(doc);
                    
                    return (
                       <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group">
                          {/* Expiry Badge */}
                          {expiryStatus !== 'VALID' && (
                             <div className={`absolute top-0 right-0 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b ${getStatusColor(expiryStatus)}`}>
                                {expiryStatus === 'EXPIRED' ? 'EXPIRED' : 'EXPIRING SOON'}
                             </div>
                          )}

                          <div className="flex items-start justify-between mb-4">
                             <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                   <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                   <h3 className="font-bold text-gray-900">{doc.type}</h3>
                                   <p className="text-xs text-gray-500">{doc.holderName}</p>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => toggleVisibility(doc.id)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-gray-100 rounded transition-colors" title={isVisible ? "Hide" : "Show"}>
                                   {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <button onClick={() => setShareDocId(doc.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Share Securely">
                                   <Share2 className="h-4 w-4" />
                                </button>
                             </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3 flex justify-between items-center group-hover:border-gray-200 transition-colors">
                             <span className="font-mono text-sm tracking-widest text-gray-700">
                                {isVisible ? doc.number : `•••• •••• ${doc.number.slice(-4)}`}
                             </span>
                             <button onClick={() => {navigator.clipboard.writeText(doc.number); alert("Copied!")}} className="text-[10px] font-bold text-gray-400 hover:text-brand-600 uppercase">
                                Copy
                             </button>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                             <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                {doc.expiryDate ? (
                                    <>
                                        <Calendar className="h-3 w-3" /> 
                                        <span className={expiryStatus === 'EXPIRING_SOON' ? 'text-yellow-600 font-bold' : ''}>
                                            Exp: {new Date(doc.expiryDate).toLocaleDateString()}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-gray-400 italic">No Expiry</span>
                                )}
                             </div>
                             <div className="flex gap-3">
                                 <button className="text-gray-400 hover:text-green-600" title="Download PDF" onClick={() => alert("Simulating Encrypted PDF Download...")}>
                                     <Download className="h-4 w-4" />
                                 </button>
                                 <button className="text-gray-400 hover:text-red-500" title="Delete" onClick={() => handleDelete(doc.id)}>
                                     <Trash2 className="h-4 w-4" />
                                 </button>
                             </div>
                          </div>
                       </div>
                    );
                 })
             )}
          </div>
      )}

      {/* Share Modal */}
      {shareDocId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">Share Document</h3>
                      <button onClick={() => setShareDocId(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Send a secure, one-time viewing link to a trusted contact.</p>
                  <Input 
                    label="Recipient Email" 
                    type="email" 
                    value={shareEmail} 
                    onChange={e => setShareEmail(e.target.value)} 
                    placeholder="friend@example.com"
                  />
                  <Button onClick={handleShare} className="w-full mt-2">Send Secure Link</Button>
              </div>
          </div>
      )}

      <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4">
         <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 h-fit">
            <Lock className="h-5 w-5" />
         </div>
         <div>
            <h4 className="font-bold text-sm text-indigo-900">Zero-Knowledge Encryption</h4>
            <p className="text-xs text-indigo-700 mt-1">
               Your documents are encrypted on your device before uploading. Only you have the key to view them.
            </p>
         </div>
      </div>
    </div>
  );
};

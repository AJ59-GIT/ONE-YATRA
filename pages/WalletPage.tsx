
import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Download, History, CreditCard, Banknote, Landmark, X, Check, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '../components/Button';
import { getWalletBalance, getWalletTransactions, addMoney, withdrawMoney } from '../services/walletService';
import { WalletTransaction } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface WalletPageProps {
  onBack: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onBack }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);

  const addModalRef = useFocusTrap(showAddModal, () => setShowAddModal(false));
  const withdrawModalRef = useFocusTrap(showWithdrawModal, () => setShowWithdrawModal(false));

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setBalance(getWalletBalance());
    setTransactions(getWalletTransactions());
  };

  const handleAddMoney = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setLoading(true);
    // Simulate Payment Gateway delay
    await new Promise(r => setTimeout(r, 1500));
    await addMoney(Number(amount));
    setLoading(false);
    setShowAddModal(false);
    setAmount('');
    refreshData();
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if (!bankDetails) { alert("Please enter bank details"); return; }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const success = await withdrawMoney(Number(amount), bankDetails);
    setLoading(false);
    
    if (success) {
      setShowWithdrawModal(false);
      setAmount('');
      setBankDetails('');
      refreshData();
    } else {
      alert("Insufficient balance or error processing withdrawal.");
    }
  };

  const downloadStatement = () => {
    alert("Downloading PDF Statement...");
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Wallet className="h-6 w-6 mr-2 text-brand-600" /> My Wallet
        </h1>
        <button onClick={onBack} className="text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:underline">
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <div className="md:col-span-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
           {/* Abstract Circles */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-500/20 rounded-full blur-2xl"></div>

           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <p className="text-slate-400 text-sm font-medium mb-1">Total Balance</p>
                 <h2 className="text-4xl font-bold tracking-tight flex items-baseline">
                    <span className="text-2xl mr-1">₹</span>
                    {balance.toLocaleString()}
                 </h2>
                 <p className="text-xs text-slate-500 mt-2 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> 
                    Secure & Encrypted
                 </p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                 <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                 >
                    <Plus className="h-5 w-5" /> Add Money
                 </button>
                 <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
                 >
                    <Landmark className="h-5 w-5" /> Transfer
                 </button>
              </div>
           </div>
        </div>

        {/* Quick Actions (Optional, maybe Promotions) */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                 <Banknote className="h-6 w-6" />
              </div>
              <div>
                 <h3 className="font-bold text-gray-900">Auto-Refunds</h3>
                 <p className="text-xs text-gray-500">Instant refunds for failed bookings directly to wallet.</p>
              </div>
           </div>
           <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                 <Smartphone className="h-6 w-6" />
              </div>
              <div>
                 <h3 className="font-bold text-gray-900">One-Tap Payment</h3>
                 <p className="text-xs text-gray-500">Fastest checkout experience for your trips.</p>
              </div>
           </div>
        </div>

        {/* Transactions List */}
        <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
              <div className="flex items-center gap-2">
                 <History className="h-5 w-5 text-gray-500" />
                 <h3 className="font-bold text-gray-900">Passbook</h3>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    {['ALL', 'CREDIT', 'DEBIT'].map(f => (
                       <button
                          key={f}
                          onClick={() => setFilter(f as any)}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                             filter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
                          }`}
                       >
                          {f}
                       </button>
                    ))}
                 </div>
                 <button onClick={downloadStatement} className="text-gray-400 hover:text-brand-600 transition-colors focus:outline-none focus:text-brand-600" title="Download Statement">
                    <Download className="h-5 w-5" />
                 </button>
              </div>
           </div>

           <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {filteredTransactions.length === 0 ? (
                 <div className="p-12 text-center text-gray-400 text-sm">
                    No transactions found.
                 </div>
              ) : (
                 filteredTransactions.map(txn => (
                    <div key={txn.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                             txn.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                             {txn.category === 'ADD_MONEY' && <Plus className="h-5 w-5" />}
                             {txn.category === 'WITHDRAWAL' && <Landmark className="h-5 w-5" />}
                             {txn.category === 'REFUND' && <ArrowDownLeft className="h-5 w-5" />}
                             {txn.category === 'BOOKING' && <CreditCard className="h-5 w-5" />}
                             {txn.category === 'CASHBACK' && <Banknote className="h-5 w-5" />}
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-gray-900">{txn.description}</h4>
                             <p className="text-xs text-gray-500">
                                {new Date(txn.date).toLocaleDateString()} • {new Date(txn.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                {txn.referenceId && <span className="ml-2 font-mono bg-gray-100 px-1 rounded text-[10px]">Ref: {txn.referenceId}</span>}
                             </p>
                          </div>
                       </div>
                       <div className={`text-right font-bold ${
                          txn.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'
                       }`}>
                          {txn.type === 'CREDIT' ? '+' : '-'} ₹{txn.amount.toLocaleString()}
                          <div className="text-[10px] font-normal text-gray-400 uppercase tracking-wider">{txn.status}</div>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

      </div>

      {/* Add Money Modal */}
      {showAddModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true">
            <div ref={addModalRef} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl transform scale-100 animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Add Money</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"><X className="h-5 w-5"/></button>
               </div>
               
               <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Amount</label>
                  <div className="relative">
                     <span className="absolute left-4 top-3 text-gray-400 text-lg font-bold">₹</span>
                     <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        placeholder="0"
                        autoFocus
                     />
                  </div>
                  <div className="flex gap-2 mt-3">
                     {[500, 1000, 2000].map(val => (
                        <button 
                           key={val} 
                           onClick={() => setAmount(val.toString())}
                           className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                           + ₹{val}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 mb-4 uppercase">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                     {[
                        { id: 'UPI', label: 'UPI', icon: <Smartphone className="h-4 w-4" /> },
                        { id: 'CARD', label: 'Card', icon: <CreditCard className="h-4 w-4" /> },
                        { id: 'NETBANKING', label: 'Bank', icon: <Landmark className="h-4 w-4" /> }
                     ].map(method => (
                        <button
                           key={method.id}
                           onClick={() => setPaymentMethod(method.id as any)}
                           className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                              paymentMethod === method.id 
                              ? 'border-brand-500 bg-brand-50 text-brand-700' 
                              : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                           }`}
                        >
                           {method.icon}
                           <span className="text-[10px] font-bold">{method.label}</span>
                        </button>
                     ))}
                  </div>

                  {paymentMethod === 'UPI' && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-4 gap-3">
                           {[
                              { id: 'gpay', name: 'GPay', color: 'bg-blue-500' },
                              { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-600' },
                              { id: 'paytm', name: 'Paytm', color: 'bg-sky-500' },
                              { id: 'other', name: 'Other', color: 'bg-gray-200' }
                           ].map(app => (
                              <button
                                 key={app.id}
                                 onClick={() => setSelectedUpiApp(app.id)}
                                 className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                                    selectedUpiApp === app.id ? 'border-brand-500 bg-brand-50' : 'border-transparent'
                                 }`}
                              >
                                 <div className={`w-10 h-10 rounded-full ${app.color} flex items-center justify-center text-white font-bold text-[10px]`}>
                                    {app.name[0]}
                                 </div>
                                 <span className="text-[8px] font-medium text-gray-600">{app.name}</span>
                              </button>
                           ))}
                        </div>
                        <div className="relative">
                           <input 
                              type="text" 
                              placeholder="Enter UPI ID (e.g. user@upi)"
                              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                           />
                        </div>
                     </div>
                  )}

                  {paymentMethod === 'CARD' && (
                     <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <input type="text" placeholder="Card Number" className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                           <input type="text" placeholder="MM/YY" className="p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                           <input type="password" placeholder="CVV" className="p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                     </div>
                  )}
               </div>

               <Button 
                  onClick={handleAddMoney} 
                  isLoading={loading} 
                  disabled={!amount || Number(amount) <= 0}
                  className="w-full"
               >
                  {loading ? 'Processing...' : `Pay ₹${Number(amount).toLocaleString()}`}
               </Button>

            </div>
         </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true">
            <div ref={withdrawModalRef} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl transform scale-100 animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Transfer to Bank</h3>
                  <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"><X className="h-5 w-5"/></button>
               </div>
               
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Amount</label>
                     <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-brand-500 outline-none"
                        placeholder="Enter amount"
                     />
                     <p className="text-xs text-gray-400 mt-1 text-right">Available: ₹{balance}</p>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Bank Account / UPI ID</label>
                     <input 
                        type="text" 
                        value={bankDetails}
                        onChange={(e) => setBankDetails(e.target.value)}
                        className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-brand-500 outline-none"
                        placeholder="e.g. user@upi or Account Number"
                     />
                  </div>
               </div>

               <Button 
                  onClick={handleWithdraw} 
                  isLoading={loading} 
                  disabled={!amount || Number(amount) <= 0 || Number(amount) > balance || !bankDetails}
                  className="w-full"
               >
                  Transfer Now
               </Button>
            </div>
         </div>
      )}

    </div>
  );
};

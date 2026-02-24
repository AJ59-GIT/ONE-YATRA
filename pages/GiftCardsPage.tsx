
import React, { useState } from 'react';
import { Gift, CreditCard, ArrowRight, Check, Loader2, Building, Search, Send, Clock, User } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { purchaseGiftCard, validateGiftCard } from '../services/giftCardService';
import { GiftCard } from '../types';

export const GiftCardsPage: React.FC<{onBack:()=>void}> = ({onBack}) => {
    const [activeTab, setActiveTab] = useState<'BUY' | 'BALANCE' | 'CORPORATE'>('BUY');
    
    // Buy State
    const [selectedDesign, setSelectedDesign] = useState(0);
    const [amount, setAmount] = useState(1000);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [senderName, setSenderName] = useState('');
    const [message, setMessage] = useState('');
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchasedCard, setPurchasedCard] = useState<GiftCard | null>(null);

    // Balance State
    const [checkCode, setCheckCode] = useState('');
    const [checkedCard, setCheckedCard] = useState<GiftCard | null>(null);
    const [checkError, setCheckError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    // Corporate State
    const [bulkQty, setBulkQty] = useState(50);

    const designs = [
        "bg-gradient-to-r from-pink-500 to-rose-500",
        "bg-gradient-to-r from-blue-500 to-cyan-500",
        "bg-gradient-to-r from-purple-500 to-indigo-500",
        "bg-gradient-to-r from-amber-400 to-orange-500",
        "bg-gradient-to-r from-slate-700 to-slate-900"
    ];

    const handleBuy = async () => {
        if(!recipientEmail || !senderName) return alert("Please fill all details");
        setIsPurchasing(true);
        try {
            const card = await purchaseGiftCard(amount, {
                sender: senderName,
                recipientEmail,
                message,
                designId: designs[selectedDesign]
            });
            setPurchasedCard(card);
        } catch(e) {
            alert("Purchase failed");
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleCheckBalance = async () => {
        if(!checkCode) return;
        setIsChecking(true);
        setCheckError('');
        setCheckedCard(null);
        
        const result = await validateGiftCard(checkCode);
        if (result.isValid && result.card) {
            setCheckedCard(result.card);
        } else {
            setCheckError(result.message || 'Invalid Code');
        }
        setIsChecking(false);
    };

    const renderCardPreview = (amountDisplay: number, designIndex: number) => (
        <div className={`${designs[designIndex]} rounded-2xl p-6 text-white shadow-xl h-48 flex flex-col justify-between relative overflow-hidden transition-all duration-500`}>
            <div className="absolute top-0 right-0 p-8 opacity-20"><Gift className="w-32 h-32"/></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">OneYatra Gift</h3>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                        <Gift className="h-5 w-5 text-white" />
                    </div>
                </div>
                <p className="text-white/80 text-xs mt-1">Valid on Flights, Hotels & More</p>
            </div>
            <div className="relative z-10">
                <div className="text-3xl font-mono font-bold">₹{amountDisplay.toLocaleString()}</div>
                <div className="text-[10px] opacity-70 mt-1">No Expiry • Instant Delivery</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in pb-20">
            {/* Header Tabs */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Gift className="h-6 w-6 text-brand-600"/> Gift Cards
                </h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['BUY', 'BALANCE', 'CORPORATE'].map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t as any)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === t ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t === 'BUY' ? 'Buy' : t === 'BALANCE' ? 'Check Balance' : 'Corporate'}
                        </button>
                    ))}
                </div>
            </div>

            {/* BUY TAB */}
            {activeTab === 'BUY' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Preview & Design */}
                    <div>
                        {purchasedCard ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-in zoom-in">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-green-800 mb-2">Purchase Successful!</h3>
                                <p className="text-sm text-green-700 mb-6">
                                    Gift Card <strong>{purchasedCard.code}</strong> sent to {purchasedCard.recipientEmail}.
                                </p>
                                <Button onClick={() => {setPurchasedCard(null); setRecipientEmail('');}} variant="outline" className="w-full">
                                    Send Another
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                                    {renderCardPreview(amount, selectedDesign)}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Select Design</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                        {designs.map((d, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => setSelectedDesign(i)}
                                                className={`w-10 h-10 rounded-full shrink-0 ${d} ring-offset-2 transition-all ${selectedDesign === i ? 'ring-2 ring-brand-500 scale-110' : 'hover:scale-110'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Form */}
                    {!purchasedCard && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Gift Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Amount</label>
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        {[500, 1000, 2000, 5000].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setAmount(amt)}
                                                className={`py-2 rounded-lg border text-xs font-bold transition-colors ${amount === amt ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                            >
                                                ₹{amt}
                                            </button>
                                        ))}
                                    </div>
                                    <Input 
                                        label="" 
                                        type="number" 
                                        value={amount} 
                                        onChange={e => setAmount(parseInt(e.target.value))} 
                                        containerClassName="mb-0"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Your Name" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Sender Name" />
                                    <Input label="Recipient Email" type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="friend@mail.com" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Message (Optional)</label>
                                    <textarea 
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-20 resize-none"
                                        placeholder="Add a personal note..."
                                    />
                                </div>

                                <Button onClick={handleBuy} isLoading={isPurchasing} className="w-full h-12 text-lg shadow-lg shadow-brand-500/30">
                                    Pay ₹{amount}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* BALANCE TAB */}
            {activeTab === 'BALANCE' && (
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
                        <h3 className="font-bold text-gray-900 mb-4">Check Gift Card Balance</h3>
                        <div className="flex gap-2 mb-4">
                            <div className="flex-grow">
                                <Input 
                                    label="Card Code" 
                                    value={checkCode} 
                                    onChange={e => setCheckCode(e.target.value)} 
                                    placeholder="XXXX-XXXX-XXXX-XXXX" 
                                    containerClassName="mb-0"
                                />
                            </div>
                            <Button className="mt-6" onClick={handleCheckBalance} isLoading={isChecking} disabled={!checkCode}>Check</Button>
                        </div>
                        {checkError && (
                            <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg flex items-center">
                                <span className="mr-2">⚠️</span> {checkError}
                            </p>
                        )}
                    </div>

                    {checkedCard && (
                        <div className={`${checkedCard.designId || designs[0]} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-4`}>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Current Balance</p>
                                    <div className="text-4xl font-mono font-bold">₹{checkedCard.balance}</div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Status</p>
                                    <div className="font-bold bg-white/20 px-2 py-1 rounded text-sm inline-block backdrop-blur-sm">{checkedCard.status}</div>
                                </div>
                            </div>
                            
                            <div className="bg-black/20 rounded-lg p-3 backdrop-blur-md">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-white/70">Card Number</span>
                                    <span className="font-mono">{checkedCard.code}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/70">Expires</span>
                                    <span>{new Date(checkedCard.expiryDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {checkedCard.transactions && checkedCard.transactions.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <p className="text-xs font-bold mb-2 uppercase opacity-80">Recent Usage</p>
                                    {checkedCard.transactions.map((tx, idx) => (
                                        <div key={idx} className="flex justify-between text-xs mb-1">
                                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                                            <span className="text-red-200 font-mono">-₹{tx.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* CORPORATE TAB */}
            {activeTab === 'CORPORATE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Corporate Gifting</h2>
                            <p className="text-gray-500">Reward your employees and partners with the gift of travel. Instant bulk delivery.</p>
                        </div>
                        
                        <ul className="space-y-3">
                            {['Bulk Discounts up to 10%', 'Instant Email Delivery', 'GST Invoicing', 'Custom Company Branding'].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                    <div className="bg-brand-100 p-1 rounded-full"><Check className="h-3 w-3 text-brand-600"/></div>
                                    {feat}
                                </li>
                            ))}
                        </ul>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Building className="h-5 w-5 text-blue-600"/>
                                <h4 className="font-bold text-blue-900">Bulk Order Calculator</h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 mb-1">Quantity: {bulkQty}</label>
                                    <input type="range" min="10" max="500" value={bulkQty} onChange={e => setBulkQty(parseInt(e.target.value))} className="w-full accent-blue-600"/>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-blue-700">Total Value (at ₹1000/card)</span>
                                    <span className="font-bold text-blue-900">₹{(bulkQty * 1000).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-green-600 font-bold">You Save (5%)</span>
                                    <span className="font-bold text-green-700">-₹{(bulkQty * 1000 * 0.05).toLocaleString()}</span>
                                </div>
                                <div className="border-t border-blue-200 pt-2 flex justify-between items-center font-bold text-lg text-blue-900">
                                    <span>Payable</span>
                                    <span>₹{(bulkQty * 1000 * 0.95).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <Button className="w-full">Request Corporate Account</Button>
                    </div>
                    <div className="hidden md:block">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl transform rotate-3 opacity-20"></div>
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                                    <div>
                                        <div className="h-4 w-32 bg-gray-100 rounded mb-2"></div>
                                        <div className="h-3 w-20 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-gray-50 rounded"></div>
                                    <div className="h-4 w-5/6 bg-gray-50 rounded"></div>
                                    <div className="h-4 w-4/6 bg-gray-50 rounded"></div>
                                </div>
                                <div className="mt-8 bg-brand-50 p-4 rounded-xl border border-brand-100 text-center">
                                    <p className="text-brand-800 font-bold text-sm">"The best employee reward we've used!"</p>
                                    <p className="text-brand-600 text-xs mt-1">- HR Manager, TechCorp</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import { Crown, Gift, History, Share2, ArrowLeft, Star, Lock, Copy, Award, Ticket, CheckCircle, TrendingUp, AlertCircle, Clock, Users, ArrowRight, UserPlus, Info, Check, MessageCircle, Mail } from 'lucide-react';
import { UserProfile, Reward, PointTransaction, LoyaltyTier, Referral } from '../types';
import { getCurrentUser } from '../services/authService';
import { getTierDetails, redeemPoints, REWARDS_CATALOG, ACHIEVEMENTS, addReferralBonus, getReferralCode, getReferralHistory, getLeaderboard } from '../services/loyaltyService';
import { Button } from '../components/Button';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface LoyaltyPageProps {
  onBack: () => void;
}

export const LoyaltyPage: React.FC<LoyaltyPageProps> = ({ onBack }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REWARDS' | 'HISTORY' | 'REFERRAL'>('DASHBOARD');
  const [showConfetti, setShowConfetti] = useState(false);
  const [redeemModal, setRedeemModal] = useState<{ isOpen: boolean, reward?: Reward, code?: string }>({ isOpen: false });
  const [isCopied, setIsCopied] = useState(false);

  // Referral State
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<{name:string, count:number}[]>([]);

  const redeemModalRef = useFocusTrap(redeemModal.isOpen, () => setRedeemModal({ ...redeemModal, isOpen: false }));

  // Load User Data
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Ensure defaults
      if (!currentUser.loyaltyPoints) currentUser.loyaltyPoints = 0;
      if (!currentUser.loyaltyTier) currentUser.loyaltyTier = 'SILVER';
      setUser(currentUser);
      
      // Init Referral Data
      const code = getReferralCode(currentUser);
      setReferralCode(code);
      setReferrals(getReferralHistory(currentUser));
      setLeaderboard(getLeaderboard());
    }
  }, []);

  const refreshUser = () => {
    const u = getCurrentUser();
    if (u) {
        setUser(u);
        setReferrals(u.referrals || []);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (!window.confirm(`Redeem ${reward.cost} points for "${reward.title}"?`)) return;
    
    const result = await redeemPoints(reward.id);
    if (result.success) {
      setRedeemModal({ isOpen: true, reward, code: result.code });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      refreshUser();
    } else {
      alert(result.message);
    }
  };

  const handleReferral = async () => {
      // Simulate referral completion for demo
      const success = await addReferralBonus();
      if(success) {
          alert("Referral Simulation: Friend joined! You earned 500 bonus points.");
          refreshUser();
      }
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(referralCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const shareReferral = async (method: 'native' | 'whatsapp' | 'email') => {
      const text = `Join OneYatra with my code ${referralCode} and get ₹100 off your first trip! 🌍✈️`;
      const url = `https://oneyatra.app/invite/${referralCode}`;
      
      if (method === 'native') {
          if (navigator.share) {
              try { await navigator.share({ title: 'Join OneYatra', text, url }); } catch(e) {}
          } else {
              copyToClipboard();
              alert("Link copied to clipboard!");
          }
      } else if (method === 'whatsapp') {
          window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
      } else if (method === 'email') {
          window.open(`mailto:?subject=Invite to OneYatra&body=${encodeURIComponent(text + '\n\n' + url)}`, '_self');
      }
  };

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  const { current, next, progress, remaining } = getTierDetails(user.loyaltyPoints || 0);

  const tierColors: Record<LoyaltyTier, string> = {
    'SILVER': 'from-slate-400 to-slate-600',
    'GOLD': 'from-yellow-400 to-yellow-600',
    'PLATINUM': 'from-slate-800 to-black'
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
        {/* Progress Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider">Next Tier Goal</h3>
                    <div className="font-bold text-gray-900 mt-1">
                        {next ? `Reach ${next}` : 'Top Tier Reached!'}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-brand-600">{user.loyaltyPoints}</div>
                    <div className="text-xs text-gray-400">Total Points</div>
                </div>
            </div>
            
            {next && (
                <>
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                        <div 
                            className={`h-full rounded-full bg-gradient-to-r ${tierColors[current]} transition-all duration-1000 ease-out`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                        <span>Current: {current}</span>
                        <span>Need {remaining} pts</span>
                    </div>
                </>
            )}
        </div>

        {/* Milestones / Badges */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 text-purple-600 mr-2" /> Milestones
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ACHIEVEMENTS.map(ach => (
                    <div key={ach.id} className={`flex flex-col items-center text-center p-3 rounded-xl border ${ach.unlocked ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                        <div className="text-2xl mb-2 filter drop-shadow-sm">{ach.icon}</div>
                        <div className="text-xs font-bold text-gray-800">{ach.title}</div>
                        <div className="text-[10px] text-gray-500 mt-1 line-clamp-2">{ach.description}</div>
                        {!ach.unlocked && ach.maxProgress && (
                            <div className="w-full bg-gray-200 h-1.5 mt-2 rounded-full overflow-hidden">
                                <div className="bg-purple-400 h-full" style={{ width: `${((ach.progress||0)/ach.maxProgress)*100}%` }}></div>
                            </div>
                        )}
                        {ach.unlocked && <div className="mt-1 text-[10px] text-purple-700 font-bold flex items-center"><CheckCircle className="h-3 w-3 mr-1"/> Unlocked</div>}
                    </div>
                ))}
            </div>
        </div>

        {/* Referral Teaser */}
        <div 
            onClick={() => setActiveTab('REFERRAL')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden cursor-pointer group focus:outline-none focus:ring-4 focus:ring-indigo-300"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') setActiveTab('REFERRAL'); }}
        >
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                    Refer & Earn <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"/>
                </h3>
                <p className="text-indigo-100 text-sm mb-4 max-w-md">
                    Invite your friends to OneYatra. They get ₹100 off, and you earn 500 bonus points per referral!
                </p>
            </div>
            <Share2 className="absolute -right-6 -bottom-6 h-32 w-32 text-white opacity-10 rotate-12" />
        </div>
    </div>
  );

  const renderRewards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
        {REWARDS_CATALOG.map(reward => {
            const isLocked = reward.minTier && user.loyaltyTier !== reward.minTier && user.loyaltyTier !== 'PLATINUM';
            const canAfford = (user.loyaltyPoints || 0) >= reward.cost;

            return (
                <div key={reward.id} className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between relative overflow-hidden group ${isLocked ? 'opacity-70' : ''}`}>
                    {isLocked && (
                        <div className="absolute top-2 right-2 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded flex items-center">
                            <Lock className="h-3 w-3 mr-1" /> {reward.minTier} Only
                        </div>
                    )}
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <div className={`p-2 rounded-lg ${reward.type === 'DISCOUNT' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Ticket className="h-5 w-5" />
                            </div>
                            <div className="font-bold text-gray-900 text-lg">{reward.cost} pts</div>
                        </div>
                        <h3 className="font-bold text-gray-800">{reward.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
                    </div>
                    
                    <button 
                        onClick={() => handleRedeem(reward)}
                        disabled={isLocked || !canAfford}
                        className={`mt-4 w-full py-2 rounded-lg text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isLocked 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : canAfford 
                                ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm focus:ring-brand-500' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isLocked ? 'Locked' : canAfford ? 'Redeem' : 'Insufficient Points'}
                    </button>
                </div>
            );
        })}
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">Transaction History</h3>
        </div>
        <div className="divide-y divide-gray-100">
            {(!user.pointHistory || user.pointHistory.length === 0) ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                    No transactions yet. Book a trip to earn points!
                </div>
            ) : (
                user.pointHistory.map(txn => (
                    <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className={`mt-1 p-1.5 rounded-full ${txn.type === 'REDEEM' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                {txn.type === 'REDEEM' ? <TrendingUp className="h-4 w-4 rotate-180" /> : <TrendingUp className="h-4 w-4" />}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 text-sm">{txn.description}</div>
                                <div className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString()}</div>
                                {txn.expiryDate && (
                                    <div className="text-[10px] text-orange-500 flex items-center mt-0.5">
                                        <Clock className="h-3 w-3 mr-1" /> Expires {new Date(txn.expiryDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`font-bold ${txn.amount > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {txn.amount > 0 ? '+' : ''}{txn.amount}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  const renderReferral = () => {
      const completedCount = referrals.filter(r => r.status === 'COMPLETED').length;
      const totalEarned = referrals.reduce((sum, r) => sum + (r.status === 'COMPLETED' ? r.rewardAmount : 0), 0);
      const pendingCount = referrals.length - completedCount;

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            
            {/* Hero Section */}
            <div className="text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-indigo-100 mb-2">
                    <UserPlus className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Invite Friends, Get Rewards</h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Share your code. When a friend signs up and books their first trip, you both earn rewards!
                </p>

                {/* Code Box */}
                <div className="bg-white border-2 border-dashed border-indigo-200 rounded-xl p-4 max-w-sm mx-auto flex items-center justify-between shadow-sm">
                    <div className="text-left">
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Your Code</div>
                        <div className="text-2xl font-mono font-bold text-indigo-600 tracking-widest">{referralCode}</div>
                    </div>
                    <button 
                        onClick={copyToClipboard}
                        className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {isCopied ? <Check className="h-4 w-4 mr-1"/> : <Copy className="h-4 w-4 mr-1" />}
                        {isCopied ? 'Copied' : 'Copy'}
                    </button>
                </div>

                {/* Share Buttons */}
                <div className="flex justify-center gap-3">
                    <button onClick={() => shareReferral('whatsapp')} className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                    </button>
                    <button onClick={() => shareReferral('email')} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">
                        <Mail className="h-4 w-4" /> Email
                    </button>
                    <button onClick={() => shareReferral('native')} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <Share2 className="h-4 w-4" /> More
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 border border-green-100 p-3 rounded-xl text-center">
                    <div className="text-xl font-bold text-green-700">{completedCount}</div>
                    <div className="text-[10px] text-green-600 font-medium">Successful</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-center">
                    <div className="text-xl font-bold text-indigo-700">₹{totalEarned}</div>
                    <div className="text-[10px] text-indigo-600 font-medium">Earned</div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl text-center">
                    <div className="text-xl font-bold text-orange-700">{pendingCount}</div>
                    <div className="text-[10px] text-orange-600 font-medium">Pending</div>
                </div>
            </div>

            {/* How it Works */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6">How it works</h3>
                <div className="relative">
                    <div className="absolute top-4 left-4 bottom-4 w-0.5 bg-gray-200 -z-10"></div>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0 ring-4 ring-white">1</div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">Invite your friends</h4>
                                <p className="text-xs text-gray-500 mt-1">Share your unique link via WhatsApp or Email.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0 ring-4 ring-white">2</div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">They book a trip</h4>
                                <p className="text-xs text-gray-500 mt-1">They sign up and complete their first booking of ₹500+.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0 ring-4 ring-white">3</div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">You both get rewarded</h4>
                                <p className="text-xs text-gray-500 mt-1">You get 500 Loyalty Points. They get ₹100 off.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* History List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Referrals</h3>
                    <button onClick={handleReferral} className="text-xs text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Simulate +1</button>
                </div>
                {referrals.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No referrals yet. Share your link!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                        {referrals.map(ref => (
                            <div key={ref.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                        {ref.refereeName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">{ref.refereeName}</div>
                                        <div className="text-xs text-gray-500">{new Date(ref.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {ref.status === 'COMPLETED' ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold">
                                            <Check className="h-3 w-3 mr-1"/> Earned ₹{ref.rewardAmount}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-orange-100 text-orange-700 text-[10px] font-bold">
                                            <Clock className="h-3 w-3 mr-1"/> Pending
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Leaderboard */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 text-white relative overflow-hidden">
                <Crown className="absolute -right-4 -top-4 h-24 w-24 text-yellow-500 opacity-20 rotate-12" />
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" /> Top Referrers
                </h3>
                <div className="space-y-3 relative z-10">
                    {leaderboard.map((leader, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 flex items-center justify-center font-bold text-xs rounded ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-gray-300 text-gray-900' : idx === 2 ? 'bg-orange-400 text-orange-900' : 'text-gray-400'}`}>
                                    {idx + 1}
                                </div>
                                <span className={`text-sm ${leader.name === 'You' ? 'font-bold text-yellow-300' : 'text-gray-300'}`}>{leader.name}</span>
                            </div>
                            <div className="text-xs font-mono text-gray-400">{leader.count} Refs</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* T&C */}
            <div className="text-[10px] text-gray-400 text-center px-4 leading-relaxed">
                Terms: Referral rewards are credited only after the referred user completes their first booking of minimum value ₹500. 
                Self-referrals are not allowed. Points valid for 1 year.
            </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative overflow-hidden">
      
      {/* Confetti Effect */}
      {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
              <div className="animate-bounce text-6xl">🎉</div>
          </div>
      )}

      {/* Header Section */}
      <div className={`relative pt-8 pb-20 px-6 ${
          current === 'PLATINUM' ? 'bg-gradient-to-br from-slate-800 to-black text-white' :
          current === 'GOLD' ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white' :
          'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800'
      }`}>
         <button onClick={onBack} className="absolute top-6 left-4 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white">
            <ArrowLeft className="h-5 w-5" />
         </button>
         
         <div className="flex flex-col items-center text-center mt-4">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-3 shadow-lg ring-4 ring-white/10">
                <Crown className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">OneYatra {current}</h1>
            <p className="text-sm opacity-90 mt-1">Member since {new Date().getFullYear()}</p>
         </div>
      </div>

      {/* Main Content Card (Overlapping) */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
         
         {/* Navigation Tabs */}
         <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-1 flex mb-6 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('DASHBOARD')}
                className={`flex-1 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'DASHBOARD' ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('REFERRAL')}
                className={`flex-1 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'REFERRAL' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Refer & Earn
            </button>
            <button 
                onClick={() => setActiveTab('REWARDS')}
                className={`flex-1 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'REWARDS' ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Rewards
            </button>
            <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`flex-1 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-500 ${activeTab === 'HISTORY' ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                History
            </button>
         </div>

         {/* Tab Content */}
         {activeTab === 'DASHBOARD' && renderDashboard()}
         {activeTab === 'REFERRAL' && renderReferral()}
         {activeTab === 'REWARDS' && renderRewards()}
         {activeTab === 'HISTORY' && renderHistory()}

      </div>

      {/* Redemption Success Modal */}
      {redeemModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
              <div ref={redeemModalRef} className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl transform scale-100 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Redemption Successful!</h3>
                  <p className="text-sm text-gray-500 mb-6">
                      You have successfully redeemed <strong>{redeemModal.reward?.title}</strong>.
                  </p>
                  
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6 relative group cursor-pointer"
                       onClick={() => {navigator.clipboard.writeText(redeemModal.code || ''); alert("Code Copied!");}}
                       tabIndex={0}
                       onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { navigator.clipboard.writeText(redeemModal.code || ''); alert("Code Copied!"); }}}
                  >
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Coupon Code</div>
                      <div className="text-2xl font-mono font-bold text-brand-600 tracking-widest">{redeemModal.code}</div>
                      <div className="absolute top-2 right-2 text-gray-300 group-hover:text-brand-500 transition-colors"><Copy className="h-4 w-4"/></div>
                  </div>

                  <Button onClick={() => setRedeemModal({ ...redeemModal, isOpen: false })} className="w-full">
                      Done
                  </Button>
              </div>
          </div>
      )}

    </div>
  );
};

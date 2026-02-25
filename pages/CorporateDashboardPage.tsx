
import React, { useState, useEffect } from 'react';
import { Building2, PieChart, Users, FileText, CheckCircle, Clock, AlertTriangle, ArrowRight, Settings, Download, XCircle, ChevronDown, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ApprovalRequest, CorporatePolicy, CorporateProfile, Department } from '../types';
import { getApprovals, getCorporateProfile, getDepartments, getPolicy, processApproval, updatePolicy, exportExpenses } from '../services/corporateService';

type Tab = 'DASHBOARD' | 'APPROVALS' | 'POLICIES' | 'REPORTS' | 'SETTINGS';

export const CorporateDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [profile, setProfile] = useState<CorporateProfile | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [policy, setPolicy] = useState<CorporatePolicy | null>(null);
  const [loading, setLoading] = useState(true);

  // Policy Form State
  const [editPolicy, setEditPolicy] = useState<Partial<CorporatePolicy>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const p = await getCorporateProfile();
    setProfile(p);
    setApprovals(getApprovals());
    setDepartments(getDepartments());
    const pol = getPolicy();
    setPolicy(pol);
    setEditPolicy(pol);
    setLoading(false);
  };

  const handleApprovalAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    const updated = processApproval(id, action);
    setApprovals([...updated]); // Trigger re-render
  };

  const savePolicy = () => {
    if (editPolicy) {
        setPolicy(updatePolicy(editPolicy));
        alert("Policy Updated Successfully");
    }
  };

  if (loading || !profile) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 pb-24">
       <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
             <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                   <Building2 className="h-6 w-6 text-brand-600" /> {profile.companyName}
                </h1>
                <p className="text-gray-500 text-sm">Corporate Admin Portal • GST: {profile.gstin}</p>
             </div>
             <div className="flex gap-2 overflow-x-auto">
                {['DASHBOARD', 'APPROVALS', 'POLICIES', 'REPORTS', 'SETTINGS'].map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t as Tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === t ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                ))}
             </div>
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === 'DASHBOARD' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 mb-8">
                    
                    {/* Main Spend Card - Large */}
                    <div className="md:col-span-3 md:row-span-2 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Total Spend (YTD)</div>
                            <div className="text-5xl font-black text-gray-900">₹{(profile.spentAmount / 100000).toFixed(2)}L</div>
                        </div>
                        <div className="mt-8">
                            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">Budget Utilization</div>
                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-brand-500 h-full rounded-full transition-all duration-1000" style={{width: `${(profile.spentAmount / profile.totalBudget) * 100}%`}}></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500">
                                <span>SPENT: ₹{(profile.spentAmount / 100000).toFixed(2)}L</span>
                                <span>LIMIT: ₹{(profile.totalBudget / 100000).toFixed(2)}L</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Approvals - Medium */}
                    <div className="md:col-span-3 bg-orange-50 p-6 rounded-2xl border border-orange-100 shadow-sm flex items-center justify-between group cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => setActiveTab('APPROVALS')}>
                        <div>
                            <div className="text-orange-700 text-xs uppercase font-bold tracking-wider mb-1">Pending Approvals</div>
                            <div className="text-4xl font-black text-orange-600">{approvals.filter(a => a.status === 'PENDING').length}</div>
                            <div className="text-xs text-orange-800/60 mt-1 font-medium">Requires your immediate attention</div>
                        </div>
                        <div className="bg-white p-3 rounded-full shadow-sm group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="h-6 w-6 text-orange-500" />
                        </div>
                    </div>

                    {/* Active Travelers - Small */}
                    <div className="md:col-span-1 bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center text-center">
                        <div className="text-blue-700 text-[10px] uppercase font-bold tracking-wider mb-1">Active</div>
                        <div className="text-3xl font-black text-blue-600">14</div>
                        <div className="text-[10px] text-blue-800/60 font-bold uppercase mt-1">Travelers</div>
                    </div>

                    {/* Budget Remaining - Small/Medium */}
                    <div className="md:col-span-2 bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm flex flex-col justify-center">
                        <div className="text-green-700 text-[10px] uppercase font-bold tracking-wider mb-1">Remaining Budget</div>
                        <div className="text-2xl font-black text-green-600">₹{((profile.totalBudget - profile.spentAmount) / 100000).toFixed(2)}L</div>
                        <div className="flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] text-green-800/60 font-bold uppercase">Healthy Status</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Department Spend - 2/3 width */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center"><PieChart className="h-5 w-5 mr-2 text-brand-500"/> Departmental Allocation</h3>
                            <button className="text-xs font-bold text-brand-600 hover:underline uppercase tracking-wider">View Details</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {departments.map(dept => (
                                <div key={dept.id} className="group">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="font-bold text-gray-900 uppercase tracking-tight">{dept.name}</span>
                                        <span className="text-gray-500 font-mono">₹{dept.currentSpend.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${dept.currentSpend > dept.monthlyBudget * 0.9 ? 'bg-red-500' : 'bg-brand-500'}`} 
                                            style={{ width: `${Math.min(100, (dept.currentSpend / dept.monthlyBudget) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-1.5">
                                        <span className="text-[10px] text-gray-400 font-medium uppercase">Utilized: {Math.round((dept.currentSpend / dept.monthlyBudget) * 100)}%</span>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase">Limit: ₹{(dept.monthlyBudget / 1000).toFixed(0)}k</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Policies - 1/3 width */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
                        <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center"><Settings className="h-5 w-5 mr-2 text-brand-500"/> Policy Guardrails</h3>
                        <div className="space-y-4 flex-1">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-brand-200 transition-colors">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Max Flight (DOM)</div>
                                <div className="text-xl font-black text-slate-900">₹{policy?.maxFlightPrice.toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-brand-200 transition-colors">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Advance Booking</div>
                                <div className="text-xl font-black text-slate-900">{policy?.minAdvanceBookingDays} Days</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-brand-200 transition-colors">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Approval Threshold</div>
                                <div className="text-xl font-black text-slate-900">₹{policy?.requireApprovalAbove.toLocaleString()}</div>
                            </div>
                        </div>
                        <Button className="w-full mt-8" variant="outline" onClick={() => setActiveTab('POLICIES')}>Manage Policies</Button>
                    </div>
                </div>
              </div>
          )}

          {/* APPROVALS TAB */}
          {activeTab === 'APPROVALS' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Pending Requests</h3>
                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{approvals.filter(a => a.status === 'PENDING').length} Pending</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                      {approvals.length === 0 ? <div className="p-8 text-center text-gray-500">No requests found.</div> : 
                       approvals.map(req => (
                          <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-gray-900">{req.employeeName}</span>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-sm text-gray-600">Ref: {req.bookingId}</span>
                                  </div>
                                  <div className="text-xl font-bold text-gray-900 mb-1">₹{req.amount.toLocaleString()}</div>
                                  {req.violationReason && (
                                      <div className="text-xs text-red-600 bg-red-50 inline-block px-2 py-1 rounded font-medium">
                                          <AlertTriangle className="h-3 w-3 inline mr-1"/> {req.violationReason}
                                      </div>
                                  )}
                                  <div className="text-xs text-gray-400 mt-2">Requested {new Date(req.requestedAt).toLocaleString()}</div>
                              </div>
                              
                              {req.status === 'PENDING' ? (
                                  <div className="flex gap-2">
                                      <button onClick={() => handleApprovalAction(req.id, 'REJECTED')} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold flex items-center"><XCircle className="h-4 w-4 mr-1"/> Reject</button>
                                      <button onClick={() => handleApprovalAction(req.id, 'APPROVED')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold flex items-center shadow-sm"><CheckCircle className="h-4 w-4 mr-1"/> Approve</button>
                                  </div>
                              ) : (
                                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {req.status}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* POLICIES TAB */}
          {activeTab === 'POLICIES' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in max-w-2xl mx-auto">
                  <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center"><Settings className="h-5 w-5 mr-2"/> Travel Policy Configuration</h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Max Flight Price (Domestic)</label>
                          <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                              <input 
                                type="number" 
                                value={editPolicy.maxFlightPrice} 
                                onChange={(e) => setEditPolicy({...editPolicy, maxFlightPrice: parseInt(e.target.value)})}
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Max Hotel Price (Per Night)</label>
                          <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                              <input 
                                type="number" 
                                value={editPolicy.maxHotelPrice} 
                                onChange={(e) => setEditPolicy({...editPolicy, maxHotelPrice: parseInt(e.target.value)})}
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Auto-Approval Limit</label>
                          <div className="text-xs text-gray-500 mb-2">Bookings below this amount do not require manager approval if compliant.</div>
                          <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                              <input 
                                type="number" 
                                value={editPolicy.requireApprovalAbove} 
                                onChange={(e) => setEditPolicy({...editPolicy, requireApprovalAbove: parseInt(e.target.value)})}
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Advance Booking (Days)</label>
                          <input 
                            type="number" 
                            value={editPolicy.minAdvanceBookingDays} 
                            onChange={(e) => setEditPolicy({...editPolicy, minAdvanceBookingDays: parseInt(e.target.value)})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                      </div>

                      <Button onClick={savePolicy} className="w-full">Save Changes</Button>
                  </div>
              </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'REPORTS' && (
              <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-end">
                      <Button variant="outline" onClick={exportExpenses}><Download className="h-4 w-4 mr-2"/> Export CSV</Button>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                              <tr>
                                  <th className="p-4">Date</th>
                                  <th className="p-4">Employee</th>
                                  <th className="p-4">Description</th>
                                  <th className="p-4">Amount</th>
                                  <th className="p-4">Department</th>
                                  <th className="p-4">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {[1,2,3,4,5].map(i => (
                                  <tr key={i} className="hover:bg-gray-50">
                                      <td className="p-4 text-gray-500">2023-10-0{i}</td>
                                      <td className="p-4 font-bold text-gray-900">Employee {i}</td>
                                      <td className="p-4">Flight to Delhi</td>
                                      <td className="p-4 font-mono">₹{Math.floor(Math.random() * 10000) + 2000}</td>
                                      <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">Sales</span></td>
                                      <td className="p-4 text-green-600 font-bold text-xs">PAID</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
       </div>
    </div>
  );
};

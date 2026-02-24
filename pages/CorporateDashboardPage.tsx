
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
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-xs uppercase font-bold">Total Spend (YTD)</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">₹{(profile.spentAmount / 100000).toFixed(2)}L</div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2"><div className="bg-brand-500 h-1.5 rounded-full" style={{width: '25%'}}></div></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-xs uppercase font-bold">Pending Approvals</div>
                        <div className="text-2xl font-bold text-orange-500 mt-1">{approvals.filter(a => a.status === 'PENDING').length}</div>
                        <div className="text-xs text-gray-400 mt-1">Action needed</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-xs uppercase font-bold">Active Travelers</div>
                        <div className="text-2xl font-bold text-blue-600 mt-1">14</div>
                        <div className="text-xs text-gray-400 mt-1">Currently on trip</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-xs uppercase font-bold">Budget Remaining</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">₹{((profile.totalBudget - profile.spentAmount) / 100000).toFixed(2)}L</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Department Spend */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center"><PieChart className="h-5 w-5 mr-2 text-gray-500"/> Department Usage</h3>
                        <div className="space-y-4">
                            {departments.map(dept => (
                                <div key={dept.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{dept.name}</span>
                                        <span className="text-gray-500">₹{dept.currentSpend.toLocaleString()} / ₹{dept.monthlyBudget.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${dept.currentSpend > dept.monthlyBudget * 0.9 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${Math.min(100, (dept.currentSpend / dept.monthlyBudget) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Policies */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Settings className="h-5 w-5 mr-2 text-gray-500"/> Active Policies</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Max Flight Price</span>
                                <span className="font-mono font-bold">₹{policy?.maxFlightPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Min Advance Booking</span>
                                <span className="font-mono font-bold">{policy?.minAdvanceBookingDays} Days</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Approval Threshold</span>
                                <span className="font-mono font-bold">₹{policy?.requireApprovalAbove.toLocaleString()}</span>
                            </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline" onClick={() => setActiveTab('POLICIES')}>Edit Policies</Button>
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

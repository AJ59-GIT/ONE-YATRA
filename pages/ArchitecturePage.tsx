
import React, { useState, useEffect } from 'react';
import { Server, Database, Smartphone, Globe, Shield, MessageSquare, CreditCard, Box, ArrowRight, Layers, Cpu, GitBranch, Search, Zap, Calculator, Map, TrendingUp, Link as LinkIcon, Lock, Activity, LayoutGrid, Network, AlertTriangle, FileText, Code, RefreshCw, CheckCircle, XCircle, HardDrive, Key, DollarSign, Repeat, ShoppingCart, ShieldCheck, Eye, Fingerprint, FileKey, Package, Terminal, Cloud, BarChart3, Radio, Info, X, Lightbulb, BellRing } from 'lucide-react';
import { sqlSchema, cachingStrategy, partitioningStrategy } from '../services/databaseSchema';
import { securityArchitecture, encryptionStandards, complianceChecklist } from '../services/securityConfig';
import { cicdPipeline, k8sArchitecture, monitoringStack } from '../services/devopsConfig';
import { addNotification } from '../services/notificationService';

interface ServiceBoxProps {
  icon: React.ReactNode;
  name: string;
  tech: string;
  highlight?: boolean;
}

const ServiceBox: React.FC<ServiceBoxProps> = ({ icon, name, tech, highlight }) => (
  <div className={`p-4 rounded-lg border flex flex-col items-center text-center transition-all hover:shadow-md ${highlight ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200'}`}>
    <div className={`mb-2 ${highlight ? 'text-indigo-600' : 'text-slate-500'}`}>
      {icon}
    </div>
    <div className="font-bold text-slate-900 text-sm mb-1">{name}</div>
    <div className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{tech}</div>
  </div>
);

type Tab = 'OVERVIEW' | 'BACKEND_CLUSTER' | 'DATABASE' | 'BOOKING_FLOW' | 'SECURITY' | 'DEVOPS';

export const ArchitecturePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('oneyatra_arch_banner_dismissed');
    if (dismissed === 'true') {
      setShowBanner(false);
    }
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('oneyatra_arch_banner_dismissed', 'true');
  };

  const simulatePush = () => {
      addNotification("System Alert", "This is a test push notification triggered from the architecture console.", "ALERT");
  };

  const tabClass = (tab: Tab) => 
    `px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
      activeTab === tab 
        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
    }`;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Educational Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 py-3 relative">
          <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 pr-8">
            <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 shrink-0 mt-0.5 sm:mt-0">
              <Lightbulb className="h-4 w-4" />
            </div>
            <p className="text-sm text-blue-900">
              <span className="font-bold">🎓 Educational Architecture:</span> This page demonstrates enterprise-grade system design principles (Microservices, Saga Pattern, K8s). The actual implementation running in this browser is a simplified MVP for demonstration purposes.
            </p>
          </div>
          <button 
            onClick={dismissBanner}
            className="absolute top-3 right-4 text-blue-400 hover:text-blue-600 p-1 hover:bg-blue-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">System Architecture</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-6">
            A scalable, event-driven microservices architecture designed for high availability and real-time MaaS aggregation.
          </p>
          
          <button 
            onClick={simulatePush}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <BellRing className="h-4 w-4" /> Test Push Notification
          </button>

          {/* Tab Navigation */}
          <div className="flex justify-center mt-8 gap-2 sm:gap-4 overflow-x-auto pb-4 sm:pb-0 px-4">
            <button onClick={() => setActiveTab('OVERVIEW')} className={tabClass('OVERVIEW')}>
              Overview
            </button>
            <button onClick={() => setActiveTab('BACKEND_CLUSTER')} className={tabClass('BACKEND_CLUSTER')}>
              Backend
            </button>
            <button onClick={() => setActiveTab('DATABASE')} className={tabClass('DATABASE')}>
              Database
            </button>
            <button onClick={() => setActiveTab('BOOKING_FLOW')} className={tabClass('BOOKING_FLOW')}>
              Booking
            </button>
            <button onClick={() => setActiveTab('SECURITY')} className={tabClass('SECURITY')}>
              Security
            </button>
            <button onClick={() => setActiveTab('DEVOPS')} className={tabClass('DEVOPS')}>
              DevOps & Cloud
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        {/* OVERVIEW TAB CONTENT */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* High Level Diagram */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Layers className="mr-2 h-6 w-6 text-brand-600" />
                High-Level Architecture
              </h2>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                {/* Client Layer */}
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-200 w-full md:w-48 text-center z-10">
                  <div className="flex gap-2 mb-2">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                    <Globe className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Clients</h3>
                  <p className="text-xs text-gray-500">Next.js Web<br/>React Native Mobile</p>
                </div>

                <div className="hidden md:block h-0.5 bg-gray-300 w-16 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-white px-1 text-gray-500">HTTPS</div>
                </div>

                {/* Gateway Layer */}
                <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200 w-full md:w-56 text-center z-10">
                  <Server className="h-8 w-8 text-indigo-600 mb-2" />
                  <h3 className="font-bold text-gray-900">API Gateway</h3>
                  <p className="text-xs text-indigo-800">NestJS + Kong</p>
                </div>

                <div className="hidden md:block h-0.5 bg-gray-300 w-16 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-white px-1 text-gray-500">gRPC</div>
                </div>

                {/* Microservices Cluster */}
                <div className="flex-1 w-full bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 relative">
                  <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Backend Cluster
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <ServiceBox icon={<Shield className="h-5 w-5" />} name="Auth Service" tech="JWT / OAuth2" />
                    <ServiceBox icon={<Box className="h-5 w-5" />} name="Search Core" tech="Gemini AI" highlight />
                    <ServiceBox icon={<CreditCard className="h-5 w-5" />} name="Booking" tech="Saga Pattern" />
                    <ServiceBox icon={<MessageSquare className="h-5 w-5" />} name="Notification" tech="Twilio/FCM" />
                    <ServiceBox icon={<Cpu className="h-5 w-5" />} name="Adapter" tech="Aggregator" />
                    <ServiceBox icon={<GitBranch className="h-5 w-5" />} name="Deep Link" tech="Dyn Links" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Engine & AI Section */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator className="h-64 w-64 text-brand-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center relative z-10">
                <TrendingUp className="mr-2 h-6 w-6 text-brand-600" />
                AI Pricing & ETA Engine
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-4">
                   <h3 className="font-bold text-gray-800 flex items-center">
                     <Calculator className="h-5 w-5 mr-2 text-blue-500" /> 
                     Price Estimation Algorithm
                   </h3>
                   <div className="bg-slate-800 text-slate-300 p-4 rounded-lg text-xs font-mono leading-relaxed">
                     <span className="text-purple-400">const</span> estimate = (km, min) =&gt; {'{'}<br/>
                     &nbsp;&nbsp;<span className="text-purple-400">const</span> rates = DB.getRate(city);<br/>
                     &nbsp;&nbsp;<span className="text-purple-400">const</span> surge = AI.predict(time);<br/>
                     &nbsp;&nbsp;<span className="text-purple-400">return</span> (base + km*rate) * surge;<br/>
                     {'}'}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="font-bold text-gray-800 flex items-center">
                     <Database className="h-5 w-5 mr-2 text-green-500" /> 
                     Data Model
                   </h3>
                   <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
                     <table className="w-full text-left">
                       <thead className="bg-gray-50 text-gray-500">
                         <tr><th className="p-2">City</th><th className="p-2">Base</th><th className="p-2">Surge</th></tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         <tr><td className="p-2">Delhi</td><td className="p-2">₹50</td><td className="p-2 text-red-500">2.5x</td></tr>
                         <tr><td className="p-2">Mumbai</td><td className="p-2">₹40</td><td className="p-2 text-red-500">3.0x</td></tr>
                       </tbody>
                     </table>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="font-bold text-gray-800 flex items-center">
                     <Map className="h-5 w-5 mr-2 text-orange-500" /> 
                     Smart ETA
                   </h3>
                   <p className="text-sm text-gray-600">
                     Real-time traffic multiplier derived from Google Maps Directions API latency stats and historical ML models.
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BACKEND CLUSTER TAB CONTENT */}
        {activeTab === 'BACKEND_CLUSTER' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Services Breakdown */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <LayoutGrid className="mr-2 h-6 w-6 text-brand-600" />
                Backend Microservices Design (NestJS)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Search Service */}
                 <div className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg"><Search className="h-5 w-5 text-blue-600"/></div>
                        <h3 className="font-bold text-gray-900">Search Service</h3>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-2">
                        <li>• <strong>Tech:</strong> NestJS + RxJS + gRPC Client</li>
                        <li>• <strong>Role:</strong> Orchestrator. Broadcasts requests to adapters.</li>
                        <li>• <strong>Resilience:</strong> Circuit Breaker (Opossum) for failing providers.</li>
                    </ul>
                 </div>

                 {/* Auth Service */}
                 <div className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 p-2 rounded-lg"><Shield className="h-5 w-5 text-purple-600"/></div>
                        <h3 className="font-bold text-gray-900">Auth Service</h3>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-2">
                        <li>• <strong>Tech:</strong> NestJS + Passport + JWT</li>
                        <li>• <strong>Role:</strong> OAuth2 (Google/Apple), Profile Mgmt.</li>
                        <li>• <strong>DB:</strong> PostgreSQL (Users, Roles).</li>
                    </ul>
                 </div>

                 {/* Pricing Engine */}
                 <div className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 p-2 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600"/></div>
                        <h3 className="font-bold text-gray-900">Pricing Engine</h3>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-2">
                        <li>• <strong>Tech:</strong> NestJS (Node) wrapper for AI Model</li>
                        <li>• <strong>Role:</strong> Calculates Dynamic Surge & ETA.</li>
                        <li>• <strong>Input:</strong> Traffic stats, demand vectors.</li>
                    </ul>
                 </div>

                 {/* Provider Adapters */}
                 <div className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 transition-colors lg:col-span-3 bg-slate-50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-orange-100 p-2 rounded-lg"><Cpu className="h-5 w-5 text-orange-600"/></div>
                        <h3 className="font-bold text-gray-900">Provider Adapters (Anti-Corruption Layer)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                       <div className="bg-white p-3 rounded border border-gray-200 text-xs">
                          <strong>Uber Adapter</strong><br/>Translates OneYatra Schema &harr; Uber API
                       </div>
                       <div className="bg-white p-3 rounded border border-gray-200 text-xs">
                          <strong>IRCTC Adapter</strong><br/>Handles SOAP/XML &harr; JSON conversion
                       </div>
                       <div className="bg-white p-3 rounded border border-gray-200 text-xs">
                          <strong>Flight Adapter</strong><br/>Aggregates GDS / Skyscanner API
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* 2. API Routing & Gateway */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Network className="mr-2 h-5 w-5 text-indigo-600" />
                    API Gateway Routing Plan
                  </h2>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Service</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        <tr>
                          <td className="px-4 py-3 font-mono text-indigo-600">GET /api/v1/search</td>
                          <td className="px-4 py-3">Search Service</td>
                          <td className="px-4 py-3 text-gray-500">Rate Limit: 10/min</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-indigo-600">POST /api/v1/auth/*</td>
                          <td className="px-4 py-3">Auth Service</td>
                          <td className="px-4 py-3 text-gray-500">Public / Whitelisted</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-indigo-600">POST /api/v1/book</td>
                          <td className="px-4 py-3">Booking Service</td>
                          <td className="px-4 py-3 text-gray-500">JWT Required</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-indigo-600">GET /api/v1/tracking</td>
                          <td className="px-4 py-3">Analytics Service</td>
                          <td className="px-4 py-3 text-gray-500">Fire & Forget</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
               </div>

               {/* Communication Flow */}
               <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-green-600" />
                    Communication Flow
                  </h2>
                  <div className="space-y-6">
                     <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mt-0.5">1</div>
                        <div className="ml-4">
                           <h4 className="text-sm font-bold text-gray-900">Synchronous (Critical Path)</h4>
                           <p className="text-xs text-gray-500 mt-1">
                              <strong>Gateway &rarr; Search &rarr; Adapters</strong><br/>
                              Uses <span className="text-blue-600 font-mono">gRPC (Protobuf)</span> for low-latency internal communication. 
                              Ensures type safety between services.
                           </p>
                        </div>
                     </div>
                     <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs mt-0.5">2</div>
                        <div className="ml-4">
                           <h4 className="text-sm font-bold text-gray-900">Asynchronous (Event Driven)</h4>
                           <p className="text-xs text-gray-500 mt-1">
                              <strong>Booking &rarr; Notification / Analytics</strong><br/>
                              Uses <span className="text-orange-600 font-mono">RabbitMQ / Kafka</span>. 
                              Example: <code>BOOKING_CONFIRMED</code> event triggers Email, SMS, and Update Cache.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 3. Resilience & Error Handling */}
            <div className="bg-slate-900 rounded-xl shadow-xl p-8 text-white">
               <h2 className="text-xl font-bold mb-6 flex items-center">
                 <AlertTriangle className="mr-2 h-5 w-5 text-yellow-400" />
                 Resilience & Error Handling
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800 p-4 rounded-lg">
                     <h3 className="font-bold text-sm mb-2 text-yellow-400">Circuit Breaker</h3>
                     <p className="text-xs text-slate-400 leading-relaxed">
                        Implemented in <strong>Search Service</strong>. If <code>Uber Adapter</code> fails 5 times consecutively, the circuit opens for 30s, returning fallback results immediately to prevent cascading failures.
                     </p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                     <h3 className="font-bold text-sm mb-2 text-yellow-400">Bulkhead Pattern</h3>
                     <p className="text-xs text-slate-400 leading-relaxed">
                        Connection pools for <strong>PostgreSQL</strong> and <strong>Redis</strong> are isolated. High load on Analytics won't impact critical Booking transactions.
                     </p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                     <h3 className="font-bold text-sm mb-2 text-yellow-400">Graceful Degradation</h3>
                     <p className="text-xs text-slate-400 leading-relaxed">
                        If <strong>Pricing Engine</strong> is slow/down, the system falls back to "Cached Static Rates" from the database instead of failing the search request.
                     </p>
                  </div>
               </div>
            </div>

          </div>
        )}

        {/* DATABASE TAB CONTENT */}
        {activeTab === 'DATABASE' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* 1. Database Overview */}
             <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
                 <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                   <HardDrive className="mr-2 h-6 w-6 text-brand-600" />
                   Database Design (PostgreSQL)
                 </h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Schema Visualization */}
                     <div>
                        <h4 className="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center"><Code className="w-4 h-4 mr-1"/> Schema DDL</h4>
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-700 h-[500px] overflow-y-auto custom-scrollbar">
                           <pre className="text-[10px] leading-relaxed font-mono text-blue-300">
                             {sqlSchema}
                           </pre>
                        </div>
                     </div>

                     <div className="space-y-6">
                        {/* Partitioning Strategy */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-blue-900 uppercase mb-3 flex items-center">
                                <Layers className="w-4 h-4 mr-1"/> Partitioning Strategy
                            </h4>
                            <div className="space-y-3">
                                {partitioningStrategy.map((p, i) => (
                                    <div key={i} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                        <div className="font-mono text-xs font-bold text-blue-700 mb-1">{p.table}</div>
                                        <div className="text-xs text-gray-600 mb-1">Method: {p.method}</div>
                                        <div className="text-[10px] text-gray-400 italic">"{p.reason}"</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Caching Strategy */}
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-orange-900 uppercase mb-3 flex items-center">
                                <Zap className="w-4 h-4 mr-1"/> Redis Caching Layer
                            </h4>
                            <div className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm text-xs space-y-2">
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                   <span className="font-bold text-gray-700">L1 Cache</span>
                                   <span className="text-gray-500">{cachingStrategy.l1}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                   <span className="font-bold text-gray-700">L2 Cache</span>
                                   <span className="text-gray-500">{cachingStrategy.l2}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="block font-bold text-gray-700 mb-2">Key Patterns:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {cachingStrategy.keys.map(k => (
                                            <span key={k} className="bg-orange-100 text-orange-700 font-mono px-2 py-1 rounded text-[10px]">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                 </div>
             </div>
          </div>
        )}

        {/* BOOKING FLOW TAB */}
        {activeTab === 'BOOKING_FLOW' && (
           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Saga Pattern */}
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
                 <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                   <Repeat className="mr-2 h-6 w-6 text-brand-600" />
                   Booking Saga Pattern (Distributed Transactions)
                 </h2>
                 <p className="text-gray-600 text-sm mb-6 max-w-2xl">
                    Because payments and provider bookings happen in different systems, we use a 
                    <strong> Saga Pattern</strong> with compensating transactions (Auto-Refund) to ensure data consistency.
                 </p>
                 
                 <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-dashed border-gray-300 rounded-xl bg-slate-50">
                    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 z-10 w-48">
                       <CreditCard className="h-6 w-6 text-blue-600 mb-2" />
                       <div className="font-bold text-sm">Payment Service</div>
                       <div className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded mt-2">1. Charge Card (+₹)</div>
                    </div>

                    <div className="hidden md:flex h-0.5 bg-gray-300 w-full relative">
                       <ArrowRight className="absolute right-0 -top-2 text-gray-300" />
                    </div>

                    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 z-10 w-48">
                       <ShoppingCart className="h-6 w-6 text-orange-600 mb-2" />
                       <div className="font-bold text-sm">Provider API</div>
                       <div className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded mt-2">2. Booking Fails (X)</div>
                    </div>

                    <div className="hidden md:flex h-0.5 bg-red-200 w-full relative">
                        <div className="absolute top-2 w-full text-center text-[10px] text-red-500 font-bold">Compensate</div>
                        <ArrowRight className="absolute left-0 -top-2 rotate-180 text-red-300" />
                    </div>

                    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 z-10 w-48 border-l-4 border-l-green-500">
                       <RefreshCw className="h-6 w-6 text-green-600 mb-2" />
                       <div className="font-bold text-sm">Refund Service</div>
                       <div className="text-[10px] text-gray-500 mt-2">3. Auto Refund (-₹)</div>
                    </div>
                 </div>
              </div>

              {/* Affiliate Model */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-slate-900 text-white rounded-xl shadow-xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                       <DollarSign className="mr-2 h-6 w-6 text-yellow-400" />
                       Affiliate Monetization Model
                    </h2>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                          <div>
                             <div className="font-bold text-sm text-yellow-400">Deep Link Click (CPA)</div>
                             <div className="text-xs text-slate-400">Uber / Ola / Rapido</div>
                          </div>
                          <div className="text-right">
                             <div className="font-mono text-lg font-bold">₹15</div>
                             <div className="text-[10px] text-slate-500">per new user</div>
                          </div>
                       </div>

                       <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                          <div>
                             <div className="font-bold text-sm text-yellow-400">Booking Commission (CPS)</div>
                             <div className="text-xs text-slate-400">Bus (RedBus)</div>
                          </div>
                          <div className="text-right">
                             <div className="font-mono text-lg font-bold">5.0%</div>
                             <div className="text-[10px] text-slate-500">of ticket value</div>
                          </div>
                       </div>

                       <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                          <div>
                             <div className="font-bold text-sm text-yellow-400">Booking Commission (CPS)</div>
                             <div className="text-xs text-slate-400">Flight (IndiGo)</div>
                          </div>
                          <div className="text-right">
                             <div className="font-mono text-lg font-bold">2.5%</div>
                             <div className="text-[10px] text-slate-500">of base fare</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                       <LinkIcon className="mr-2 h-5 w-5 text-blue-600" />
                       Deep Link Tracking Logic
                    </h2>
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                       <div className="ml-6 relative">
                          <span className="absolute -left-[31px] bg-blue-500 h-4 w-4 rounded-full border-2 border-white"></span>
                          <h4 className="font-bold text-gray-900 text-sm">1. User Clicks "Book Now"</h4>
                          <p className="text-xs text-gray-500 mt-1">
                             App generates a unique <code>click_id</code> and appends it to the provider URL.
                          </p>
                          <code className="block bg-gray-50 p-2 mt-2 rounded text-[10px] text-blue-600">
                             uber.com/?click_id=xyz_123&source=oneyatra
                          </code>
                       </div>

                       <div className="ml-6 relative">
                          <span className="absolute -left-[31px] bg-gray-300 h-4 w-4 rounded-full border-2 border-white"></span>
                          <h4 className="font-bold text-gray-900 text-sm">2. User Completes Ride</h4>
                          <p className="text-xs text-gray-500 mt-1">
                             Provider attributes the conversion to the <code>click_id</code> via cookie or device fingerprint.
                          </p>
                       </div>

                       <div className="ml-6 relative">
                          <span className="absolute -left-[31px] bg-green-500 h-4 w-4 rounded-full border-2 border-white"></span>
                          <h4 className="font-bold text-gray-900 text-sm">3. Postback Webhook</h4>
                          <p className="text-xs text-gray-500 mt-1">
                             Provider server calls OneYatra server to confirm conversion.
                          </p>
                          <code className="block bg-gray-50 p-2 mt-2 rounded text-[10px] text-green-600">
                             POST /api/v1/postback?click_id=xyz_123&status=converted
                          </code>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'SECURITY' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Infrastructure Security Layering */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6 text-brand-600" />
                Infrastructure Security Layers
              </h2>
              
              <div className="flex flex-col lg:flex-row gap-6">
                {securityArchitecture.layers.map((layer, idx) => (
                  <div key={idx} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
                    <div className="absolute -top-3 left-4 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Layer {idx + 1}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 mt-2">{layer.name}</h3>
                    <div className="text-xs font-mono text-brand-600 mb-2 bg-brand-50 inline-block px-2 py-1 rounded">
                      {layer.tech}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {layer.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Encryption & Data Protection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 text-white rounded-xl shadow-xl p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Lock className="mr-2 h-6 w-6 text-green-400" />
                  Encryption Standards
                </h2>
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                     <div className="bg-slate-800 p-2 rounded-lg"><Network className="h-5 w-5 text-blue-400"/></div>
                     <div>
                       <h4 className="font-bold text-sm text-gray-200">Data in Transit</h4>
                       <p className="text-xs text-gray-400 mt-1">{encryptionStandards.transit}</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-4">
                     <div className="bg-slate-800 p-2 rounded-lg"><HardDrive className="h-5 w-5 text-orange-400"/></div>
                     <div>
                       <h4 className="font-bold text-sm text-gray-200">Data at Rest</h4>
                       <p className="text-xs text-gray-400 mt-1">{encryptionStandards.rest}</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-4">
                     <div className="bg-slate-800 p-2 rounded-lg"><Key className="h-5 w-5 text-yellow-400"/></div>
                     <div>
                       <h4 className="font-bold text-sm text-gray-200">Key Management</h4>
                       <p className="text-xs text-gray-400 mt-1">{encryptionStandards.keys}</p>
                     </div>
                   </div>
                </div>
              </div>

              {/* Data Privacy Flow */}
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
                 <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                   <Eye className="mr-2 h-6 w-6 text-purple-600" />
                   Data Privacy (DPDP Act 2023)
                 </h2>
                 <div className="relative border-l-2 border-purple-100 ml-3 space-y-8">
                    <div className="ml-6 relative">
                       <span className="absolute -left-[31px] bg-purple-500 h-4 w-4 rounded-full border-2 border-white"></span>
                       <h4 className="font-bold text-gray-900 text-sm">1. Explicit Consent</h4>
                       <p className="text-xs text-gray-500 mt-1">
                          User sees a clear prompt: "Allow OneYatra to process Location for Route Planning?".
                       </p>
                    </div>
                    <div className="ml-6 relative">
                       <span className="absolute -left-[31px] bg-purple-500 h-4 w-4 rounded-full border-2 border-white"></span>
                       <h4 className="font-bold text-gray-900 text-sm">2. Purpose Limitation</h4>
                       <p className="text-xs text-gray-500 mt-1">
                          Data is used <strong>only</strong> for the booking. Marketing access requires separate opt-in.
                       </p>
                    </div>
                    <div className="ml-6 relative">
                       <span className="absolute -left-[31px] bg-purple-500 h-4 w-4 rounded-full border-2 border-white"></span>
                       <h4 className="font-bold text-gray-900 text-sm">3. Data Localization</h4>
                       <p className="text-xs text-gray-500 mt-1">
                          All sensitive PII (Passport, Phone) is stored exclusively in <strong>Mumbai (ap-south-1)</strong>.
                       </p>
                    </div>
                 </div>
              </div>
            </div>

            {/* 3. Compliance Checklist */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                 <FileKey className="mr-2 h-6 w-6 text-brand-600" />
                 Regulatory Compliance Checklist
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {complianceChecklist.map((section, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                       <h3 className="font-bold text-sm text-gray-900 mb-4 pb-2 border-b border-gray-200">
                         {section.category}
                       </h3>
                       <ul className="space-y-3">
                         {section.items.map((item: any) => (
                           <li key={item.id} className="flex items-start gap-2 text-xs text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <span>{item.text}</span>
                                <div className="text-[10px] text-green-600 font-medium mt-0.5 bg-green-50 inline-block px-1.5 rounded">
                                  {item.status}
                                </div>
                              </div>
                           </li>
                         ))}
                       </ul>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        )}

        {/* DEVOPS TAB */}
        {activeTab === 'DEVOPS' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* 1. CI/CD Pipeline */}
             <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                 <GitBranch className="mr-2 h-6 w-6 text-brand-600" />
                 CI/CD Pipeline Architecture
               </h2>
               <div className="relative">
                 {/* Connection Line */}
                 <div className="absolute top-8 left-0 w-full h-1 bg-gray-100 -z-10 hidden lg:block"></div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                   {cicdPipeline.map((step, idx) => (
                     <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center relative hover:border-brand-300 transition-colors group">
                       <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 group-hover:bg-brand-50 group-hover:border-brand-200 transition-colors">
                          {idx === 0 && <GitBranch className="h-6 w-6 text-gray-700" />}
                          {idx === 1 && <Package className="h-6 w-6 text-blue-600" />}
                          {idx === 2 && <ShieldCheck className="h-6 w-6 text-green-600" />}
                          {idx === 3 && <RefreshCw className="h-6 w-6 text-orange-600" />}
                          {idx === 4 && <CheckCircle className="h-6 w-6 text-purple-600" />}
                          {idx === 5 && <Globe className="h-6 w-6 text-indigo-600" />}
                       </div>
                       <h3 className="font-bold text-gray-900 text-sm">{step.stage}</h3>
                       <div className="text-[10px] font-mono text-brand-600 bg-brand-50 px-2 py-0.5 rounded my-1">{step.tool}</div>
                       <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             {/* 2. Kubernetes Cluster */}
             <div className="bg-slate-900 text-white rounded-xl shadow-xl p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Cloud className="w-96 h-96" />
               </div>
               
               <h2 className="text-2xl font-bold mb-8 flex items-center relative z-10">
                 <Cloud className="mr-2 h-6 w-6 text-blue-400" />
                 Cloud-Native Cluster (AWS EKS)
               </h2>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                  {/* Control Plane */}
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                     <h3 className="font-bold text-lg text-blue-300 mb-4 flex items-center">
                        <Radio className="w-5 h-5 mr-2"/> Ingress & Traffic
                     </h3>
                     <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                           <div className="text-xs text-gray-400">Load Balancer</div>
                           <div className="font-mono text-sm">{k8sArchitecture.ingress}</div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                           <div className="text-xs text-gray-400">Service Mesh</div>
                           <div className="font-mono text-sm">{k8sArchitecture.mesh}</div>
                        </div>
                     </div>
                  </div>

                  {/* Node Pools */}
                  <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                     <h3 className="font-bold text-lg text-green-300 mb-4 flex items-center">
                        <Server className="w-5 h-5 mr-2"/> Compute Node Pools
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {k8sArchitecture.nodes.map((node, i) => (
                           <div key={i} className="bg-slate-800 p-4 rounded-lg border border-slate-600 relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-green-600 text-[10px] font-bold px-2 py-0.5 rounded-bl">
                                 {node.count} Nodes
                              </div>
                              <h4 className="font-bold text-sm text-gray-100 mb-1">{node.name}</h4>
                              <div className="text-xs text-green-400 font-mono mb-2">{node.type}</div>
                              <p className="text-[10px] text-gray-400 leading-tight">{node.purpose}</p>
                           </div>
                        ))}
                     </div>
                     
                     <div className="mt-6 pt-6 border-t border-slate-700">
                        <h4 className="font-bold text-sm text-orange-300 mb-3 flex items-center">
                           <TrendingUp className="w-4 h-4 mr-2"/> Auto-Scaling Policies
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="bg-orange-900/20 p-3 rounded border border-orange-900/50">
                              <div className="text-xs font-bold text-orange-200">Horizontal (HPA)</div>
                              <div className="text-[10px] text-orange-100/70 mt-1">{k8sArchitecture.scaling.hpa}</div>
                           </div>
                           <div className="bg-orange-900/20 p-3 rounded border border-orange-900/50">
                              <div className="text-xs font-bold text-orange-200">Cluster (CA)</div>
                              <div className="text-[10px] text-orange-100/70 mt-1">{k8sArchitecture.scaling.ca}</div>
                           </div>
                           <div className="bg-orange-900/20 p-3 rounded border border-orange-900/50">
                              <div className="text-xs font-bold text-orange-200">Event Driven (KEDA)</div>
                              <div className="text-[10px] text-orange-100/70 mt-1">{k8sArchitecture.scaling.keda}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             </div>

             {/* 3. Monitoring Stack */}
             <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                   <Activity className="mr-2 h-6 w-6 text-brand-600" />
                   Observability & Monitoring
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                   {monitoringStack.map((item, idx) => (
                      <div key={idx} className={`${item.bg} p-4 rounded-xl border border-transparent hover:border-gray-200 transition-all`}>
                         <div className={`${item.color} mb-3`}>
                            {item.name === 'Prometheus' && <Terminal className="h-6 w-6" />}
                            {item.name === 'Grafana' && <BarChart3 className="h-6 w-6" />}
                            {item.name === 'ELK Stack' && <FileText className="h-6 w-6" />}
                            {item.name === 'Jaeger' && <Network className="h-6 w-6" />}
                            {item.name === 'PagerDuty' && <AlertTriangle className="h-6 w-6" />}
                         </div>
                         <h3 className={`font-bold text-sm ${item.color}`}>{item.name}</h3>
                         <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{item.type}</div>
                         <p className="text-xs text-gray-600 leading-snug">{item.desc}</p>
                      </div>
                   ))}
                </div>
             </div>

          </div>
        )}

      </div>
    </div>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, MessageSquare, Plus, Search, ChevronDown, ChevronRight, Send, Paperclip, AlertTriangle, CheckCircle, Clock, X, User, Headphones, FileText, ChevronLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { SupportTicket, TicketMessage } from '../types';
import { FAQ_DATA, createTicket, getTickets, addMessage, escalateTicket } from '../services/supportService';

interface SupportPageProps {
  onBack: () => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'MY_TICKETS' | 'NEW_TICKET'>('HOME');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Create Ticket State
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('BOOKING');
  const [newDescription, setNewDescription] = useState('');
  const [newAttachment, setNewAttachment] = useState<string | null>(null); // Simulate 1 attachment

  // FAQ State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
        scrollToBottom();
    }
  }, [selectedTicket?.messages]);

  const refreshTickets = () => {
    setTickets(getTickets());
  };

  const scrollToBottom = () => {
    setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newDescription) return;
    
    const attachments = newAttachment ? [newAttachment] : [];
    const t = createTicket(newCategory, newSubject, newDescription, attachments);
    
    setNewSubject('');
    setNewDescription('');
    setNewAttachment(null);
    refreshTickets();
    setActiveTab('MY_TICKETS');
    // Open the newly created ticket
    setSelectedTicket(t);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicket) return;
    
    addMessage(selectedTicket.id, 'USER', chatInput);
    setChatInput('');
    
    // Optimistic update
    const updated = getTickets().find(t => t.id === selectedTicket.id);
    if(updated) setSelectedTicket(updated);
    refreshTickets(); // Background sync
  };

  // Poll for agent replies when a ticket is open
  useEffect(() => {
      let interval: any;
      if (selectedTicket) {
          interval = setInterval(() => {
              const updatedList = getTickets();
              const current = updatedList.find(t => t.id === selectedTicket.id);
              if (current && current.messages.length !== selectedTicket.messages.length) {
                  setSelectedTicket(current);
              }
          }, 2000);
      }
      return () => clearInterval(interval);
  }, [selectedTicket]);

  const handleEscalate = () => {
      if(!selectedTicket) return;
      if(window.confirm("Escalate this ticket to a senior agent? This is for urgent issues only.")) {
          escalateTicket(selectedTicket.id);
          const updated = getTickets().find(t => t.id === selectedTicket.id);
          if(updated) setSelectedTicket(updated);
      }
  };

  const handleFileAttach = () => {
      // Mock file upload
      const mockUrl = "https://via.placeholder.com/150?text=Screenshot";
      setNewAttachment(mockUrl);
      alert("Mock screenshot attached!");
  };

  // --- SUB-COMPONENTS ---

  const renderFaq = () => {
    const filteredFaqs = FAQ_DATA.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search for help..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
            </div>

            {filteredFaqs.map((cat, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-bold text-gray-700 text-sm">
                        {cat.category}
                    </div>
                    <div>
                        {cat.items.map((item, i) => {
                            const isOpen = expandedFaq === `${idx}-${i}`;
                            return (
                                <div key={i} className="border-b border-gray-100 last:border-0">
                                    <button 
                                        onClick={() => setExpandedFaq(isOpen ? null : `${idx}-${i}`)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-800 text-sm">{item.q}</span>
                                        {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400"/> : <ChevronRight className="h-4 w-4 text-gray-400"/>}
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 pb-4 text-sm text-gray-600 animate-in slide-in-from-top-1 bg-gray-50/50">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
  };

  const renderTicketList = () => (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {tickets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No tickets found.</p>
                  <Button size="sm" className="mt-4" onClick={() => setActiveTab('NEW_TICKET')}>Create Ticket</Button>
              </div>
          ) : (
              tickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-brand-300 cursor-pointer transition-all shadow-sm group"
                  >
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <div className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">{ticket.subject}</div>
                              <div className="text-xs text-gray-500">#{ticket.id} • {new Date(ticket.lastUpdated).toLocaleDateString()}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                              ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                          }`}>
                              {ticket.status.replace('_', ' ')}
                          </div>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{ticket.category}</span>
                          {ticket.priority === 'HIGH' && <span className="text-[10px] text-red-600 font-bold flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> High Priority</span>}
                      </div>
                  </div>
              ))
          )}
      </div>
  );

  const renderTicketDetail = () => {
      if (!selectedTicket) return null;

      return (
          <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-200 rounded-full md:hidden">
                          <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{selectedTicket.subject}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>#{selectedTicket.id}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className={selectedTicket.status === 'RESOLVED' ? 'text-green-600 font-bold' : 'text-blue-600 font-bold'}>
                                  {selectedTicket.status.replace('_', ' ')}
                              </span>
                          </div>
                      </div>
                  </div>
                  {selectedTicket.status !== 'RESOLVED' && (
                      <button 
                        onClick={handleEscalate} 
                        className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                        disabled={selectedTicket.priority === 'HIGH'}
                      >
                          {selectedTicket.priority === 'HIGH' ? 'Escalated' : 'Escalate'}
                      </button>
                  )}
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
                  {selectedTicket.messages.map((msg, i) => {
                      const isMe = msg.sender === 'USER';
                      const isSystem = msg.sender === 'SYSTEM';
                      
                      if (isSystem) {
                          return (
                              <div key={msg.id} className="flex justify-center my-4">
                                  <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">
                                      {msg.text}
                                  </span>
                              </div>
                          );
                      }

                      return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] md:max-w-[70%] rounded-xl p-3 shadow-sm ${
                                  isMe ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                              }`}>
                                  {!isMe && <div className="text-[10px] font-bold mb-1 opacity-70">Support Agent</div>}
                                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                  {msg.attachments && msg.attachments.length > 0 && (
                                      <div className="mt-2">
                                          {msg.attachments.map((att, idx) => (
                                              <img key={idx} src={att} alt="attachment" className="h-20 w-20 object-cover rounded border-2 border-white/20" />
                                          ))}
                                      </div>
                                  )}
                                  <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
                  <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                      <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                          <Paperclip className="h-5 w-5" />
                      </button>
                      <input 
                          type="text" 
                          value={chatInput} 
                          onChange={e => setChatInput(e.target.value)}
                          placeholder="Type your message..." 
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                          disabled={selectedTicket.status === 'RESOLVED'}
                      />
                      <button 
                        type="submit" 
                        disabled={!chatInput.trim() || selectedTicket.status === 'RESOLVED'}
                        className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                          <Send className="h-4 w-4" />
                      </button>
                  </form>
                  {selectedTicket.status === 'RESOLVED' && (
                      <div className="text-center text-xs text-green-600 font-bold mt-2 flex justify-center items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> This ticket is marked as resolved.
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderNewTicketForm = () => (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-2 max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Create New Ticket</h2>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Issue Category</label>
                  <div className="grid grid-cols-2 gap-2">
                      {['BOOKING', 'PAYMENT', 'REFUND', 'TECHNICAL', 'OTHER'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewCategory(cat as any)}
                            className={`py-2 text-xs font-bold rounded border transition-colors ${
                                newCategory === cat ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>
              
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Brief summary of the issue"
                    required
                  />
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                  <textarea 
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-32 resize-none"
                    placeholder="Please describe your issue in detail..."
                    required
                  />
              </div>

              <div>
                  <button 
                    type="button" 
                    onClick={handleFileAttach}
                    className={`text-xs flex items-center gap-1 font-bold ${newAttachment ? 'text-green-600' : 'text-brand-600 hover:text-brand-700'}`}
                  >
                      {newAttachment ? <><CheckCircle className="h-3 w-3"/> Screenshot Attached</> : <><Paperclip className="h-3 w-3"/> Attach Screenshot</>}
                  </button>
              </div>

              <div className="pt-2">
                  <Button type="submit" className="w-full">Submit Ticket</Button>
              </div>
          </form>
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 min-h-screen">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        </div>
        <div className="hidden md:flex gap-3">
            <Button variant="outline" size="sm" onClick={() => alert("Connecting to Live Agent...")}>
                <Headphones className="h-4 w-4 mr-2" /> Live Chat
            </Button>
            <Button size="sm" onClick={() => {setActiveTab('NEW_TICKET'); setSelectedTicket(null);}}>
                <Plus className="h-4 w-4 mr-2" /> New Ticket
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar / Tabs */}
          <div className={`w-full md:w-64 shrink-0 space-y-2 ${selectedTicket ? 'hidden md:block' : 'block'}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                  <button 
                    onClick={() => {setActiveTab('HOME'); setSelectedTicket(null);}}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'HOME' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                      <HelpCircle className="h-4 w-4" /> FAQs
                  </button>
                  <button 
                    onClick={() => {setActiveTab('MY_TICKETS'); setSelectedTicket(null);}}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'MY_TICKETS' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                      <FileText className="h-4 w-4" /> My Tickets
                      {tickets.filter(t => t.status !== 'RESOLVED').length > 0 && (
                          <span className="ml-auto bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">
                              {tickets.filter(t => t.status !== 'RESOLVED').length}
                          </span>
                      )}
                  </button>
                  <button 
                    onClick={() => {setActiveTab('NEW_TICKET'); setSelectedTicket(null);}}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-colors ${activeTab === 'NEW_TICKET' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                      <Plus className="h-4 w-4" /> Create Ticket
                  </button>
              </div>

              {/* Quick Contact Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="font-bold text-sm mb-2 flex items-center"><Headphones className="h-4 w-4 mr-2"/> Need urgent help?</h3>
                  <p className="text-xs text-slate-300 mb-4">Our support team is available 24/7 for emergency booking issues.</p>
                  <button onClick={() => alert("Calling +91 1800-ONE-YATRA...")} className="w-full bg-white/10 hover:bg-white/20 transition-colors py-2 rounded-lg text-xs font-bold border border-white/20">
                      Call Support
                  </button>
              </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-[500px]">
              {selectedTicket ? (
                  renderTicketDetail()
              ) : (
                  <>
                      {activeTab === 'HOME' && renderFaq()}
                      {activeTab === 'MY_TICKETS' && renderTicketList()}
                      {activeTab === 'NEW_TICKET' && renderNewTicketForm()}
                  </>
              )}
          </div>
      </div>

      {/* Mobile Floating Action Button for Chat */}
      {!selectedTicket && (
          <button 
            onClick={() => alert("Connecting to Live Agent...")}
            className="md:hidden fixed bottom-6 right-6 h-14 w-14 bg-brand-600 rounded-full shadow-xl flex items-center justify-center text-white z-50 hover:bg-brand-700 transition-colors"
          >
              <MessageSquare className="h-6 w-6" />
          </button>
      )}

    </div>
  );
};

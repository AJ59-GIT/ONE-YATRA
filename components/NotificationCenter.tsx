
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Ticket, Tag, AlertTriangle, User, Info, MoreHorizontal } from 'lucide-react';
import { AppNotification, NotificationType, AppView } from '../types';
import { getNotifications, getUnreadCount, markAllRead, clearNotifications } from '../services/notificationService';

interface NotificationCenterProps {
  onNavigate: (view: AppView) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'ALL' | NotificationType>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('oneyatra-notifications-updated', handleUpdate);
    return () => window.removeEventListener('oneyatra-notifications-updated', handleUpdate);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshData = () => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  const handleMarkAllRead = () => {
    const updated = markAllRead();
    setNotifications(updated);
    setUnreadCount(0);
  };

  const handleClear = () => {
    if(window.confirm("Clear all notifications?")) {
        clearNotifications();
        setNotifications([]);
        setUnreadCount(0);
    }
  };

  const handleItemClick = (notif: AppNotification) => {
    setIsOpen(false);
    if (notif.link) {
        onNavigate(notif.link);
    }
  };

  const filteredNotifications = notifications.filter(n => filter === 'ALL' || n.type === filter);

  const getIcon = (type: NotificationType) => {
    switch(type) {
        case 'BOOKING': return <Ticket className="h-4 w-4 text-blue-600" />;
        case 'OFFER': return <Tag className="h-4 w-4 text-green-600" />;
        case 'ALERT': return <AlertTriangle className="h-4 w-4 text-red-600" />;
        case 'ACCOUNT': return <User className="h-4 w-4 text-purple-600" />;
        default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch(type) {
        case 'BOOKING': return 'bg-blue-100';
        case 'OFFER': return 'bg-green-100';
        case 'ALERT': return 'bg-red-100';
        case 'ACCOUNT': return 'bg-purple-100';
        default: return 'bg-gray-100';
    }
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-brand-600 transition-colors"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
        </button>

        {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                    <div className="flex gap-3">
                        <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center" title="Mark all read">
                            <Check className="h-3 w-3 mr-1" /> Read All
                        </button>
                        <button onClick={handleClear} className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center" title="Clear all">
                            <Trash2 className="h-3 w-3 mr-1" /> Clear
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                {notifications.length > 0 && (
                    <div className="flex p-2 gap-2 overflow-x-auto border-b border-gray-100 no-scrollbar">
                        {['ALL', 'BOOKING', 'ALERT', 'OFFER'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors whitespace-nowrap ${
                                    filter === f 
                                    ? 'bg-gray-800 text-white border-gray-800' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {f.charAt(0) + f.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                )}

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No notifications yet.
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs">
                            No {filter.toLowerCase()} notifications.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredNotifications.map(notif => (
                                <div 
                                    key={notif.id}
                                    onClick={() => handleItemClick(notif)}
                                    className={`p-4 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors relative group ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getBgColor(notif.type)}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className={`text-sm font-bold truncate pr-2 ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatDate(notif.timestamp)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="absolute top-1/2 right-2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-2 border-t border-gray-100 bg-gray-50 text-center rounded-b-xl">
                    <button 
                        onClick={() => { setIsOpen(false); onNavigate('ALERTS'); }}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 w-full py-1"
                    >
                        View Real-time Alerts
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

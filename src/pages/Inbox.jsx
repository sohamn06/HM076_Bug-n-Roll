import React, { useState, useEffect } from 'react';
import { Inbox as InboxIcon, Filter, Search, Twitter, Linkedin, Instagram, Facebook, Mail, MessageCircle, Reply, AtSign, CheckCheck } from 'lucide-react';
import MessageListItem from '../components/MessageListItem';
import MessageDetail from '../components/MessageDetail';
import { mockMessages, getUnreadCount, filterMessages, getPlatformName, getMessageTypeLabel } from '../mockInboxData';

const Inbox = () => {
    const [messages, setMessages] = useState(mockMessages);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [platformFilter, setPlatformFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(getUnreadCount());

    useEffect(() => {
        updateMessages();
    }, [platformFilter, typeFilter, searchQuery]);

    const updateMessages = () => {
        let filtered = filterMessages(platformFilter, typeFilter);

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(msg =>
                msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.sender.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setMessages(filtered);
        setUnreadCount(getUnreadCount());
    };

    const handleMessageClick = (message) => {
        setSelectedMessage(message);
    };

    const handleCloseDetail = () => {
        setSelectedMessage(null);
    };

    const handleMarkAllRead = () => {
        messages.forEach(msg => {
            if (!msg.isRead) {
                msg.isRead = true;
            }
        });
        updateMessages();
    };

    const platformOptions = [
        { value: 'all', label: 'All Platforms', icon: InboxIcon },
        { value: 'twitter', label: 'Twitter', icon: Twitter },
        { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
        { value: 'instagram', label: 'Instagram', icon: Instagram },
        { value: 'facebook', label: 'Facebook', icon: Facebook },
    ];

    const typeOptions = [
        { value: 'all', label: 'All Types', icon: InboxIcon },
        { value: 'dm', label: 'Direct Messages', icon: Mail },
        { value: 'comment', label: 'Comments', icon: MessageCircle },
        { value: 'reply', label: 'Replies', icon: Reply },
        { value: 'mention', label: 'Mentions', icon: AtSign },
    ];

    return (
        <div className="h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
                            <InboxIcon size={24} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Social Inbox</h1>
                            <p className="text-gray-500 text-sm">Manage all your social media interactions in one place</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="px-4 py-2 rounded-lg bg-[#1F2937]/50 hover:bg-[#1F2937] text-white text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <CheckCheck size={16} />
                                Mark All Read
                            </button>
                        )}
                        <div className="px-4 py-2 rounded-lg bg-[#6366F1]/20 border border-[#6366F1]/30">
                            <span className="text-[#6366F1] font-semibold text-sm">
                                {unreadCount} Unread
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex gap-3 items-center bg-[#1F2937]/20 rounded-xl p-4 border border-[#1F2937]/30">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0B0C15] border border-[#1F2937] text-white placeholder-gray-600 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all text-sm"
                        />
                    </div>

                    {/* Platform Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 rounded-lg bg-[#0B0C15] border border-[#1F2937] text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all text-sm appearance-none cursor-pointer min-w-[180px]"
                        >
                            {platformOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 rounded-lg bg-[#0B0C15] border border-[#1F2937] text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all text-sm appearance-none cursor-pointer min-w-[180px]"
                        >
                            {typeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="h-[calc(100%-180px)] flex gap-4">
                {/* Message List */}
                <div className={`${selectedMessage ? 'w-1/3 hidden md:block' : 'w-full'} bg-[#0B0C15] rounded-xl border border-[#1F2937]/30 overflow-scroll flex flex-col`}>
                    <div className="flex-1 overflow-y-auto">
                        {messages.length > 0 ? (
                            messages.map((message) => (
                                <MessageListItem
                                    key={message.id}
                                    message={message}
                                    isSelected={selectedMessage?.id === message.id}
                                    onClick={() => handleMessageClick(message)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-[#1F2937]/30 flex items-center justify-center  mb-4">
                                    <InboxIcon size={40} className="text-gray-600" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-gray-400 text-lg font-semibold mb-2">No messages found</h3>
                                <p className="text-gray-600 text-sm">
                                    Try adjusting your filters or search query
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Detail */}
                {selectedMessage && (
                    <div className="flex-1 md:w-2/3 ">
                        <div className="bg-[#0B0C15] rounded-xl border border-[#1F2937]/30 overflow-scroll h-full">
                            <MessageDetail
                                message={selectedMessage}
                                onClose={handleCloseDetail}
                                onUpdate={updateMessages}
                            />
                        </div>
                    </div>
                )}

                {/* Empty state for detail panel on desktop */}
                {!selectedMessage && (
                    <div className="hidden md:flex flex-1 bg-[#0B0C15] rounded-xl border border-[#1F2937]/30 items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-[#1F2937]/30 flex items-center justify-center mx-auto mb-4">
                                <MessageCircle size={40} className="text-gray-600" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-gray-400 text-lg font-semibold mb-2">Select a message</h3>
                            <p className="text-gray-600 text-sm">
                                Choose a message from the list to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inbox;

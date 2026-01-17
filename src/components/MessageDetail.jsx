import React, { useState } from 'react';
import { Twitter, Linkedin, Instagram, Facebook, MessageCircle, Mail, Reply, AtSign, Check, CheckCheck, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { markAsRead, markAsUnread, getPlatformName, getMessageTypeLabel } from '../mockInboxData';

const MessageDetail = ({ message, onClose, onUpdate }) => {
    const [replyText, setReplyText] = useState('');
    const [showReplySuccess, setShowReplySuccess] = useState(false);

    if (!message) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0B0C15] border-l border-[#1F2937]/30">
                <div className="text-center">
                    <MessageCircle size={64} className="text-gray-700 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-gray-500 text-lg">Select a message to view details</p>
                </div>
            </div>
        );
    }

    const getPlatformIcon = (platform) => {
        const iconProps = { size: 20, strokeWidth: 2 };
        switch (platform) {
            case 'twitter':
                return <Twitter {...iconProps} />;
            case 'linkedin':
                return <Linkedin {...iconProps} />;
            case 'instagram':
                return <Instagram {...iconProps} />;
            case 'facebook':
                return <Facebook {...iconProps} />;
            default:
                return <MessageCircle {...iconProps} />;
        }
    };

    const getTypeIcon = (type) => {
        const iconProps = { size: 18, strokeWidth: 2 };
        switch (type) {
            case 'dm':
                return <Mail {...iconProps} />;
            case 'reply':
                return <Reply {...iconProps} />;
            case 'mention':
                return <AtSign {...iconProps} />;
            default:
                return <MessageCircle {...iconProps} />;
        }
    };

    const getPlatformColor = (platform) => {
        switch (platform) {
            case 'twitter':
                return '#1DA1F2';
            case 'linkedin':
                return '#0A66C2';
            case 'instagram':
                return '#E1306C';
            case 'facebook':
                return '#1877F2';
            default:
                return '#6366F1';
        }
    };

    const handleToggleRead = () => {
        if (message.isRead) {
            markAsUnread(message.id);
        } else {
            markAsRead(message.id);
        }
        onUpdate();
    };

    const handleSendReply = () => {
        if (replyText.trim()) {
            console.log('Sending reply:', replyText);
            setShowReplySuccess(true);
            setReplyText('');
            setTimeout(() => setShowReplySuccess(false), 3000);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#0B0C15] border-l border-[#1F2937]/30">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1F2937]/30">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getPlatformColor(message.platform) }}
                    >
                        {getPlatformIcon(message.platform)}
                    </div>
                    <div>
                        <h2 className="text-white font-semibold text-lg">{getPlatformName(message.platform)}</h2>
                        <p className="text-gray-500 text-sm">{getMessageTypeLabel(message.type)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleRead}
                        className="px-4 py-2 rounded-lg bg-[#1F2937]/50 hover:bg-[#1F2937] text-white text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        {message.isRead ? <Check size={16} /> : <CheckCheck size={16} />}
                        Mark as {message.isRead ? 'Unread' : 'Read'}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[#1F2937]/50 text-gray-400 hover:text-white transition-colors md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Sender Info */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1F2937] flex-shrink-0">
                        <img
                            src={message.sender.avatar}
                            alt={message.sender.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{message.sender.name}</h3>
                        <p className="text-gray-500 text-sm mb-1">{message.sender.username}</p>
                        <p className="text-gray-600 text-xs">
                            {format(message.timestamp, 'MMMM d, yyyy \'at\' h:mm a')}
                        </p>
                    </div>
                    {message.priority === 'high' && (
                        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                            <span className="text-red-400 text-xs font-semibold">High Priority</span>
                        </div>
                    )}
                </div>

                {/* Related Post Context */}
                {message.relatedPost && (
                    <div className="mb-6 p-4 rounded-lg bg-[#1F2937]/30 border border-[#1F2937]">
                        <div className="flex items-center gap-2 mb-2">
                            <Reply size={14} className="text-gray-500" />
                            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                                In Response To
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">{message.relatedPost}</p>
                    </div>
                )}

                {/* Message Body */}
                <div className="bg-[#1F2937]/20 rounded-lg p-6 border border-[#1F2937]/50">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {message.message}
                    </p>
                </div>

                {/* Success Message */}
                {showReplySuccess && (
                    <div className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-3">
                        <CheckCheck size={20} className="text-green-400" />
                        <p className="text-green-400 text-sm font-medium">Reply sent successfully!</p>
                    </div>
                )}
            </div>

            {/* Reply Section */}
            <div className="p-6 border-t border-[#1F2937]/30 bg-[#030712]">
                <div className="flex items-center gap-2 mb-3">
                    <Reply size={16} className="text-gray-500" />
                    <span className="text-gray-400 text-sm font-semibold">Reply</span>
                </div>
                <div className="flex gap-3">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-3 rounded-lg bg-[#1F2937]/30 border border-[#1F2937] text-white placeholder-gray-600 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all resize-none"
                        rows="3"
                    />
                    <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#6366F1]/20 flex items-center gap-2 self-start"
                    >
                        <Send size={18} />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageDetail;

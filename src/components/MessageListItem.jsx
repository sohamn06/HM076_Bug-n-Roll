import React from 'react';
import { Twitter, Linkedin, Instagram, Facebook, MessageCircle, Mail, Reply, AtSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MessageListItem = ({ message, isSelected, onClick }) => {
    const getPlatformIcon = (platform) => {
        const iconProps = { size: 16, strokeWidth: 2 };
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
        const iconProps = { size: 14, strokeWidth: 2 };
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

    const truncateMessage = (text, maxLength = 80) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div
            onClick={onClick}
            className={`
                relative p-4 border-b border-[#1F2937]/30 cursor-pointer transition-all duration-200
                ${isSelected ? 'bg-[#1F2937]/40 border-l-2 border-l-[#6366F1]' : 'hover:bg-[#1F2937]/20'}
                ${!message.isRead ? 'bg-[#1F2937]/10' : ''}
            `}
        >
            <div className="flex gap-3">
                {/* Avatar with Platform Badge */}
                <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1F2937]">
                        <img
                            src={message.sender.avatar}
                            alt={message.sender.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Platform Badge */}
                    <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0B0C15]"
                        style={{ backgroundColor: getPlatformColor(message.platform) }}
                    >
                        {getPlatformIcon(message.platform)}
                    </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-semibold truncate ${!message.isRead ? 'text-white' : 'text-gray-300'}`}>
                                {message.sender.name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                                {message.sender.username}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Type Icon */}
                            <div className="text-gray-500">
                                {getTypeIcon(message.type)}
                            </div>
                            {/* Timestamp */}
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    {/* Message Preview */}
                    <p className={`text-sm mb-1 ${!message.isRead ? 'text-gray-300 font-medium' : 'text-gray-400'}`}>
                        {truncateMessage(message.message)}
                    </p>

                    {/* Related Post */}
                    {message.relatedPost && (
                        <div className="flex items-center gap-1 mt-2">
                            <Reply size={12} className="text-gray-600" />
                            <span className="text-xs text-gray-600 italic truncate">
                                Re: {message.relatedPost}
                            </span>
                        </div>
                    )}
                </div>

                {/* Unread Indicator */}
                {!message.isRead && (
                    <div className="flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#6366F1] shadow-lg shadow-[#6366F1]/50" />
                    </div>
                )}
            </div>

            {/* Priority Indicator */}
            {message.priority === 'high' && (
                <div className="absolute top-2 right-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                </div>
            )}
        </div>
    );
};

export default MessageListItem;

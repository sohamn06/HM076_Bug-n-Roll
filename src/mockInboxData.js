// Mock data for Unified Social Inbox
// Simulates messages from different social media platforms

export const mockMessages = [
    {
        id: 1,
        platform: 'twitter',
        type: 'comment',
        sender: {
            name: 'Sarah Johnson',
            username: '@sarahj_design',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        },
        message: 'This is exactly what our marketing team needed! The AI-powered features are game-changing. When can we expect mobile app support?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        relatedPost: 'New AI Marketing Features Launch',
        priority: 'high'
    },
    {
        id: 2,
        platform: 'linkedin',
        type: 'dm',
        sender: {
            name: 'Michael Chen',
            username: 'michael-chen-cmo',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
        },
        message: 'Hi! I saw your demo at the marketing conference. Would love to discuss a potential partnership opportunity. Are you available for a call next week?',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        isRead: false,
        relatedPost: null,
        priority: 'high'
    },
    {
        id: 3,
        platform: 'instagram',
        type: 'comment',
        sender: {
            name: 'Emma Martinez',
            username: '@emmamart',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
        },
        message: '🔥🔥🔥 Love the new design! The UI is so clean and intuitive.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        isRead: true,
        relatedPost: 'Studio AI Platform Redesign',
        priority: 'normal'
    },
    {
        id: 4,
        platform: 'facebook',
        type: 'reply',
        sender: {
            name: 'David Brown',
            username: 'david.brown.marketing',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
        },
        message: 'Thanks for the quick response! Just signed up and already loving the campaign management features.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        isRead: true,
        relatedPost: 'Q: How does the campaign scheduler work?',
        priority: 'normal'
    },
    {
        id: 5,
        platform: 'twitter',
        type: 'mention',
        sender: {
            name: 'Tech Review Daily',
            username: '@techreviewdaily',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechReview'
        },
        message: 'Just reviewed @StudioAI and it\'s incredible! The AI copilot feature saved our team 10+ hours this week. Highly recommend for marketing teams. #MarTech #AI',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: false,
        relatedPost: null,
        priority: 'high'
    },
    {
        id: 6,
        platform: 'linkedin',
        type: 'comment',
        sender: {
            name: 'Jennifer Wilson',
            username: 'jennifer-wilson-99',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer'
        },
        message: 'Impressive work! We\'ve been looking for a solution like this. Does it integrate with our existing CRM systems?',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: true,
        relatedPost: 'Streamline Your Marketing Workflow',
        priority: 'normal'
    },
    {
        id: 7,
        platform: 'instagram',
        type: 'dm',
        sender: {
            name: 'Alex Rivera',
            username: '@alexrivera_creative',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
        },
        message: 'Hey! I\'m a content creator interested in collaborating. Your platform looks amazing! Can we chat about potential opportunities?',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: false,
        relatedPost: null,
        priority: 'normal'
    },
    {
        id: 8,
        platform: 'facebook',
        type: 'comment',
        sender: {
            name: 'Rachel Green',
            username: 'rachel.green.marketing',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel'
        },
        message: 'This is revolutionary! We just switched from our old tool and the difference is night and day. Team is much more productive now.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: true,
        relatedPost: 'Why Marketing Teams Love Studio AI',
        priority: 'normal'
    },
    {
        id: 9,
        platform: 'twitter',
        type: 'comment',
        sender: {
            name: 'Mark Thompson',
            username: '@markthompson_tech',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark'
        },
        message: 'Question: Can I schedule posts across multiple platforms at once? That would be a huge time saver!',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: true,
        relatedPost: 'Master Your Social Media Strategy',
        priority: 'normal'
    },
    {
        id: 10,
        platform: 'linkedin',
        type: 'mention',
        sender: {
            name: 'Lisa Anderson',
            username: 'lisa-anderson-ceo',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'
        },
        message: 'Our entire marketing department is now using Studio AI. The ROI has been phenomenal. If you\'re in marketing and not using this, you\'re missing out!',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        isRead: true,
        relatedPost: null,
        priority: 'normal'
    },
    {
        id: 11,
        platform: 'instagram',
        type: 'comment',
        sender: {
            name: 'Chris Parker',
            username: '@chrisparker_creative',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris'
        },
        message: '✨ The AI-generated captions are spot on! Saved me so much time brainstorming.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRead: true,
        relatedPost: 'AI-Powered Content Creation',
        priority: 'normal'
    },
    {
        id: 12,
        platform: 'twitter',
        type: 'dm',
        sender: {
            name: 'Nina Patel',
            username: '@ninapatel_startup',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina'
        },
        message: 'Hi there! I run a startup and we\'re looking for marketing tools. Do you offer any startup discounts or trial periods?',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        isRead: false,
        relatedPost: null,
        priority: 'high'
    }
];

// Helper functions
export const getUnreadCount = () => {
    return mockMessages.filter(msg => !msg.isRead).length;
};

export const getMessagesByPlatform = (platform) => {
    if (platform === 'all') return mockMessages;
    return mockMessages.filter(msg => msg.platform === platform);
};

export const getMessagesByType = (type) => {
    if (type === 'all') return mockMessages;
    return mockMessages.filter(msg => msg.type === type);
};

export const filterMessages = (platform, type) => {
    let filtered = mockMessages;
    
    if (platform !== 'all') {
        filtered = filtered.filter(msg => msg.platform === platform);
    }
    
    if (type !== 'all') {
        filtered = filtered.filter(msg => msg.type === type);
    }
    
    return filtered;
};

export const markAsRead = (messageId) => {
    const message = mockMessages.find(msg => msg.id === messageId);
    if (message) {
        message.isRead = true;
    }
};

export const markAsUnread = (messageId) => {
    const message = mockMessages.find(msg => msg.id === messageId);
    if (message) {
        message.isRead = false;
    }
};

export const getPlatformColor = (platform) => {
    const colors = {
        twitter: '#1DA1F2',
        linkedin: '#0A66C2',
        instagram: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        facebook: '#1877F2'
    };
    return colors[platform] || '#6366F1';
};

export const getPlatformName = (platform) => {
    const names = {
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
        instagram: 'Instagram',
        facebook: 'Facebook'
    };
    return names[platform] || platform;
};

export const getMessageTypeLabel = (type) => {
    const labels = {
        comment: 'Comment',
        dm: 'Direct Message',
        reply: 'Reply',
        mention: 'Mention'
    };
    return labels[type] || type;
};

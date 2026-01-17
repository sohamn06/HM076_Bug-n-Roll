import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, markNotificationAsRead } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [allNotifications, setAllNotifications] = useState([]);

    useEffect(() => {
        if (!userProfile?.uid) return;

        // Listen to user-specific notifications (approvals/rejections)
        const userNotificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userProfile.uid),
            orderBy('createdAt', 'desc')
        );

        // Listen to review requests (for managers/editors)
        const reviewRequestsQuery = query(
            collection(db, 'notifications'),
            where('type', '==', 'REVIEW_REQUEST'),
            orderBy('createdAt', 'desc')
        );

        const onNext = (snapshot, source) => {
            const newNotifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setAllNotifications(prev => {
                const otherSourceNotifs = source === 'user'
                    ? prev.filter(n => n.type === 'REVIEW_REQUEST')
                    : prev.filter(n => n.userId === userProfile.uid);

                const combined = [...newNotifs, ...otherSourceNotifs];
                const uniqueNotifs = Array.from(new Map(combined.map(n => [n.id, n])).values());
                uniqueNotifs.sort((a, b) => {
                    const aTime = a.createdAt?.seconds || 0;
                    const bTime = b.createdAt?.seconds || 0;
                    return bTime - aTime;
                });
                return uniqueNotifs;
            });
        };

        const onError = (error) => {
            console.error('Notification listener failed:', error);
        };

        const unsubscribeUser = onSnapshot(userNotificationsQuery,
            (snapshot) => onNext(snapshot, 'user'),
            onError
        );

        const unsubscribeReviews = onSnapshot(reviewRequestsQuery,
            (snapshot) => onNext(snapshot, 'review'),
            onError
        );

        return () => {
            unsubscribeUser();
            unsubscribeReviews();
        };
    }, [userProfile]);

    useEffect(() => {
        setNotifications(allNotifications.slice(0, 10));
        setUnreadCount(allNotifications.filter(n => !n.isRead).length);
    }, [allNotifications]);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markNotificationAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
        setIsOpen(false);
    };

    const handleMarkAllRead = async () => {
        const unreadNotifs = allNotifications.filter(n => !n.isRead);
        for (const notif of unreadNotifs) {
            await markNotificationAsRead(notif.id);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'APPROVED':
                return <Check size={16} className="text-green-400" />;
            case 'REJECTED':
                return <X size={16} className="text-red-400" />;
            case 'REVIEW_REQUEST':
                return <Bell size={16} className="text-yellow-400" />;
            default:
                return <Bell size={16} className="text-gray-400" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'APPROVED':
                return 'border-green-500/30 bg-green-500/10';
            case 'REJECTED':
                return 'border-red-500/30 bg-red-500/10';
            case 'REVIEW_REQUEST':
                return 'border-yellow-500/30 bg-yellow-500/10';
            default:
                return 'border-[#1F2937]/30 bg-[#1F2937]/10';
        }
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-[#1F2937]/50 transition-colors"
            >
                <Bell size={20} className="text-gray-400" />
                {unreadCount > 0 && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </div>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notification Panel */}
                    <div className="absolute right-0 top-full mt-2 w-96 bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-[#1F2937]/30 flex items-center justify-between">
                            <h3 className="text-white font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-[#6366F1] hover:text-[#5558E3] font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell size={40} className="text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full p-4 border-b border-[#1F2937]/30 hover:bg-[#1F2937]/20 transition-colors text-left ${!notification.isRead ? 'bg-[#1F2937]/10' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm mb-1 ${!notification.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                    {notification.message}
                                                </p>
                                                {notification.postTitle && (
                                                    <p className="text-xs text-gray-600 mb-1">
                                                        {notification.postTitle}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-600">
                                                    {notification.createdAt?.seconds &&
                                                        formatDistanceToNow(new Date(notification.createdAt.seconds * 1000), { addSuffix: true })
                                                    }
                                                </p>
                                                {notification.reason && (
                                                    <p className="text-xs text-red-400 mt-1 italic">
                                                        Reason: {notification.reason}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Unread Dot */}
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-[#6366F1] flex-shrink-0 mt-1" />
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-[#1F2937]/30 text-center">
                                <button className="text-xs text-gray-500 hover:text-white font-medium">
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;

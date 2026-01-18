import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Calendar = () => {
    const { userProfile } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('month'); // 'month', 'week', 'day'

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        if (!userProfile?.organizationId) return;

        const q = query(
            collection(db, 'content'),
            where('organizationId', '==', userProfile.organizationId),
            where('status', 'in', ['SCHEDULED', 'APPROVED'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            setIsLoading(false); // Data loaded, stop loading
        }, (error) => {
            console.error("Error fetching posts: ", error);
            setIsLoading(false); // Stop loading even if there's an error
        });
        return () => unsubscribe();
    }, [userProfile]);

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(year, month + direction, 1));
    };

    const getPostsForDate = (day) => {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        return posts.filter(post => {
            if (!post.scheduledDate) return false;
            const postDate = new Date(post.scheduledDate).toISOString().split('T')[0];
            return postDate === dateStr;
        });
    };

    const getPlatformColor = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'instagram': return 'bg-pink-500';
            case 'twitter': return 'bg-sky-500';
            case 'linkedin': return 'bg-blue-600';
            default: return 'bg-gray-500';
        }
    };

    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    // Loading state
    if (!userProfile?.organizationId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/30 animate-pulse">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <p className="text-gray-400">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Calendar</h1>
                    <p className="text-gray-400 text-sm">Visual scheduling for your campaigns</p>
                </div>
                <Link
                    to="/editor"
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    New Post
                </Link>
            </div>

            {/* Calendar Container */}
            <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {monthNames[month]} {year}
                    </h2>

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 hover:bg-[#1F2937]/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 hover:bg-[#1F2937]/50 rounded-lg text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-[#1F2937]/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* View Toggles */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setView('month')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'month'
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-[#1F2937]/50 text-gray-400 hover:text-white'
                            }`}
                    >
                        MONTH
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'week'
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-[#1F2937]/50 text-gray-400 hover:text-white'
                            }`}
                    >
                        WEEK
                    </button>
                    <button
                        onClick={() => setView('day')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'day'
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-[#1F2937]/50 text-gray-400 hover:text-white'
                            }`}
                    >
                        DAY
                    </button>
                </div>

                {/* Day Headers - Only for Month View */}
                {view === 'month' && (
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">
                                {day}
                            </div>
                        ))}
                    </div>
                )}

                {/* Month View */}
                {view === 'month' && (
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return <div key={`empty-${index}`} />;
                            }

                            const dayPosts = getPostsForDate(day);
                            const today = isToday(day);

                            return (
                                <div
                                    key={day}
                                    className={`min-h-[100px] p-2 rounded-lg border transition-colors ${today
                                        ? 'border-[#6366F1] bg-[#6366F1]/5'
                                        : 'border-[#1F2937]/50 hover:border-[#1F2937]'
                                        }`}
                                >
                                    <div className={`text-sm font-semibold mb-2 ${today ? 'text-[#6366F1]' : 'text-gray-400'
                                        }`}>
                                        {day}
                                    </div>

                                    <div className="space-y-1">
                                        {dayPosts.slice(0, 2).map(post => (
                                            <Link
                                                key={post.id}
                                                to={`/editor/${post.id}`}
                                                className={`block text-[10px] font-medium px-2 py-1 rounded text-white truncate hover:opacity-80 transition-opacity ${getPlatformColor(post.platform)}`}
                                                title={post.title}
                                            >
                                                {post.title || 'Untitled'}
                                            </Link>
                                        ))}
                                        {dayPosts.length > 2 && (
                                            <div className="text-[10px] text-gray-500 px-2">
                                                +{dayPosts.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Week View */}
                {view === 'week' && (
                    <div className="space-y-2">
                        {/* Week Header - Days of current week */}
                        <div className="grid grid-cols-8 gap-2">
                            <div className="text-xs font-semibold text-gray-500 p-2">Time</div>
                            {Array.from({ length: 7 }).map((_, i) => {
                                const weekStart = new Date(currentDate);
                                weekStart.setDate(currentDate.getDate() - currentDate.getDay() + i);
                                const isToday = new Date().toDateString() === weekStart.toDateString();

                                return (
                                    <div key={i} className={`text-center p-2 rounded-lg ${isToday ? 'bg-[#6366F1]/10 border border-[#6366F1]' : 'bg-[#1F2937]/30'}`}>
                                        <div className="text-xs font-semibold text-gray-500 uppercase">{dayNames[i]}</div>
                                        <div className={`text-lg font-bold ${isToday ? 'text-[#6366F1]' : 'text-white'}`}>{weekStart.getDate()}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Time slots */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {Array.from({ length: 12 }).map((_, hour) => { // 8 AM to 8 PM
                                const displayHour = hour + 8;
                                return (
                                    <div key={hour} className="grid grid-cols-8 gap-2 mb-1">
                                        <div className="text-xs text-gray-500 p-2">{displayHour}:00</div>
                                        {Array.from({ length: 7 }).map((_, day) => {
                                            const weekStart = new Date(currentDate);
                                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + day);
                                            const dayPosts = getPostsForDate(weekStart.getDate());

                                            return (
                                                <div key={day} className="min-h-[40px] p-1 border border-[#1F2937]/30 rounded hover:border-[#1F2937] transition-colors">
                                                    {dayPosts.map(post => (
                                                        <Link
                                                            key={post.id}
                                                            to={`/editor/${post.id}`}
                                                            className={`block text-[9px] font-medium px-1 py-0.5 rounded text-white truncate hover:opacity-80 mb-0.5 ${getPlatformColor(post.platform)}`}
                                                            title={post.title}
                                                        >
                                                            {post.title || 'Untitled'}
                                                        </Link>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Day View */}
                {view === 'day' && (
                    <div className="space-y-4">
                        {/* Current Day Header */}
                        <div className="text-center p-4 bg-[#6366F1]/10 border border-[#6366F1] rounded-lg">
                            <div className="text-sm font-semibold text-gray-400 uppercase">{dayNames[currentDate.getDay()]}</div>
                            <div className="text-3xl font-bold text-[#6366F1]">{currentDate.getDate()}</div>
                            <div className="text-sm text-gray-400">{monthNames[month]} {year}</div>
                        </div>

                        {/* Hourly schedule */}
                        <div className="max-h-[600px] overflow-y-auto space-y-2">
                            {Array.from({ length: 24 }).map((_, hour) => {
                                const dayPosts = getPostsForDate(currentDate.getDate());
                                const isPM = hour >= 12;
                                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

                                return (
                                    <div key={hour} className="flex gap-4">
                                        <div className="w-20 text-sm text-gray-500 font-medium pt-2">
                                            {displayHour}:00 {isPM ? 'PM' : 'AM'}
                                        </div>
                                        <div className="flex-1 min-h-[60px] p-3 border border-[#1F2937]/30 rounded-lg hover:border-[#1F2937] transition-colors bg-[#0B0C15]">
                                            <div className="space-y-2">
                                                {dayPosts.map(post => (
                                                    <Link
                                                        key={post.id}
                                                        to={`/editor/${post.id}`}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:opacity-80 transition-opacity ${getPlatformColor(post.platform)}`}
                                                    >
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium">{post.title || 'Untitled'}</div>
                                                            <div className="text-xs opacity-75">{post.platform}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;

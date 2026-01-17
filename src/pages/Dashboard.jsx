import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { TrendingUp, Users, Calendar, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { userProfile } = useAuth();
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({
        activeCampaigns: 2,
        pendingReview: 0,
        scheduled: 0
    });

    const [recentActivity] = useState([
        { user: 'AI Studio', action: 'generated 3 assets', time: '2 hours ago' },
        { user: 'John Doe', action: 'approved UI Strategy', time: '5 hours ago' },
        { user: 'Sarah Chen', action: 'modified ad copy', time: 'Yesterday' }
    ]);

    useEffect(() => {
        if (!userProfile?.organizationId) return;

        // Query posts filtered by organization
        const q = query(
            collection(db, 'content'),
            where('organizationId', '==', userProfile.organizationId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let pending = 0;
            let scheduled = 0;
            const postsData = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                postsData.push({ id: doc.id, ...data });
                if (data.status === 'IN_REVIEW') pending++;
                if (data.status === 'SCHEDULED') scheduled++;
            });

            setPosts(postsData);
            setStats(prev => ({ ...prev, pendingReview: pending, scheduled }));
        });
        return () => unsubscribe();
    }, [userProfile]);

    // Show loading state while user profile loads
    if (!userProfile?.organizationId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/30 animate-pulse">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
                    <p className="text-gray-400 text-sm">Campaign Performance Overview</p>
                </div>
                <Link
                    to="/campaigns"
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    Create Campaign
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="TOTAL REACH"
                    value="1.2M"
                    change="+9.2%"
                    icon={TrendingUp}
                />
                <StatCard
                    title="ENGAGEMENT"
                    value="4.8%"
                    change="+2.4%"
                    icon={Users}
                />
                <StatCard
                    title="ACTIVE ADS"
                    value={stats.activeCampaigns.toString()}
                    change="+10%"
                    icon={Calendar}
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Trends - 2/3 width */}
                <div className="lg:col-span-2 bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white bg-[#1F2937]/50 rounded-lg">7D</button>
                            <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white bg-[#1F2937]/50 rounded-lg">30D</button>
                            <button className="px-3 py-1 text-xs font-medium text-white bg-[#6366F1] rounded-lg">90D</button>
                        </div>
                    </div>

                    {/* Simulated Bar Chart */}
                    <div className="flex items-end justify-between gap-3 h-48">
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                            <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-[#1F2937]/50 rounded-t-lg relative" style={{ height: `${[40, 55, 45, 75, 60, 50, 65][i]}% ` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#6366F1] to-[#8B5CF6] rounded-t-lg"></div>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Schedule - 1/3 width */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Schedule</h3>
                        <Calendar size={18} className="text-gray-400" />
                    </div>

                    <div className="space-y-4">
                        <ScheduleItem date="MAY 12" title="Product Feature" platform="Instagram" time="10:00 AM" />
                        <ScheduleItem date="MAY 14" title="AI Trend Report v2" platform="LinkedIn" time="03:00 PM" />
                        <ScheduleItem date="MAY 15" title="Success Story" platform="Twitter" time="06:00 PM" />
                    </div>

                    <Link to="/calendar" className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1F2937]/50 hover:bg-[#1F2937] text-white text-sm font-medium rounded-lg transition-colors">
                        Open Full Calendar
                    </Link>
                </div>
            </div>

            {/* Active Campaigns & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Campaigns */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Active Campaigns</h3>
                        <Link to="/campaigns" className="text-sm text-[#6366F1] hover:text-[#8B5CF6] font-medium">VIEW ALL</Link>
                    </div>

                    <div className="space-y-3">
                        {posts.slice(0, 3).map(post => (
                            <CampaignRow
                                key={post.id}
                                name={post.title || 'Untitled Campaign'}
                                channels={[post.platform || 'Instagram']}
                                reach={`${Math.floor(Math.random() * 500)} K`}
                                status={post.status === 'APPROVED' ? 'live' : post.status === 'IN_REVIEW' ? 'reviewing' : 'pending'}
                            />
                        ))}
                        {posts.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">No campaigns yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

                    <div className="space-y-4">
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-[#6366F1]"></div>
                                <div>
                                    <p className="text-sm text-white">
                                        <span className="font-medium">{activity.user}</span> {activity.action}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon: Icon }) => (
    <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Icon size={16} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
            </div>
            <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                <TrendingUp size={12} />
                {change}
            </span>
        </div>
        <div className="text-3xl font-bold text-white">{value}</div>
    </div>
);

const ScheduleItem = ({ date, title, platform, time }) => (
    <div className="flex items-start gap-3">
        <div className="text-center">
            <div className="text-xs font-bold text-gray-500 uppercase">{date.split(' ')[0]}</div>
            <div className="text-lg font-bold text-white">{date.split(' ')[1]}</div>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{title}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{platform}</span>
                <span className="text-xs text-gray-600">•</span>
                <span className="text-xs text-gray-500">{time}</span>
            </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#14B8A6] mt-1"></div>
    </div>
);

const CampaignRow = ({ name, channels, reach, status }) => {
    const statusColors = {
        live: 'bg-green-500/10 text-green-400 border-green-500/20',
        reviewing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };

    return (
        <div className="flex items-center justify-between py-3 border-b border-[#1F2937]/30 last:border-0">
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{channels.join(', ')}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">{reach}</span>
                <span className={`text - xs font - medium px - 2 py - 1 rounded border ${statusColors[status]} capitalize`}>
                    {status}
                </span>
            </div>
        </div>
    );
};

export default Dashboard;

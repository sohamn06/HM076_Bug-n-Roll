import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
    TrendingUp, CheckCircle, XCircle, Clock, Eye, Plus,
    BarChart3, Calendar, MessageSquare, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MarketerDashboard = () => {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({
        pendingReviews: 0,
        scheduledPosts: 0,
        approvedToday: 0,
        totalCampaigns: 0
    });
    const [pendingPosts, setPendingPosts] = useState([]);

    useEffect(() => {
        if (!userProfile?.organizationId) return;

        const contentQuery = query(
            collection(db, 'content'),
            where('organizationId', '==', userProfile.organizationId)
        );

        const unsubscribe = onSnapshot(contentQuery, (snapshot) => {
            let pending = 0;
            let scheduled = 0;
            let approved = 0;
            const pendingList = [];

            snapshot.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                if (data.status === 'IN_REVIEW') {
                    pending++;
                    pendingList.push(data);
                }
                if (data.status === 'SCHEDULED') scheduled++;
                if (data.status === 'APPROVED') approved++;
            });

            setStats({
                pendingReviews: pending,
                scheduledPosts: scheduled,
                approvedToday: approved,
                totalCampaigns: snapshot.size
            });
            setPendingPosts(pendingList.slice(0, 3));
        });

        return () => unsubscribe();
    }, [userProfile]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <Zap className="text-emerald-500" size={32} />
                        Marketer Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm">Approve content and manage campaigns</p>
                </div>
                <Link
                    to="/approvals"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <CheckCircle size={16} />
                    Review Queue ({stats.pendingReviews})
                </Link>
            </div>

            {/* Marketer-Specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="PENDING REVIEWS"
                    value={stats.pendingReviews.toString()}
                    subtitle="Awaiting your approval"
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="APPROVED TODAY"
                    value={stats.approvedToday.toString()}
                    subtitle="Ready to schedule"
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="SCHEDULED"
                    value={stats.scheduledPosts.toString()}
                    subtitle="Coming up"
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title="TOTAL CAMPAIGNS"
                    value={stats.totalCampaigns.toString()}
                    subtitle="All content"
                    icon={BarChart3}
                    color="purple"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/approvals" className="bg-[#0B0C15] border border-amber-500/30 rounded-xl p-6 hover:border-amber-500/60 transition-all">
                    <Clock className="text-amber-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Approval Queue</h3>
                    <p className="text-gray-400 text-sm mb-4">{stats.pendingReviews} posts need review</p>
                    <div className="flex items-center text-amber-500 text-sm font-medium">
                        Review Now →
                    </div>
                </Link>

                <Link to="/campaigns" className="bg-[#0B0C15] border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/60 transition-all">
                    <Plus className="text-emerald-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Create Campaign</h3>
                    <p className="text-gray-400 text-sm mb-4">Start a new marketing campaign</p>
                    <div className="flex items-center text-emerald-500 text-sm font-medium">
                        Create →
                    </div>
                </Link>

                <Link to="/analytics" className="bg-[#0B0C15] border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all">
                    <TrendingUp className="text-blue-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Performance</h3>
                    <p className="text-gray-400 text-sm mb-4">View campaign analytics</p>
                    <div className="flex items-center text-blue-500 text-sm font-medium">
                        View Analytics →
                    </div>
                </Link>
            </div>

            {/* Pending Reviews Preview */}
            <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Pending Reviews</h3>
                    <Link to="/approvals" className="text-sm text-emerald-500 hover:text-emerald-400 font-medium">
                        View All →
                    </Link>
                </div>

                {pendingPosts.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle size={48} className="text-green-500/50 mx-auto mb-3" />
                        <p className="text-gray-400">No pending reviews! Queue is clear.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingPosts.map(post => (
                            <PendingReviewItem key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Upcoming Schedule</h3>
                    <Link to="/calendar" className="text-sm text-blue-500 hover:text-blue-400 font-medium">
                        Full Calendar →
                    </Link>
                </div>
                <div className="text-gray-400 text-sm text-center py-8">
                    {stats.scheduledPosts} posts scheduled this week
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
    const colorClasses = {
        purple: 'text-purple-400 bg-purple-500/10',
        blue: 'text-blue-400 bg-blue-500/10',
        green: 'text-green-400 bg-green-500/10',
        amber: 'text-amber-400 bg-amber-500/10'
    };

    return (
        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon size={20} />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
    );
};

const PendingReviewItem = ({ post }) => {
    return (
        <Link
            to={`/editor/${post.id}`}
            className="flex items-center justify-between p-4 border border-[#1F2937]/50 rounded-lg hover:border-amber-500/30 transition-colors"
        >
            <div className="flex-1">
                <h4 className="text-white font-medium text-sm mb-1">{post.title || 'Untitled'}</h4>
                <p className="text-gray-500 text-xs">{post.platform} • By {post.createdByName || 'Team Member'}</p>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-green-500/10 text-green-500 rounded">
                    <CheckCircle size={18} />
                </button>
                <button className="p-2 hover:bg-red-500/10 text-red-500 rounded">
                    <XCircle size={18} />
                </button>
            </div>
        </Link>
    );
};

export default MarketerDashboard;

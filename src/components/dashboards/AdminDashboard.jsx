import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
    TrendingUp, Users, Calendar, Shield, UserPlus, Activity,
    CheckCircle, Clock, AlertCircle, BarChart3, Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCampaigns: 0,
        pendingApprovals: 0,
        activeUsers: 0,
        totalReach: '1.2M',
        engagement: '4.8%'
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        if (!userProfile?.organizationId) return;

        // Query content for stats
        const contentQuery = query(
            collection(db, 'content'),
            where('organizationId', '==', userProfile.organizationId)
        );

        const unsubscribe = onSnapshot(contentQuery, (snapshot) => {
            let pending = 0;
            let campaigns = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                campaigns++;
                if (data.status === 'IN_REVIEW') pending++;
            });

            setStats(prev => ({
                ...prev,
                totalCampaigns: campaigns,
                pendingApprovals: pending
            }));
        });

        // Query users
        const usersQuery = query(
            collection(db, 'users'),
            where('organizationId', '==', userProfile.organizationId)
        );

        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
        });

        return () => {
            unsubscribe();
            unsubscribeUsers();
        };
    }, [userProfile]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <Shield className="text-purple-500" size={32} />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm">Complete system overview and controls</p>
                </div>
                <Link
                    to="/team"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <UserPlus size={16} />
                    Manage Team
                </Link>
            </div>

            {/* Admin-Specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="TEAM MEMBERS"
                    value={stats.totalUsers.toString()}
                    change="+2 this week"
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="TOTAL CAMPAIGNS"
                    value={stats.totalCampaigns.toString()}
                    change="+5 this month"
                    icon={BarChart3}
                    color="blue"
                />
                <StatCard
                    title="PENDING APPROVALS"
                    value={stats.pendingApprovals.toString()}
                    change="Needs attention"
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="TOTAL REACH"
                    value={stats.totalReach}
                    change="+9.2%"
                    icon={TrendingUp}
                    color="green"
                />
            </div>

            {/* Admin Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/team" className="bg-[#0B0C15] border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all group">
                    <Users className="text-purple-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Team Management</h3>
                    <p className="text-gray-400 text-sm mb-4">Manage roles, permissions, and invitations</p>
                    <div className="flex items-center text-purple-500 text-sm font-medium">
                        Manage Team →
                    </div>
                </Link>

                <Link to="/approvals" className="bg-[#0B0C15] border border-amber-500/30 rounded-xl p-6 hover:border-amber-500/60 transition-all group">
                    <CheckCircle className="text-amber-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Approval Queue</h3>
                    <p className="text-gray-400 text-sm mb-4">{stats.pendingApprovals} posts waiting for review</p>
                    <div className="flex items-center text-amber-500 text-sm font-medium">
                        Review Now →
                    </div>
                </Link>

                <Link to="/analytics" className="bg-[#0B0C15] border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all group">
                    <Activity className="text-blue-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Analytics & Reports</h3>
                    <p className="text-gray-400 text-sm mb-4">View performance metrics and insights</p>
                    <div className="flex items-center text-blue-500 text-sm font-medium">
                        View Analytics →
                    </div>
                </Link>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Pipeline */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Content Pipeline</h3>
                    <div className="space-y-3">
                        <PipelineItem label="Drafts" count={5} color="gray" link="/campaigns" />
                        <PipelineItem label="In Review" count={stats.pendingApprovals} color="amber" link="/approvals" />
                        <PipelineItem label="Approved" count={8} color="green" link="/campaigns" />
                        <PipelineItem label="Scheduled" count={12} color="blue" link="/calendar" />
                    </div>
                </div>

                {/* Team Activity */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Team Activity</h3>
                    <div className="space-y-4">
                        <ActivityItem
                            user="John Doe"
                            action="submitted campaign for review"
                            time="2 hours ago"
                        />
                        <ActivityItem
                            user="Sarah Chen"
                            action="approved social media post"
                            time="5 hours ago"
                        />
                        <ActivityItem
                            user="Mike Johnson"
                            action="created new campaign"
                            time="Yesterday"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon: Icon, color }) => {
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
            <div className="text-xs text-gray-500">{change}</div>
        </div>
    );
};

const PipelineItem = ({ label, count, color, link }) => {
    const colorClasses = {
        gray: 'bg-gray-500/20 text-gray-400',
        amber: 'bg-amber-500/20 text-amber-400',
        green: 'bg-green-500/20 text-green-400',
        blue: 'bg-blue-500/20 text-blue-400'
    };

    return (
        <Link to={link} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#1F2937]/30 transition-colors">
            <span className="text-white text-sm font-medium">{label}</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorClasses[color]}`}>
                {count}
            </span>
        </Link>
    );
};

const ActivityItem = ({ user, action, time }) => (
    <div className="flex items-start gap-3">
        <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500"></div>
        <div>
            <p className="text-sm text-white">
                <span className="font-medium">{user}</span> {action}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{time}</p>
        </div>
    </div>
);

export default AdminDashboard;

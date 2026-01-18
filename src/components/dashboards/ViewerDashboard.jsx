import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
    Eye, BarChart3, Calendar, TrendingUp, Users, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ViewerDashboard = () => {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({
        totalCampaigns: 0,
        scheduled: 0,
        approved: 0,
        published: 0,
        totalReach: '1.2M',
        engagement: '4.8%'
    });

    useEffect(() => {
        if (!userProfile?.organizationId) return;

        const contentQuery = query(
            collection(db, 'content'),
            where('organizationId', '==', userProfile.organizationId)
        );

        const unsubscribe = onSnapshot(contentQuery, (snapshot) => {
            let scheduled = 0;
            let approved = 0;
            let published = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'SCHEDULED') scheduled++;
                if (data.status === 'APPROVED') approved++;
                if (data.status === 'PUBLISHED') published++;
            });

            setStats(prev => ({
                ...prev,
                totalCampaigns: snapshot.size,
                scheduled,
                approved,
                published
            }));
        });

        return () => unsubscribe();
    }, [userProfile]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <Eye className="text-gray-500" size={32} />
                        Viewer Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm">Read-only access to campaigns and analytics</p>
                </div>
            </div>

            {/* Viewer-Specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="TOTAL CAMPAIGNS"
                    value={stats.totalCampaigns.toString()}
                    subtitle="All content"
                    icon={BarChart3}
                    color="blue"
                />
                <StatCard
                    title="TOTAL REACH"
                    value={stats.totalReach}
                    subtitle="+9.2% this month"
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    title="ENGAGEMENT RATE"
                    value={stats.engagement}
                    subtitle="+2.4% from last week"
                    icon={Users}
                    color="purple"
                />
            </div>

            {/* Content Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/campaigns" className="bg-[#0B0C15] border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all">
                    <BarChart3 className="text-blue-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Campaigns</h3>
                    <p className="text-3xl font-bold text-white mb-2">{stats.totalCampaigns}</p>
                    <p className="text-gray-400 text-sm">View all campaigns</p>
                </Link>

                <Link to="/calendar" className="bg-[#0B0C15] border border-green-500/30 rounded-xl p-6 hover:border-green-500/60 transition-all">
                    <Calendar className="text-green-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Scheduled</h3>
                    <p className="text-3xl font-bold text-white mb-2">{stats.scheduled}</p>
                    <p className="text-gray-400 text-sm">Posts coming up</p>
                </Link>

                <Link to="/analytics" className="bg-[#0B0C15] border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all">
                    <Award className="text-purple-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Published</h3>
                    <p className="text-3xl font-bold text-white mb-2">{stats.published}</p>
                    <p className="text-gray-400 text-sm">Live campaigns</p>
                </Link>
            </div>

            {/* Performance Overview */}
            <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Campaign Performance</h3>

                {/* Simulated Chart */}
                <div className="flex items-end justify-between gap-3 h-48">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-[#1F2937]/50 rounded-t-lg relative" style={{ height: `${[40, 55, 45, 75, 60, 50, 65][i]}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#6366F1] to-[#8B5CF6] rounded-t-lg"></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <Eye size={24} className="text-gray-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-white font-semibold mb-2">Read-Only Access</h3>
                        <p className="text-gray-400 text-sm">
                            You have viewer permissions for this organization. You can view all campaigns and analytics
                            but cannot create or edit content. Contact your administrator to change your permissions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/campaigns" className="text-center p-4 bg-[#0B0C15] border border-[#1F2937]/50 rounded-lg hover:border-blue-500/30 transition-colors">
                    <p className="text-white font-medium mb-1">View Campaigns</p>
                    <p className="text-gray-500 text-xs">Browse all content</p>
                </Link>
                <Link to="/calendar" className="text-center p-4 bg-[#0B0C15] border border-[#1F2937]/50 rounded-lg hover:border-blue-500/30 transition-colors">
                    <p className="text-white font-medium mb-1">Content Calendar</p>
                    <p className="text-gray-500 text-xs">View schedule</p>
                </Link>
                <Link to="/analytics" className="text-center p-4 bg-[#0B0C15] border border-[#1F2937]/50 rounded-lg hover:border-blue-500/30 transition-colors">
                    <p className="text-white font-medium mb-1">Analytics</p>
                    <p className="text-gray-500 text-xs">Performance metrics</p>
                </Link>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
    const colorClasses = {
        purple: 'text-purple-400 bg-purple-500/10',
        blue: 'text-blue-400 bg-blue-500/10',
        green: 'text-green-400 bg-green-500/10'
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

export default ViewerDashboard;

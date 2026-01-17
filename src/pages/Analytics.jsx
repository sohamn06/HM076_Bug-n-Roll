import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, MousePointer, Instagram, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
    const { userProfile } = useAuth();
    const [posts, setPosts] = useState([]);
    const [metrics, setMetrics] = useState({
        totalImpressions: 0,
        engagementRate: 0,
        followersGrowth: 0,
        conversionRate: 0
    });
    const [platformStats, setPlatformStats] = useState({
        Instagram: { reach: 0, engagement: 0, count: 0 },
        Twitter: { reach: 0, engagement: 0, count: 0 },
        LinkedIn: { reach: 0, engagement: 0, count: 0 }
    });

    useEffect(() => {
        if (!userProfile?.organizationId) return;

        // Fetch posts filtered by organization
        const q = query(
            collection(db, 'content'),
            where('organizationId', '==', userProfile.organizationId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            calculateMetrics(postsData);
        });

        return () => unsubscribe();
    }, [userProfile]);

    const calculateMetrics = (postsData) => {
        // Simulate metrics based on post count (in real app, these would come from API)
        const totalPosts = postsData.length;
        const baseImpressions = totalPosts * 25000; // Avg 25k per post

        // Calculate platform-specific stats
        const platformData = {
            Instagram: { reach: 0, engagement: 0, count: 0 },
            Twitter: { reach: 0, engagement: 0, count: 0 },
            LinkedIn: { reach: 0, engagement: 0, count: 0 }
        };

        postsData.forEach(post => {
            const platform = post.platform || 'Instagram';
            if (platformData[platform]) {
                platformData[platform].count++;
                platformData[platform].reach += 50000; // Simulated reach per post
                platformData[platform].engagement += Math.random() * 10; // Random engagement
            }
        });

        // Calculate averages
        Object.keys(platformData).forEach(platform => {
            if (platformData[platform].count > 0) {
                platformData[platform].engagement =
                    (platformData[platform].engagement / platformData[platform].count).toFixed(1);
            }
        });

        setPlatformStats(platformData);

        setMetrics({
            totalImpressions: baseImpressions,
            engagementRate: (5 + Math.random() * 3).toFixed(1),
            followersGrowth: Math.floor(totalPosts * 50),
            conversionRate: (2 + Math.random() * 2).toFixed(1)
        });
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getTopPosts = () => {
        return posts
            .filter(p => p.status === 'APPROVED' || p.status === 'SCHEDULED')
            .slice(0, 4)
            .map(post => ({
                title: post.title || 'Untitled Post',
                platform: post.platform || 'Instagram',
                impressions: formatNumber(Math.floor(Math.random() * 200000) + 50000),
                engagement: (Math.random() * 8 + 4).toFixed(1) + '%'
            }));
    };

    // Loading state
    if (!userProfile?.organizationId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/30 animate-pulse">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <p className="text-gray-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
                <p className="text-gray-400 text-sm">Track your campaign performance metrics · {posts.length} total posts</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Impressions"
                    value={formatNumber(metrics.totalImpressions)}
                    change="+12.5%"
                    icon={Eye}
                    trend="up"
                />
                <MetricCard
                    title="Engagement Rate"
                    value={`${metrics.engagementRate}%`}
                    change="+2.3%"
                    icon={MousePointer}
                    trend="up"
                />
                <MetricCard
                    title="Followers Growth"
                    value={`+${metrics.followersGrowth}`}
                    change="+8.1%"
                    icon={Users}
                    trend="up"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${metrics.conversionRate}%`}
                    change="-0.4%"
                    icon={TrendingUp}
                    trend="down"
                />
            </div>

            {/* Platform Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Breakdown */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Platform Performance</h3>

                    <div className="space-y-4">
                        <PlatformRow
                            icon={Instagram}
                            name="Instagram"
                            reach={formatNumber(platformStats.Instagram.reach)}
                            engagement={`${platformStats.Instagram.engagement}%`}
                            growth={`+${platformStats.Instagram.count} posts`}
                            color="from-pink-500 to-purple-500"
                        />
                        <PlatformRow
                            icon={Twitter}
                            name="Twitter"
                            reach={formatNumber(platformStats.Twitter.reach)}
                            engagement={`${platformStats.Twitter.engagement}%`}
                            growth={`+${platformStats.Twitter.count} posts`}
                            color="from-sky-400 to-blue-500"
                        />
                        <PlatformRow
                            icon={Linkedin}
                            name="LinkedIn"
                            reach={formatNumber(platformStats.LinkedIn.reach)}
                            engagement={`${platformStats.LinkedIn.engagement}%`}
                            growth={`+${platformStats.LinkedIn.count} posts`}
                            color="from-blue-600 to-blue-700"
                        />
                    </div>
                </div>

                {/* Top Performing Content */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Top Performing Posts</h3>

                    <div className="space-y-4">
                        {getTopPosts().length > 0 ? (
                            getTopPosts().map((post, i) => (
                                <PostRow key={i} {...post} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-8">No posts yet. Create some content to see analytics!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Daily Trend Chart */}
            <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Engagement Trend (Last 14 Days)</h3>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white bg-[#1F2937]/50 rounded-lg">7D</button>
                        <button className="px-3 py-1 text-xs font-medium text-white bg-[#6366F1] rounded-lg">14D</button>
                        <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white bg-[#1F2937]/50 rounded-lg">30D</button>
                    </div>
                </div>

                {/* Simulated Line Chart */}
                <div className="h-64 flex items-end justify-between gap-2">
                    {[65, 70, 68, 75, 72, 80, 78, 85, 82, 88, 86, 91, 89, 94].map((value, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full relative" style={{ height: `${value}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#6366F1]/30 to-[#6366F1]/10 rounded-t-lg border-t-2 border-[#6366F1]"></div>
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium">{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Audience Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Age Groups */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Age Groups</h3>
                    <div className="space-y-3">
                        <ProgressBar label="18-24" percentage={28} />
                        <ProgressBar label="25-34" percentage={42} />
                        <ProgressBar label="35-44" percentage={20} />
                        <ProgressBar label="45+" percentage={10} />
                    </div>
                </div>

                {/* Gender */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Gender Distribution</h3>
                    <div className="space-y-3">
                        <ProgressBar label="Female" percentage={58} color="bg-pink-500" />
                        <ProgressBar label="Male" percentage={40} color="bg-blue-500" />
                        <ProgressBar label="Other" percentage={2} color="bg-purple-500" />
                    </div>
                </div>

                {/* Top Locations */}
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Locations</h3>
                    <div className="space-y-3">
                        <LocationRow city="New York" percentage={24} />
                        <LocationRow city="Los Angeles" percentage={18} />
                        <LocationRow city="Chicago" percentage={14} />
                        <LocationRow city="Houston" percentage={12} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
    <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
            <Icon size={20} className="text-gray-400" />
            <span className={`text-xs font-semibold flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                <ArrowUpRight size={12} className={trend === 'down' ? 'rotate-90' : ''} />
                {change}
            </span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</div>
    </div>
);

const PlatformRow = ({ icon: Icon, name, reach, engagement, growth, color }) => (
    <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1">
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-gray-500">{reach} reach</p>
        </div>
        <div className="text-right">
            <p className="text-sm font-semibold text-white">{engagement}</p>
            <p className="text-xs text-green-400">{growth}</p>
        </div>
    </div>
);

const PostRow = ({ title, platform, impressions, engagement }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#1F2937]/30 last:border-0">
        <div>
            <p className="text-sm font-medium text-white mb-1">{title}</p>
            <p className="text-xs text-gray-500">{platform}</p>
        </div>
        <div className="text-right">
            <p className="text-sm font-semibold text-white">{impressions}</p>
            <p className="text-xs text-green-400">{engagement} eng.</p>
        </div>
    </div>
);

const ProgressBar = ({ label, percentage, color = 'bg-[#6366F1]' }) => (
    <div>
        <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm font-semibold text-white">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-[#1F2937]/50 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);

const LocationRow = ({ city, percentage }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{city}</span>
        <span className="text-sm font-semibold text-white">{percentage}%</span>
    </div>
);

export default Analytics;

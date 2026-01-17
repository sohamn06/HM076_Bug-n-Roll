import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, MousePointer, Instagram, Twitter, Linkedin, FileText, Download, Share2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const BrandedReport = () => {
    const { userProfile } = useAuth();
    const [posts, setPosts] = useState([]);
    const [orgData, setOrgData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userProfile?.organizationId) return;

        const loadData = async () => {
            // Fetch Org branding
            const orgDoc = await getDoc(doc(db, 'organizations', userProfile.organizationId));
            if (orgDoc.exists()) setOrgData(orgDoc.data());

            // Fetch posts
            const q = query(
                collection(db, 'content'),
                where('organizationId', '==', userProfile.organizationId)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPosts(data);
                setLoading(false);
            });

            return unsubscribe;
        };

        const unset = loadData();
        return () => { if (typeof unset === 'function') unset(); };
    }, [userProfile]);

    const branding = orgData?.branding || {
        primaryColor: '#6366F1',
        logoUrl: null,
        companyName: orgData?.name || 'Your Company'
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Branded Header */}
            <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: branding.primaryColor }}></div>

                <div className="flex items-center gap-6">
                    {branding.logoUrl ? (
                        <img src={branding.logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, #8B5CF6)` }}>
                            <span className="text-white font-bold text-3xl">{branding.companyName.charAt(0)}</span>
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">{branding.companyName}</h1>
                        <p className="text-gray-400 font-medium tracking-wide uppercase text-xs">Monthly Performance Report • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1F2937]/50 hover:bg-[#1F2937] text-white text-sm font-bold rounded-xl transition-all border border-[#1F2937]">
                        <Share2 size={16} /> Share
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-xl" style={{ backgroundColor: branding.primaryColor }}>
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Reach" value="1.2M" sub="+14% vs last month" icon={Eye} color={branding.primaryColor} />
                <StatCard label="Engagements" value="48.5K" sub="+8.2% vs last month" icon={MousePointer} color={branding.primaryColor} />
                <StatCard label="New Followers" value="2,400" sub="+22% vs last month" icon={Users} color={branding.primaryColor} />
                <StatCard label="Conversions" value="342" sub="+5.1% vs last month" icon={TrendingUp} color={branding.primaryColor} />
            </div>

            {/* Platform Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-8">
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        <Instagram size={20} className="text-pink-500" /> Instagram Performance
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-3">
                        {[40, 65, 55, 80, 70, 95, 85].map((v, i) => (
                            <div key={i} className="flex-1 rounded-t-lg relative group" style={{ height: `${v}%`, backgroundColor: branding.primaryColor + '44' }}>
                                <div className="absolute top-0 left-0 w-full h-1 rounded-full" style={{ backgroundColor: branding.primaryColor }}></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {v}k
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-8">
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        <Linkedin size={20} className="text-blue-600" /> LinkedIn Engagement
                    </h3>
                    <div className="space-y-6">
                        <MetricBar label="Impression Growth" percent={78} color={branding.primaryColor} />
                        <MetricBar label="Click-through Rate" percent={62} color={branding.primaryColor} />
                        <MetricBar label="Profile Visits" percent={45} color={branding.primaryColor} />
                    </div>
                </div>
            </div>

            {/* Top Campaigns */}
            <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-8">
                <h3 className="text-white font-bold text-lg mb-6">Top Performing Content</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#1F2937]/50">
                                <th className="pb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Post Title</th>
                                <th className="pb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Platform</th>
                                <th className="pb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Impressions</th>
                                <th className="pb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Engagement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F2937]/30">
                            {[1, 2, 3].map((_, i) => (
                                <tr key={i} className="group hover:bg-[#1F2937]/20 transition-colors">
                                    <td className="py-4 text-sm font-bold text-white">Summer Launch 2024 Campaign - {i + 1}</td>
                                    <td className="py-4"><Instagram size={16} className="text-pink-500" /></td>
                                    <td className="py-4 text-sm text-gray-300">{(120 - i * 15)}K</td>
                                    <td className="py-4 text-sm text-green-400">{(6.2 - i * 0.4).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
    <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-6 shadow-xl group hover:border-gray-700 transition-all">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: color + '15' }}>
            <Icon size={20} style={{ color }} />
        </div>
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</div>
        <div className="text-[10px] font-medium text-green-400">{sub}</div>
    </div>
);

const MetricBar = ({ label, percent, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-white">{label}</span>
            <span className="text-xs font-black text-gray-400">{percent}%</span>
        </div>
        <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div className="h-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: color }}></div>
        </div>
    </div>
);

export default BrandedReport;

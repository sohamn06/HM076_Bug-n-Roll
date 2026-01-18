import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
    Edit3, FileText, Clock, CheckCircle, Plus, Sparkles,
    Calendar, Send, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EditorDashboard = () => {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({
        myDrafts: 0,
        inReview: 0,
        approved: 0,
        totalCreated: 0
    });
    const [myContent, setMyContent] = useState([]);

    useEffect(() => {
        if (!userProfile?.uid) return;

        const contentQuery = query(
            collection(db, 'content'),
            where('createdBy', '==', userProfile.uid)
        );

        const unsubscribe = onSnapshot(contentQuery, (snapshot) => {
            let drafts = 0;
            let inReview = 0;
            let approved = 0;
            const contentList = [];

            snapshot.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                contentList.push(data);

                if (data.status === 'DRAFT') drafts++;
                if (data.status === 'IN_REVIEW') inReview++;
                if (data.status === 'APPROVED' || data.status === 'SCHEDULED') approved++;
            });

            setStats({
                myDrafts: drafts,
                inReview,
                approved,
                totalCreated: snapshot.size
            });
            setMyContent(contentList.slice(0, 4));
        });

        return () => unsubscribe();
    }, [userProfile]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <Edit3 className="text-blue-500" size={32} />
                        Editor Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm">Create and manage your content</p>
                </div>
                <Link
                    to="/editor/new"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    New Content
                </Link>
            </div>

            {/* Editor-Specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="MY DRAFTS"
                    value={stats.myDrafts.toString()}
                    subtitle="Continue writing"
                    icon={FileText}
                    color="blue"
                />
                <StatCard
                    title="IN REVIEW"
                    value={stats.inReview.toString()}
                    subtitle="Awaiting approval"
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="APPROVED"
                    value={stats.approved.toString()}
                    subtitle="Ready to publish"
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="TOTAL CREATED"
                    value={stats.totalCreated.toString()}
                    subtitle="All time"
                    icon={TrendingUp}
                    color="purple"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/editor/new" className="bg-[#0B0C15] border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all">
                    <Plus className="text-blue-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Create New Post</h3>
                    <p className="text-gray-400 text-sm mb-4">Start writing new content</p>
                    <div className="flex items-center text-blue-500 text-sm font-medium">
                        Create →
                    </div>
                </Link>

                <Link to="/editor/new" className="bg-[#0B0C15] border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all">
                    <Sparkles className="text-purple-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">AI Caption Generator</h3>
                    <p className="text-gray-400 text-sm mb-4">Let AI write for you</p>
                    <div className="flex items-center text-purple-500 text-sm font-medium">
                        Generate →
                    </div>
                </Link>

                <Link to="/calendar" className="bg-[#0B0C15] border border-green-500/30 rounded-xl p-6 hover:border-green-500/60 transition-all">
                    <Calendar className="text-green-500 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Content Calendar</h3>
                    <p className="text-gray-400 text-sm mb-4">View scheduled posts</p>
                    <div className="flex items-center text-green-500 text-sm font-medium">
                        View Calendar →
                    </div>
                </Link>
            </div>

            {/* My Content */}
            <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">My Recent Content</h3>
                    <Link to="/campaigns" className="text-sm text-blue-500 hover:text-blue-400 font-medium">
                        View All →
                    </Link>
                </div>

                {myContent.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText size={48} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 mb-4">No content yet. Start creating!</p>
                        <Link to="/editor/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
                            <Plus size={16} />
                            Create Your First Post
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myContent.map(content => (
                            <ContentCard key={content.id} content={content} />
                        ))}
                    </div>
                )}
            </div>

            {/* Tips & Resources */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Sparkles size={20} className="text-blue-400" />
                    Pro Tips for Great Content
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Use AI tools to generate engaging captions</li>
                    <li>• Keep captions concise and platform-appropriate</li>
                    <li>• Submit for review early to get feedback</li>
                    <li>• Check calendar to avoid scheduling conflicts</li>
                </ul>
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

const ContentCard = ({ content }) => {
    const statusColors = {
        DRAFT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        IN_REVIEW: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
        SCHEDULED: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };

    return (
        <Link
            to={`/editor/${content.id}`}
            className="bg-[#1F2937]/30 border border-[#1F2937] p-4 rounded-lg hover:border-blue-500/30 transition-colors"
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium text-sm flex-1 truncate">{content.title || 'Untitled'}</h4>
                <span className={`text-xs px-2 py-1 rounded border ${statusColors[content.status]} capitalize`}>
                    {content.status?.toLowerCase().replace('_', ' ')}
                </span>
            </div>
            <p className="text-gray-400 text-xs line-clamp-2 mb-2">{content.content || 'No content'}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{content.platform}</span>
                <span>{new Date(content.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
            </div>
        </Link>
    );
};

export default EditorDashboard;

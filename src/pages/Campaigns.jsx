import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Plus, Twitter, Instagram, Linkedin, FileText } from 'lucide-react';

const Campaigns = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Kanban columns definition
    const columns = [
        { id: 'DRAFT', label: 'Draft', color: 'bg-gray-800/50 border-gray-700' },
        { id: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-900/10 border-yellow-900/30' },
        { id: 'APPROVED', label: 'Approved', color: 'bg-green-900/10 border-green-900/30' },
        { id: 'SCHEDULED', label: 'Scheduled', color: 'bg-blue-900/10 border-blue-900/30' }
    ];

    useEffect(() => {
        // Real-time listener
        const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching campaigns:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'twitter': return <Twitter size={14} className="text-blue-400" />;
            case 'instagram': return <Instagram size={14} className="text-pink-400" />;
            case 'linkedin': return <Linkedin size={14} className="text-blue-600" />;
            default: return <FileText size={14} className="text-gray-400" />;
        }
    };

    const getPlatformBadgeColor = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'twitter': return 'bg-blue-900/30 text-blue-300 border-blue-800';
            case 'instagram': return 'bg-pink-900/30 text-pink-300 border-pink-800';
            case 'linkedin': return 'bg-blue-800/30 text-blue-200 border-blue-700';
            default: return 'bg-gray-800 text-gray-400 border-gray-700';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Campaign Board</h1>
                    <p className="text-gray-400 mt-1">Manage and track your content pipeline</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">
                    <Plus size={18} />
                    New Task
                </button>
            </div>

            {/* Kanban Board Container - Horizontal Scroll */}
            <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
                {columns.map((col) => (
                    <div key={col.id} className="min-w-[320px] flex flex-col">
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${col.id === 'DRAFT' ? 'bg-gray-500' :
                                        col.id === 'IN_REVIEW' ? 'bg-yellow-500' :
                                            col.id === 'APPROVED' ? 'bg-green-500' : 'bg-blue-500'
                                    }`} />
                                {col.label}
                            </h3>
                            <span className="text-xs text-gray-500 font-mono bg-gray-900 px-2 py-1 rounded-full border border-gray-800">
                                {posts.filter(p => p.status === col.id).length}
                            </span>
                        </div>

                        {/* Column Content */}
                        <div className={`flex-1 rounded-xl border border-dashed ${col.color} p-4 space-y-3`}>
                            {posts
                                .filter(post => post.status === col.id)
                                .map(post => (
                                    <Link
                                        key={post.id}
                                        to={`/editor/${post.id}`}
                                        className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/50 transition-all duration-200 group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border ${getPlatformBadgeColor(post.platform)}`}>
                                                {getPlatformIcon(post.platform)}
                                                {post.platform}
                                            </span>
                                        </div>

                                        <h4 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                            {post.title}
                                        </h4>

                                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                            {post.body || "No content description available for this post..."}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-800">
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                {post.assignedUser ? post.assignedUser.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <span>{post.assignedUser || 'Unassigned'}</span>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Campaigns;

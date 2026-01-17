import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, where } from 'firebase/firestore';
import { Plus, Instagram, Twitter, Linkedin, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Campaigns = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState('all');

    const columns = [
        { id: 'DRAFT', label: 'Drafting', count: 3 },
        { id: 'IN_REVIEW', label: 'In Review', count: 2 },
        { id: 'APPROVED', label: 'Approved', count: 1 },
    ];

    useEffect(() => {
        if (!userProfile?.organizationId) return;

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
        });
        return () => unsubscribe();
    }, [userProfile]);

    const handleCreateCampaign = async () => {
        if (!userProfile?.organizationId) return;

        try {
            const newCampaign = {
                title: 'Untitled Campaign',
                content: '',
                platform: 'Instagram',
                status: 'DRAFT',
                organizationId: userProfile.organizationId,
                createdBy: userProfile.email,
                createdAt: new Date()
            };
            const docRef = await addDoc(collection(db, 'content'), newCampaign);
            navigate(`/editor/${docRef.id}`);
        } catch (error) {
            console.error('Error creating campaign:', error);
        }
    };

    // Loading state
    if (!userProfile?.organizationId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/30 animate-pulse">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <p className="text-gray-400">Loading campaigns...</p>
                </div>
            </div>
        );
    }

    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'instagram': return <Instagram size={14} />;
            case 'twitter': return <Twitter size={14} />;
            case 'linkedin': return <Linkedin size={14} />;
            default: return <Instagram size={14} />;
        }
    };

    const getColumnPosts = (status) => {
        return posts.filter(post => post.status === status);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Campaign Workflow</h1>
                    <p className="text-gray-400 text-sm">Manage your content pipeline with style.</p>
                </div>
                <button
                    onClick={handleCreateCampaign}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    Create New Asset
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-[#1F2937]/50 text-white text-sm font-medium rounded-lg">
                    Filters
                </button>
                <button className="px-3 py-1.5 bg-[#1F2937]/50 text-gray-400 hover:text-white text-sm font-medium rounded-lg">
                    Instagram
                </button>
                <button className="px-3 py-1.5 bg-[#1F2937]/50 text-gray-400 hover:text-white text-sm font-medium rounded-lg">
                    LinkedIn
                </button>
                <button className="px-3 py-1.5 bg-[#1F2937]/50 text-gray-400 hover:text-white text-sm font-medium rounded-lg">
                    High Priority
                </button>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((column) => (
                    <div key={column.id} className="space-y-4">
                        {/* Column Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                    {column.label}
                                </h3>
                                <span className="px-2 py-0.5 bg-[#1F2937]/50 text-gray-400 text-xs font-semibold rounded">
                                    {getColumnPosts(column.id).length}
                                </span>
                            </div>
                            <button className="text-gray-500 hover:text-white">
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        {/* Cards */}
                        <div className="space-y-3">
                            {getColumnPosts(column.id).map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/editor/${post.id}`}
                                    className="block bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-4 hover:border-[#6366F1]/50 transition-colors group"
                                >
                                    {/* Image Placeholder */}
                                    <div className="w-full h-32 bg-[#1F2937]/30 rounded-lg mb-3 flex items-center justify-center">
                                        <span className="text-gray-600 text-sm">Preview</span>
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-sm font-semibold text-white mb-2 group-hover:text-[#6366F1] transition-colors">
                                        {post.title || 'Untitled Campaign'}
                                    </h4>

                                    {/* Meta */}
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                        {post.content || 'No description yet...'}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1.5 px-2 py-1 bg-[#1F2937]/50 text-gray-400 text-xs font-medium rounded">
                                                {getPlatformIcon(post.platform)}
                                                {post.platform}
                                            </span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                                            <span className="text-white text-[10px] font-bold">A</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* Add Card Button */}
                            <button
                                onClick={handleCreateCampaign}
                                className="w-full p-4 border-2 border-dashed border-[#1F2937]/50 hover:border-[#6366F1]/50 rounded-xl text-gray-500 hover:text-white transition-colors"
                            >
                                <Plus size={20} className="mx-auto mb-1" />
                                <span className="text-sm font-medium">Add Asset</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Campaigns;

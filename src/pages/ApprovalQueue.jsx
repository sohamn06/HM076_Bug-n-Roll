import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, approvePost, rejectPost } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Instagram,
    Twitter,
    Linkedin as LinkedIn,
    MessageSquare,
    User,
    ArrowRight
} from 'lucide-react';
import ApprovalModal from '../components/ApprovalModal';

const ApprovalQueue = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [pendingPosts, setPendingPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [modalMode, setModalMode] = useState('approve');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!userProfile) return;

        if (!userProfile.organizationId) {
            console.warn('No organizationId found for user');
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'content'),
            where('status', '==', 'IN_REVIEW'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const posts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPendingPosts(posts);
                setLoading(false);
            },
            (error) => {
                console.error('Approval Queue listener failed:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userProfile]);

    const handleOpenModal = (post, mode) => {
        setSelectedPost(post);
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const handleConfirm = async (data) => {
        if (!selectedPost) return;

        try {
            if (modalMode === 'approve') {
                await approvePost(
                    selectedPost.id,
                    userProfile.uid,
                    userProfile.name || 'Manager',
                    selectedPost.submittedBy,
                    selectedPost.title,
                    data
                );
            } else {
                await rejectPost(
                    selectedPost.id,
                    userProfile.uid,
                    userProfile.name || 'Manager',
                    selectedPost.submittedBy,
                    selectedPost.title,
                    data
                );
            }
        } catch (error) {
            console.error('Action failed:', error);
            throw error;
        }
    };

    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'instagram': return <Instagram size={16} className="text-pink-500" />;
            case 'twitter': return <Twitter size={16} className="text-blue-400" />;
            case 'linkedin': return <LinkedIn size={16} className="text-blue-600" />;
            default: return <Instagram size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Approval Queue</h1>
                    <p className="text-gray-400 text-sm">Review and approve content submitted by your team.</p>
                </div>
                <div className="px-4 py-2 bg-[#1F2937]/50 rounded-lg border border-[#1F2937] flex items-center gap-2">
                    <Clock size={16} className="text-yellow-500" />
                    <span className="text-white font-medium text-sm">
                        {pendingPosts.length} Pending Reviews
                    </span>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {pendingPosts.length === 0 ? (
                    <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-12 text-center">
                        <CheckCircle2 size={48} className="text-green-500/50 mx-auto mb-4" />
                        <h3 className="text-white text-lg font-semibold mb-2">Queue is Clear!</h3>
                        <p className="text-gray-500">There are no posts waiting for your review.</p>
                    </div>
                ) : (
                    pendingPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-6 hover:border-[#6366F1]/30 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Preview / Info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 bg-[#1F2937]/50 rounded text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                                            {getPlatformIcon(post.platform)}
                                            {post.platform}
                                        </span>
                                        <span className="text-xs text-gray-600">•</span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <User size={12} />
                                            {post.createdByName || 'Team Member'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white group-hover:text-[#6366F1] transition-colors line-clamp-1">
                                        {post.title || 'Untitled Campaign'}
                                    </h3>

                                    <p className="text-sm text-gray-400 line-clamp-2">
                                        {post.content || 'No content provided...'}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 lg:border-l lg:border-[#1F2937] lg:pl-6">
                                    <button
                                        onClick={() => navigate(`/editor/${post.id}`)}
                                        className="p-2.5 bg-[#1F2937]/50 hover:bg-[#1F2937] text-gray-400 hover:text-white rounded-xl transition-all"
                                        title="View Details"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(post, 'reject')}
                                        className="flex items-center gap-2 px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-500 text-sm font-semibold rounded-xl transition-all"
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(post, 'approve')}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all"
                                    >
                                        <CheckCircle2 size={18} />
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Approval Modal */}
            <ApprovalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                mode={modalMode}
                postTitle={selectedPost?.title || 'this post'}
            />
        </div>
    );
};

export default ApprovalQueue;

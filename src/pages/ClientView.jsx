import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPostByHash, approvePost, addComment } from '../firebase';
import { CheckCircle, MessageSquare, Globe, Instagram, Twitter, Linkedin, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ClientView = () => {
    const { hash } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [isApproved, setIsApproved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postData = await getPostByHash(hash);
                setPost(postData);
                if (postData?.status === 'APPROVED') setIsApproved(true);
            } catch (error) {
                console.error('Error loading shared post:', error);
            }
            setLoading(false);
        };
        fetchPost();
    }, [hash]);

    const handleApprove = async () => {
        if (isSubmitting || isApproved) return;
        setIsSubmitting(true);
        try {
            await approvePost(post.id, 'client-external', 'Client (via Link)', post.submittedBy, post.title, 'Approved via share link');
            if (feedback.trim()) {
                await addComment(post.id, 'client-external', 'Client (Feedback)', feedback);
            }
            setIsApproved(true);
            alert('Content approved! Thank you for your feedback.');
        } catch (error) {
            console.error('Approval failed:', error);
        }
        setIsSubmitting(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
        </div>
    );

    if (!post) return (
        <div className="min-h-screen bg-[#0B0C15] flex flex-col items-center justify-center text-center p-6">
            <Globe size={48} className="text-gray-600 mb-4" />
            <h1 className="text-white text-2xl font-bold mb-2">Link Expired or Invalid</h1>
            <p className="text-gray-400">This content is no longer available for public review.</p>
        </div>
    );

    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'instagram': return <Instagram size={20} className="text-pink-500" />;
            case 'twitter': return <Twitter size={20} className="text-blue-400" />;
            case 'linkedin': return <Linkedin size={20} className="text-blue-600" />;
            default: return <Instagram size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0C15] py-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#1F2937]/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl">Content Review</h1>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <Globe size={14} /> Shared View
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-[#1F2937]/20 border border-[#1F2937]/50 rounded-2xl overflow-hidden mb-8 shadow-2xl">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-[#1F2937]/50 rounded text-xs font-semibold text-gray-400 flex items-center gap-2">
                                {getPlatformIcon(post.platform)}
                                {post.platform}
                            </span>
                            <span className="text-gray-700">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                {post.createdAt?.seconds ? format(post.createdAt.toDate(), 'PPP') : 'Draft'}
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-white">{post.title || 'Untitled Campaign'}</h2>

                        <div className="bg-[#0B0C15] p-6 rounded-xl border border-[#1F2937]/50">
                            <p className="text-white leading-relaxed whitespace-pre-wrap">{post.content || 'No content drafted yet.'}</p>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-8 bg-[#1F2937]/40 border-t border-[#1F2937]/50">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                                <MessageSquare size={16} /> Feedback & Approval
                            </h3>

                            {!isApproved ? (
                                <>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Add any change requests or comments here..."
                                        rows="3"
                                        className="w-full bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#6366F1]/50 transition-all resize-none"
                                    />
                                    <button
                                        onClick={handleApprove}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle size={20} />
                                        {isSubmitting ? 'Processing...' : 'Approve Content'}
                                    </button>
                                </>
                            ) : (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                                    <CheckCircle size={32} className="text-green-500 mx-auto mb-3" />
                                    <h4 className="text-white font-bold mb-1">Content Approved</h4>
                                    <p className="text-gray-400 text-sm">Thank you for your review! Our team has been notified.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-xs tracking-widest uppercase">
                    Powered by STUDIO AI
                </p>
            </div>
        </div>
    );
};

export default ClientView;

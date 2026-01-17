import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Bold, Italic, Link as LinkIcon, List, Copy, Sparkles, Wand2, Save, ArrowLeft, Send, CheckCircle, XCircle, Share2, Twitter, Facebook, Linkedin, Instagram, MessageSquare, Globe } from 'lucide-react';
import { generateMarketingCopy } from '../aiService';
import { useAuth } from '../context/AuthContext';
import { submitPostForReview, approvePost, rejectPost, generateShareLink } from '../firebase';
import ApprovalModal from '../components/ApprovalModal';
import { connectPlatform, isPlatformConnected } from '../oauthService';
import { publishPost, addToQueue } from '../platformService';
import { getAuth } from 'firebase/auth';
import CommentSection from '../components/CommentSection';

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const auth = getAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [post, setPost] = useState({
        platform: 'Instagram',
        scheduledDate: '',
        status: 'DRAFT'
    });
    const [aiTopic, setAiTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [approvalMode, setApprovalMode] = useState('approve');
    const [isConnected, setIsConnected] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [shareHash, setShareHash] = useState(null);

    const isManager = userProfile?.role === 'MARKETER' || userProfile?.role === 'EDITOR';
    const isOwner = post.submittedBy === userProfile?.uid || post.createdBy === userProfile?.email;

    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                const docRef = doc(db, 'content', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title || '');
                    setContent(data.content || '');
                    setShareHash(data.shareHash || null);
                    setPost({
                        id: docSnap.id,
                        ...data
                    });
                }
            };
            fetchPost();
        }
    }, [id]);

    // Check connection status when platform changes
    useEffect(() => {
        const checkConnection = async () => {
            if (auth.currentUser && post.platform) {
                const connected = await isPlatformConnected(auth.currentUser.uid, post.platform.toLowerCase());
                setIsConnected(connected);
            }
        };
        checkConnection();
    }, [post.platform, auth.currentUser]);

    const handleConnect = async () => {
        if (!auth.currentUser) return;
        try {
            await connectPlatform(post.platform.toLowerCase());
            setIsConnected(true);
            setPublishStatus(`Connected to ${post.platform}`);
        } catch (error) {
            console.error(error);
            setPublishStatus(`Error: ${error.message}`);
        }
    };

    const handleSave = async () => {
        if (!userProfile?.organizationId) return;

        setIsSaving(true);
        try {
            const docRef = doc(db, 'content', id);
            await updateDoc(docRef, {
                title,
                content,
                platform: post.platform,
                scheduledDate: post.scheduledDate,
                status: post.status,
                organizationId: userProfile.organizationId,
                updatedAt: new Date()
            });
            setTimeout(() => setIsSaving(false), 1000);
        } catch (error) {
            console.error('Error saving:', error);
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!auth.currentUser) return;
        setIsPublishing(true);
        setPublishStatus('Publishing...');

        try {
            // Save first
            await handleSave();

            if (post.status === 'SCHEDULED' || (post.scheduledDate && new Date(post.scheduledDate) > new Date())) {
                // Schedule
                await addToQueue({
                    id, // pass ID to update status
                    title,
                    content,
                    platform: post.platform.toLowerCase()
                }, new Date(post.scheduledDate), auth.currentUser.uid);
                setPublishStatus('Scheduled successfully!');
            } else {
                // Direct Publish
                await publishPost({
                    id,
                    title,
                    content
                }, post.platform.toLowerCase(), auth.currentUser.uid);
                setPublishStatus('Published successfully!');
                setPost(prev => ({ ...prev, status: 'PUBLISHED' }));
            }
        } catch (error) {
            console.error(error);
            setPublishStatus(`Failed: ${error.message}`);
        }
        setIsPublishing(false);
    };

    const handleGenerateContent = async () => {
        if (!aiTopic) return;
        setIsGenerating(true);
        try {
            const generatedText = await generateMarketingCopy(aiTopic, post.platform);
            setContent(prev => prev + '\n\n' + generatedText);
        } catch (error) {
            console.error('Error generating content:', error);
        }
        setIsGenerating(false);
    };

    const handleSubmitForReview = async () => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            await submitPostForReview(id, userProfile.uid, userProfile.name || 'Team Member', title);
            setPost(prev => ({ ...prev, status: 'IN_REVIEW' }));
            alert('Post submitted for review!');
        } catch (error) {
            console.error('Submission failed:', error);
        }
        setIsSubmitting(false);
    };

    const handleApprovalAction = (mode) => {
        setApprovalMode(mode);
        setIsApprovalModalOpen(true);
    };

    const handleApprovalConfirm = async (data) => {
        if (!id) return;
        try {
            if (approvalMode === 'approve') {
                await approvePost(id, userProfile.uid, userProfile.name || 'Manager', post.submittedBy, title, data);
                setPost(prev => ({ ...prev, status: 'APPROVED' }));
            } else {
                await rejectPost(id, userProfile.uid, userProfile.name || 'Manager', post.submittedBy, title, data);
                setPost(prev => ({ ...prev, status: 'DRAFT' }));
            }
        } catch (error) {
            console.error('Approval action failed:', error);
            throw error;
        }
    };

    const handleShare = async () => {
        if (!id) return;
        try {
            const hash = await generateShareLink(id);
            setShareHash(hash);
            const shareUrl = `${window.location.origin}/share/${hash}`;
            await navigator.clipboard.writeText(shareUrl);
            alert('Share link copied to clipboard!');
        } catch (error) {
            console.error('Sharing failed:', error);
        }
    };

    return (
        <div className="flex -m-6 h-[calc(100vh-64px)] overflow-hidden">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-[#1F2937]/50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/campaigns')}
                            className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-white">Content Editor</h1>
                                {post.status && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${post.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        post.status === 'IN_REVIEW' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                        }`}>
                                        {post.status.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400">Craft your marketing masterpiece</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-green-400 mr-2 font-medium">{publishStatus}</div>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`p-2 rounded-lg transition-colors relative ${showComments ? 'bg-[#6366F1] text-white' : 'bg-[#1F2937]/50 text-gray-400 hover:text-white'
                                }`}
                            title="Discussion"
                        >
                            <MessageSquare size={18} />
                            {post.lastCommentAt && !showComments && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full border border-[#0B0C15]" />
                            )}
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 border border-[#1F2937] hover:bg-[#1F2937]/50 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                            title="Share for Client Review"
                        >
                            <Share2 size={16} />
                            Share
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1F2937]/50 hover:bg-[#1F2937] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </button>

                        {/* Junior Editor / Owner actions */}
                        {post.status === 'DRAFT' && (
                            <button
                                onClick={handleSubmitForReview}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Send size={16} />
                                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                            </button>
                        )}

                        {/* Manager / Approval actions */}
                        {post.status === 'IN_REVIEW' && isManager && (
                            <>
                                <button
                                    onClick={() => handleApprovalAction('reject')}
                                    className="flex items-center gap-2 px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-500 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprovalAction('approve')}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <CheckCircle size={16} />
                                    Approve
                                </button>
                            </>
                        )}

                        {/* Publish button (only if approved or already published) */}
                        {(post.status === 'APPROVED' || post.status === 'PUBLISHED') && (
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || !isConnected}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-[#6366F1]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPublishing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Share2 size={16} />
                                )}
                                {post.scheduledDate && new Date(post.scheduledDate) > new Date() ? 'Schedule' : 'Publish Now'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Editor Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Editor - 2/3 width */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Title Input */}
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Campaign Title..."
                            className="w-full bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl px-6 py-4 text-2xl font-bold text-white placeholder-gray-600 outline-none focus:border-[#6366F1]/50 transition-colors"
                        />

                        {/* Toolbar */}
                        <div className="flex items-center gap-2 p-2 bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl">
                            <button className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <Bold size={18} />
                            </button>
                            <button className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <Italic size={18} />
                            </button>
                            <button className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <LinkIcon size={18} />
                            </button>
                            <button className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <List size={18} />
                            </button>
                            <div className="flex-1"></div>
                            <button className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <Copy size={18} />
                            </button>
                        </div>

                        {/* Content Textarea */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your content..."
                            className="w-full h-[500px] bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6 text-white placeholder-gray-600 outline-none focus:border-[#6366F1]/50 transition-colors resize-none"
                        />
                    </div>

                    {/* Sidebar - 1/3 width */}
                    <div className="space-y-4">
                        {/* Connection Panel */}
                        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white text-sm">Target Platform</h3>
                                {isConnected ? (
                                    <span className="text-xs text-green-400 px-2 py-1 bg-green-400/10 rounded-full font-medium">Connected</span>
                                ) : (
                                    <button onClick={handleConnect} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                                        + Connect
                                    </button>
                                )}
                            </div>

                            <select
                                value={post.platform}
                                onChange={(e) => setPost({ ...post, platform: e.target.value })}
                                className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#6366F1]/50 transition-colors"
                            >
                                <option>Twitter</option>
                                <option>Facebook</option>
                                <option>LinkedIn</option>
                                <option>Instagram</option>
                            </select>

                            {!isConnected && (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <p className="text-xs text-yellow-500">
                                        Connect your account to publish directly.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* AI Assistant */}
                        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6 space-y-4">
                            <div className="flex items-center gap-2 text-[#6366F1]">
                                <Wand2 size={20} />
                                <h3 className="font-semibold text-sm uppercase tracking-wider">AI Sidekick</h3>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Topic / Prompt
                                </label>
                                <textarea
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    placeholder="e.g. Summer Sale announcement..."
                                    className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg p-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#6366F1]/50 transition-colors h-24 resize-none"
                                />
                            </div>

                            <button
                                onClick={handleGenerateContent}
                                disabled={isGenerating || !aiTopic}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Generate Magic
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Post Settings */}
                        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6 space-y-4">
                            <h3 className="font-semibold text-white text-sm">Post Settings</h3>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Status
                                </label>
                                <select
                                    value={post.status}
                                    onChange={(e) => setPost({ ...post, status: e.target.value })}
                                    className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#6366F1]/50 transition-colors"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="IN_REVIEW">In Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Schedule Date
                                </label>
                                <input
                                    type="date"
                                    value={post.scheduledDate}
                                    onChange={(e) => setPost({ ...post, scheduledDate: e.target.value })}
                                    className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#6366F1]/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                {post.status === 'IN_REVIEW' && !isManager && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-400 text-sm flex items-center gap-3">
                        <Clock size={16} />
                        This post is currently under review. You can't edit it until it's approved or rejected.
                    </div>
                )}

                {post.rejectionReason && post.status === 'DRAFT' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                        <div className="flex items-center gap-2 font-bold mb-1">
                            <XCircle size={14} />
                            Post Rejected
                        </div>
                        <p className="italic">Reason: {post.rejectionReason}</p>
                    </div>
                )}

                {post.approvalNotes && post.status === 'APPROVED' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm">
                        <div className="flex items-center gap-2 font-bold mb-1">
                            <CheckCircle size={14} />
                            Approval Notes
                        </div>
                        <p className="italic">{post.approvalNotes}</p>
                    </div>
                )}

                <ApprovalModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    onConfirm={handleApprovalConfirm}
                    mode={approvalMode}
                    postTitle={title}
                />
            </div>

            {showComments && <CommentSection postId={id} />}
        </div>
    );
};

export default Editor;

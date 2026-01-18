import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Bold, Italic, Link as LinkIcon, List, Copy, Sparkles, Wand2, Save, ArrowLeft, Send, CheckCircle, XCircle, Share2, Twitter, Facebook, Linkedin, Instagram, MessageSquare, Globe, ImageIcon, Zap, X, ChevronDown } from 'lucide-react';
import { generateCaption, generateImage, adaptContentForAllPlatforms } from '../aiService';
import { useAuth } from '../context/AuthContext';
import { submitPostForReview, approvePost, rejectPost, generateShareLink } from '../firebase';
import ApprovalModal from '../components/ApprovalModal';
import { connectPlatform, isPlatformConnected } from '../oauthService';
import { publishPost, addToQueue } from '../platformService';
import { getAuth } from 'firebase/auth';
import CommentSection from '../components/CommentSection';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import ImageGeneratorModal from '../components/ImageGeneratorModal';

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const auth = getAuth();

    // Ref for textarea to track cursor position
    const contentRef = React.useRef(null);

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

    // Formatting toggle states
    const [isBoldActive, setIsBoldActive] = useState(false);
    const [isItalicActive, setIsItalicActive] = useState(false);

    // AI Features State
    const [aiTone, setAiTone] = useState('casual');
    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [showAdapterModal, setShowAdapterModal] = useState(false);
    const [showImageGeneratorModal, setShowImageGeneratorModal] = useState(false);
    const [adaptedContent, setAdaptedContent] = useState(null);

    const [isAdapting, setIsAdapting] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        caption: true,
        image: false,
        adapter: false,
        settings: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const isManager = hasPermission(userProfile?.role, PERMISSIONS.APPROVE_CONTENT);
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
                    if (data.generatedImage) {
                        setGeneratedImage(data.generatedImage);
                    }
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
                generatedImage: generatedImage, // Persist the image data (URL or Base64)
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
            const generatedText = await generateCaption(aiTopic, post.platform, aiTone);
            setContent(generatedText);
        } catch (error) {
            console.error('Error generating content:', error);
        }
        setIsGenerating(false);
    };

    const handleImageSelected = (url) => {
        setGeneratedImage({ success: true, imageUrl: url, isBase64: false });
        // Optionally update content to reference image if needed
    };

    const handleAdaptContent = async () => {
        if (!content) return;
        setIsAdapting(true);
        try {
            const adapted = await adaptContentForAllPlatforms(content);
            setAdaptedContent(adapted);
            setShowAdapterModal(true);
        } catch (error) {
            console.error('Error adapting content:', error);
        }
        setIsAdapting(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    // Render markdown to HTML for preview
    const renderMarkdown = (text) => {
        if (!text) return '';

        let html = text;

        // Convert bold (**text** or __text__)
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Convert italic (*text* or _text_)
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');

        // Convert links [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-400 hover:underline">$1</a>');

        // Convert line breaks
        html = html.replace(/\n/g, '<br />');

        // Convert bullet points
        html = html.replace(/• (.+?)(<br \/>|$)/g, '<li>$1</li>');

        return html;
    };

    // Text formatting functions for toolbar
    const insertFormatting = (before, after = before) => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

        setContent(newText);

        // Restore focus and cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length + after.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleBold = () => {
        setIsBoldActive(!isBoldActive);
        if (!isBoldActive) {
            // Toggle on - wrap selected text or place markers
            insertFormatting('**', '**');
        }
    };

    const handleItalic = () => {
        setIsItalicActive(!isItalicActive);
        if (!isItalicActive) {
            // Toggle on - wrap selected text or place markers
            insertFormatting('*', '*');
        }
    };

    const handleLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            const textarea = contentRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = content.substring(start, end) || 'link text';

            // Ensure URL has proper format
            let formattedUrl = url.trim();
            if (!formattedUrl.match(/^https?:\/\//i)) {
                formattedUrl = 'https://' + formattedUrl;
            }

            const linkMarkdown = `[${selectedText}](${formattedUrl})`;
            const newText = content.substring(0, start) + linkMarkdown + content.substring(end);
            setContent(newText);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length);
            }, 0);
        }
    };

    const handleList = () => {
        const textarea = contentRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        if (selectedText) {
            // Convert selected lines to bullet list
            const lines = selectedText.split('\n');
            const bulletList = lines.map(line => line.trim() ? `• ${line}` : line).join('\n');
            const newText = content.substring(0, start) + bulletList + content.substring(end);
            setContent(newText);
        } else {
            // Insert a new bullet point
            const newText = content.substring(0, start) + '• ' + content.substring(end);
            setContent(newText);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + 2, start + 2);
            }, 0);
        }
    };

    const handleCopyContent = () => {
        copyToClipboard(content);
        alert('Content copied to clipboard!');
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
        <div className="flex-1 flex flex-col h-full min-h-0 bg-[#030712] overflow-hidden">
            {/* Header - Fixed at top */}
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-[#1F2937]/50 bg-[#030712] z-20">
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

            {/* Content Body - Independent Scrolls */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {/* Editor Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-6 overflow-hidden">
                    {/* Main Editor - 2/3 width */}
                    <div className="lg:col-span-2 space-y-4 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-700 scrollbar-track-transparent">
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
                            <button
                                onClick={handleBold}
                                className={`p-2 rounded-lg transition-colors ${isBoldActive
                                    ? 'bg-[#6366F1] text-white'
                                    : 'hover:bg-[#1F2937]/50 text-gray-400 hover:text-white'
                                    }`}
                                title="Bold (Ctrl+B)"
                            >
                                <Bold size={18} />
                            </button>
                            <button
                                onClick={handleItalic}
                                className={`p-2 rounded-lg transition-colors ${isItalicActive
                                    ? 'bg-[#6366F1] text-white'
                                    : 'hover:bg-[#1F2937]/50 text-gray-400 hover:text-white'
                                    }`}
                                title="Italic (Ctrl+I)"
                            >
                                <Italic size={18} />
                            </button>
                            <button
                                onClick={handleLink}
                                className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                                title="Insert Link"
                            >
                                <LinkIcon size={18} />
                            </button>
                            <button
                                onClick={handleList}
                                className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                                title="Bullet List"
                            >
                                <List size={18} />
                            </button>
                            <div className="flex-1"></div>
                            <button
                                onClick={handleCopyContent}
                                className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                                title="Copy Content"
                            >
                                <Copy size={18} />
                            </button>
                        </div>

                        {/* Content Textarea */}
                        <textarea
                            ref={contentRef}
                            value={content}
                            onChange={(e) => {
                                const textarea = contentRef.current;
                                const newValue = e.target.value;
                                const cursorPos = textarea.selectionStart;

                                // If text is being added and formatting is active
                                if (newValue.length > content.length) {
                                    const addedText = newValue.substring(cursorPos - 1, cursorPos);

                                    if (isBoldActive || isItalicActive) {
                                        // Build the formatted text
                                        let formattedText = addedText;
                                        let offset = 0;

                                        if (isBoldActive) {
                                            formattedText = '**' + formattedText + '**';
                                            offset += 2;
                                        }
                                        if (isItalicActive) {
                                            formattedText = '*' + formattedText + '*';
                                            offset += 1;
                                        }

                                        const beforeCursor = newValue.substring(0, cursorPos - 1);
                                        const afterCursor = newValue.substring(cursorPos);
                                        const finalText = beforeCursor + formattedText + afterCursor;

                                        setContent(finalText);

                                        // Set cursor position after the formatted text
                                        setTimeout(() => {
                                            textarea.setSelectionRange(cursorPos + formattedText.length - 1, cursorPos + formattedText.length - 1);
                                        }, 0);
                                        return;
                                    }
                                }

                                setContent(newValue);
                            }}
                            placeholder="Start writing your content..."
                            className="w-full h-64 bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6 text-white placeholder-gray-600 outline-none focus:border-[#6366F1]/50 transition-colors resize-none"
                        />

                        {/* Live Preview */}
                        {(generatedImage?.success || content) && (
                            <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">📱 Post Preview</h3>
                                <div className="bg-[#1F2937]/30 rounded-lg p-4 space-y-4">
                                    {/* Generated Image */}
                                    {generatedImage?.success && (
                                        <div className="rounded-lg overflow-hidden">
                                            <img
                                                src={generatedImage.isBase64 ? `data:image/png;base64,${generatedImage.imageUrl}` : generatedImage.imageUrl}
                                                alt="Generated"
                                                className="w-full h-auto"
                                            />
                                        </div>
                                    )}

                                    {/* Caption */}
                                    {content && (
                                        <div
                                            className="text-white text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

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
                    </div>

                    {/* Sidebar - 1/3 width */}
                    <div className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {/* Connection Panel */}
                        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-4 space-y-3">
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

                        {/* AI Caption Generator */}
                        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-[#6366F1]">
                                <Wand2 size={20} />
                                <h3 className="font-semibold text-sm uppercase tracking-wider">AI Caption Generator</h3>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Platform
                                </label>
                                <select
                                    value={post.platform}
                                    onChange={(e) => setPost({ ...post, platform: e.target.value })}
                                    className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#6366F1]/50 transition-colors"
                                >
                                    <option>Instagram</option>
                                    <option>Twitter</option>
                                    <option>LinkedIn</option>
                                    <option>Facebook</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Tone
                                </label>
                                <select
                                    value={aiTone}
                                    onChange={(e) => setAiTone(e.target.value)}
                                    className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#6366F1]/50 transition-colors"
                                >
                                    <option value="professional">🎯 Professional</option>
                                    <option value="casual">😊 Casual</option>
                                    <option value="playful">🎉 Playful</option>
                                    <option value="inspirational">✨ Inspirational</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Topic / Prompt
                                </label>
                                <textarea
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    placeholder="e.g. summer sale announcement..."
                                    className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg p-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#6366F1]/50 transition-colors h-16 resize-none"
                                />
                            </div>

                            <button
                                onClick={handleGenerateContent}
                                disabled={isGenerating || !aiTopic}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Generate Caption
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-[#6366F1]">
                                <ImageIcon size={20} />
                                <h3 className="font-semibold text-sm uppercase tracking-wider">AI Image Generator</h3>
                            </div>

                            <p className="text-xs text-gray-400">
                                Create unique visuals for your campaign using AI.
                            </p>

                            <button
                                onClick={() => setShowImageGeneratorModal(true)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1F2937]/50 hover:bg-[#1F2937] text-white font-semibold rounded-lg transition-all text-sm border border-[#1F2937]"
                            >
                                <Wand2 size={16} className="text-[#6366F1]" />
                                Open Generator
                            </button>

                            {generatedImage?.success && !generatedImage.isBase64 && (
                                <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                                    <CheckCircle size={12} />
                                    Image attached
                                </div>
                            )}
                        </div>

                        {/* Multi-Platform Adapter */}
                        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-[#6366F1]">
                                <Zap size={20} />
                                <h3 className="font-semibold text-sm uppercase tracking-wider">Multi-Platform Adapter</h3>
                            </div>

                            <p className="text-xs text-gray-500">
                                Adapt your content for all platforms instantly
                            </p>

                            <button
                                onClick={handleAdaptContent}
                                disabled={isAdapting || !content}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isAdapting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adapting...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={18} />
                                        Adapt for All Platforms
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Post Settings */}
                        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-4 space-y-3">
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







                <ApprovalModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    onConfirm={handleApprovalConfirm}
                    mode={approvalMode}
                    postTitle={title}
                />

                <ImageGeneratorModal
                    isOpen={showImageGeneratorModal}
                    onClose={() => setShowImageGeneratorModal(false)}
                    onImageSelected={handleImageSelected}
                />

                {/* Multi-Platform Adapter Modal */}
                {showAdapterModal && adaptedContent && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Multi-Platform Preview</h2>
                                <button
                                    onClick={() => setShowAdapterModal(false)}
                                    className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['instagram', 'twitter', 'linkedin', 'facebook'].map((platform) => (
                                    <div key={platform} className="bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-white capitalize">{platform}</h3>
                                            <button
                                                onClick={() => copyToClipboard(adaptedContent[platform]?.content || '')}
                                                className="text-xs px-2 py-1 bg-[#6366F1] hover:bg-[#5558E3] text-white rounded transition-colors"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-300 whitespace-pre-wrap mb-2 max-h-40 overflow-y-auto">
                                            {adaptedContent[platform]?.content}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`${adaptedContent[platform]?.withinLimit ? 'text-green-400' : 'text-red-400'}`}>
                                                {adaptedContent[platform]?.length || 0} / {adaptedContent[platform]?.limit || 0}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {showComments && <CommentSection postId={id} />}
            </div>
        </div>
    );
};

export default Editor;

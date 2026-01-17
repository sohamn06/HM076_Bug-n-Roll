import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Bold, Italic, Link as LinkIcon, List, Copy, Sparkles, Wand2, Save, ArrowLeft, ImageIcon, Zap, X, ChevronDown } from 'lucide-react';
import { generateCaption, generateImage, adaptContentForAllPlatforms } from '../aiService';
import { useAuth } from '../context/AuthContext';

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [post, setPost] = useState({
        platform: 'Instagram',
        scheduledDate: '',
        status: 'DRAFT'
    });
    const [aiTopic, setAiTopic] = useState('');
    const [aiTone, setAiTone] = useState('casual');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Image Generation State
    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    // Multi-Platform Adapter State
    const [showAdapterModal, setShowAdapterModal] = useState(false);
    const [adaptedContent, setAdaptedContent] = useState(null);
    const [isAdapting, setIsAdapting] = useState(false);

    // Collapsible sections state
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

    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                const docRef = doc(db, 'content', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title || '');
                    setContent(data.content || '');
                    setPost({
                        platform: data.platform || 'Instagram',
                        scheduledDate: data.scheduledDate || '',
                        status: data.status || 'DRAFT'
                    });
                }
            };
            fetchPost();
        }
    }, [id]);

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

    const handleGenerateContent = async () => {
        if (!aiTopic) return;
        setIsGenerating(true);
        try {
            const generatedText = await generateCaption(aiTopic, post.platform, aiTone);
            setContent(prev => prev + '\n\n' + generatedText);
        } catch (error) {
            console.error('Error generating content:', error);
        }
        setIsGenerating(false);
    };

    const handleGenerateImage = async () => {
        if (!imagePrompt) return;
        setIsGeneratingImage(true);
        try {
            const result = await generateImage(imagePrompt);
            setGeneratedImage(result);
        } catch (error) {
            setGeneratedImage({ success: false, error: error.message });
        }
        setIsGeneratingImage(false);
    };

    const handleAdaptContent = async () => {
        if (!content.trim()) return;
        setIsAdapting(true);
        setShowAdapterModal(true);
        try {
            const result = await adaptContentForAllPlatforms(content);
            setAdaptedContent(result);
        } catch (error) {
            setAdaptedContent({ error: error.message });
        }
        setIsAdapting(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/campaigns')}
                        className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Content Editor</h1>
                        <p className="text-sm text-gray-400">Craft your marketing masterpiece</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1F2937]/50 hover:bg-[#1F2937] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium rounded-lg transition-colors">
                        Publish
                    </button>
                </div>
            </div>

            {/* Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)]">
                {/* Main Editor - 2/3 width - SCROLLABLE */}
                <div className="lg:col-span-2 space-y-4 h-full overflow-y-auto pr-4">
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
                                            src={`data:image/png;base64,${generatedImage.imageUrl}`}
                                            alt="Generated"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                )}

                                {/* Caption */}
                                {content && (
                                    <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                                        {content}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - 1/3 width - STICKY & SCROLLABLE */}
                <div className="lg:sticky lg:top-4 h-full overflow-y-auto space-y-4 pr-2">
                    {/* AI Caption Generator */}
                    <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-5 space-y-3">
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
                                placeholder="e.g. Summer Sale announcement..."
                                className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg p-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#6366F1]/50 transition-colors h-20 resize-none"
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
                                    <Sparkles size={16} />
                                    Generate Caption
                                </>
                            )}
                        </button>
                    </div>

                    {/* AI Image Generator */}
                    <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-[#3B82F6]">
                            <ImageIcon size={20} />
                            <h3 className="font-semibold text-sm uppercase tracking-wider">AI Image Generator</h3>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                Image Description
                            </label>
                            <textarea
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder="e.g. Modern tech startup team collaborating..."
                                className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-lg p-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#3B82F6]/50 transition-colors h-20 resize-none"
                            />
                        </div>

                        <button
                            onClick={handleGenerateImage}
                            disabled={isGeneratingImage || !imagePrompt}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isGeneratingImage ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={16} />
                                    Generate Image
                                </>
                            )}
                        </button>

                        {generatedImage && (
                            <div className="mt-3 p-3 bg-[#1F2937]/30 rounded-lg border border-[#1F2937]/50">
                                {generatedImage.success ? (
                                    <div>
                                        <p className="text-xs font-medium text-green-400 mb-2">✅ Image Generated!</p>
                                        {generatedImage.isBase64 ? (
                                            <img
                                                src={`data:image/png;base64,${generatedImage.imageUrl}`}
                                                alt="Generated"
                                                className="w-full rounded-lg"
                                            />
                                        ) : (
                                            <img
                                                src={generatedImage.imageUrl}
                                                alt="Generated"
                                                className="w-full rounded-lg"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-medium text-yellow-400 mb-2">💡 {generatedImage.error}</p>
                                        {generatedImage.suggestion && (
                                            <p className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">{generatedImage.suggestion}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Multi-Platform Adapter */}
                    <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-[#10B981]">
                            <Zap size={20} />
                            <h3 className="font-semibold text-sm uppercase tracking-wider">Multi-Platform Adapter</h3>
                        </div>

                        <p className="text-xs text-gray-400">Adapt your content for all platforms instantly</p>

                        <button
                            onClick={handleAdaptContent}
                            disabled={isAdapting || !content.trim()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isAdapting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Adapting...
                                </>
                            ) : (
                                <>
                                    <Zap size={16} />
                                    Adapt for All Platforms
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

            {/* Multi-Platform Adapter Modal */}
            {showAdapterModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
                    <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Zap className="text-[#10B981]" size={24} />
                                <h2 className="text-2xl font-bold text-white">Multi-Platform Content Adapter</h2>
                            </div>
                            <button
                                onClick={() => setShowAdapterModal(false)}
                                className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {adaptedContent && !adaptedContent.error ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['instagram', 'twitter', 'linkedin', 'facebook'].map(platform => {
                                    const data = adaptedContent[platform];
                                    const platformColors = {
                                        instagram: 'border-pink-500/50 bg-pink-500/5',
                                        twitter: 'border-blue-500/50 bg-blue-500/5',
                                        linkedin: 'border-indigo-500/50 bg-indigo-500/5',
                                        facebook: 'border-blue-400/50 bg-blue-400/5'
                                    };

                                    return (
                                        <div key={platform} className={`p-4 rounded-lg border-2 ${platformColors[platform]}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-bold text-lg capitalize text-white">{platform}</h3>
                                                <button
                                                    onClick={() => copyToClipboard(data.content)}
                                                    className="px-3 py-1 bg-[#1F2937]/50 hover:bg-[#1F2937] text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                                                >
                                                    <Copy size={12} />
                                                    Copy
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3 min-h-[100px]">{data.content}</p>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-400">Chars: {data.length}/{data.limit}</span>
                                                <span className={data.withinLimit ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                                                    {data.withinLimit ? '✅ Within limit' : '❌ Exceeds limit'}
                                                </span>
                                            </div>
                                            {data.hashtags && data.hashtags.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Hashtags: {data.hashtags.length}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : adaptedContent?.error ? (
                            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                                <p className="text-sm font-medium text-red-400">Error: {adaptedContent.error}</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;

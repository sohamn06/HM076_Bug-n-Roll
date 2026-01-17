import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Bold, Italic, Link as LinkIcon, List, Copy, Sparkles, Wand2, Save, ArrowLeft } from 'lucide-react';
import { generateMarketingCopy } from '../aiService';
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
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
            const generatedText = await generateMarketingCopy(aiTopic, post.platform);
            setContent(prev => prev + '\n\n' + generatedText);
        } catch (error) {
            console.error('Error generating content:', error);
        }
        setIsGenerating(false);
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
                    {/* AI Assistant */}
                    <div className="bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-[#6366F1]">
                            <Wand2 size={20} />
                            <h3 className="font-semibold text-sm uppercase tracking-wider">AI Sidekick</h3>
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
        </div>
    );
};

export default Editor;

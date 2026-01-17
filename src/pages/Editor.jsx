import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
    ArrowLeft,
    Save,
    Send,
    CheckCircle,
    Bot,
    Sparkles,
    Loader2
} from 'lucide-react';

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const docRef = doc(db, 'content', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPost({ id: docSnap.id, ...data });
                    setContent(data.body || '');
                } else {
                    console.log("No such document!");
                    navigate('/campaigns');
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, navigate]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'content', id);
            await updateDoc(docRef, {
                body: content,
                updatedAt: serverTimestamp()
            });
            console.log("Document saved!");
        } catch (error) {
            console.error("Error updating document:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setSaving(true);
        try {
            const docRef = doc(db, 'content', id);
            await updateDoc(docRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            setPost(prev => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: 'bg-gray-800 text-gray-400 border-gray-700',
            IN_REVIEW: 'bg-yellow-900/30 text-yellow-300 border-yellow-800',
            APPROVED: 'bg-green-900/30 text-green-300 border-green-800',
            SCHEDULED: 'bg-blue-900/30 text-blue-300 border-blue-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.DRAFT}`}>
                {status?.replace('_', ' ')}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-3">
                            {post.title}
                            {getStatusBadge(post.status)}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Platform: <span className="text-blue-400">{post.platform}</span> • Assigned to: {post.assignedUser}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 border border-blue-600/30 text-blue-400 hover:bg-blue-600/10 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Draft
                    </button>

                    {post.status === 'DRAFT' && (
                        <button
                            onClick={() => handleStatusChange('IN_REVIEW')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            <Send size={16} />
                            Submit for Review
                        </button>
                    )}

                    {post.status === 'IN_REVIEW' && (
                        <button
                            onClick={() => handleStatusChange('APPROVED')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            <CheckCircle size={16} />
                            Approve
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Editor Column */}
                <div className="lg:col-span-2 flex flex-col space-y-2 h-full">
                    <label className="text-sm font-medium text-gray-400">Content Editor</label>
                    <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your awesome content here..."
                            className="w-full h-full bg-transparent p-6 text-gray-300 resize-none focus:outline-none"
                        />
                    </div>
                </div>

                {/* AI Assistant Sidebar */}
                <div className="lg:col-span-1 flex flex-col space-y-2 h-full">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Bot size={16} className="text-purple-400" />
                        AI Assistant
                    </label>
                    <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col">
                        <div className="flex-1 space-y-4">
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    👋 Hi! I can help you write content for <span className="text-blue-400">{post.platform}</span>.
                                    Try asking me to generate a hook or optimize your draft!
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <button
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg transition-all font-medium text-sm shadow-lg shadow-purple-900/30"
                            >
                                <Sparkles size={16} />
                                Generate Ideas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Editor;

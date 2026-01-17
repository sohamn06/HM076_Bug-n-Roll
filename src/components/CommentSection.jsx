import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, addComment } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, User, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CommentSection = ({ postId }) => {
    const { userProfile } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!postId) return;

        const q = query(
            collection(db, 'content', postId, 'comments'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter(c => !c.deleted);
            setComments(commentsData);

            // Scroll to bottom on new message
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        return () => unsubscribe();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addComment(postId, userProfile.uid, userProfile.name || 'Team Member', newComment);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#0B0C15] border-l border-[#1F2937]/50 w-80">
            {/* Header */}
            <div className="p-4 border-b border-[#1F2937]/50 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#6366F1]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Comments</h3>
                <span className="ml-auto px-2 py-0.5 bg-[#1F2937] text-gray-400 text-[10px] font-bold rounded-full">
                    {comments.length}
                </span>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <MessageSquare size={32} className="mb-2" />
                        <p className="text-xs text-gray-500">No comments yet.<br />Start the conversation!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#6366F1]">
                                    {comment.userName}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    {comment.createdAt?.seconds ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                </span>
                            </div>
                            <div className="bg-[#1F2937]/30 p-2.5 rounded-lg border border-[#1F2937]/50">
                                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {comment.text}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#1F2937]/50">
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows="2"
                        className="w-full bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#6366F1]/50 transition-all resize-none pr-10"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="absolute right-2 bottom-3 p-1.5 text-gray-500 hover:text-[#6366F1] disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </form>
                <p className="mt-2 text-[10px] text-gray-600">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
};

export default CommentSection;

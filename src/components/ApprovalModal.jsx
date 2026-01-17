import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

const ApprovalModal = ({ isOpen, onClose, onConfirm, mode, postTitle }) => {
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (mode === 'approve') {
                await onConfirm(notes);
            } else {
                if (!reason.trim()) {
                    alert('Please provide a rejection reason');
                    setIsSubmitting(false);
                    return;
                }
                await onConfirm(reason);
            }
            setNotes('');
            setReason('');
            onClose();
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#0B0C15] border border-[#1F2937]/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {mode === 'approve' ? (
                            <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-400" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                <XCircle size={20} className="text-red-400" />
                            </div>
                        )}
                        <h2 className="text-xl font-semibold text-white">
                            {mode === 'approve' ? 'Approve Post' : 'Reject Post'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#1F2937]/50 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-gray-400 mb-4">
                        {mode === 'approve'
                            ? `Are you sure you want to approve "${postTitle}"?`
                            : `Are you sure you want to reject "${postTitle}"?`
                        }
                    </p>

                    {mode === 'approve' ? (
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                Approval Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any comments or feedback..."
                                className="w-full px-4 py-3 rounded-lg bg-[#1F2937]/30 border border-[#1F2937] text-white placeholder-gray-600 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all resize-none"
                                rows="4"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                Rejection Reason *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please explain why this post is being rejected..."
                                className="w-full px-4 py-3 rounded-lg bg-[#1F2937]/30 border border-[#1F2937] text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                                rows="4"
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-lg bg-[#1F2937]/50 hover:bg-[#1F2937] text-white font-medium transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${mode === 'approve'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                    >
                        {isSubmitting ? 'Processing...' : mode === 'approve' ? 'Approve' : 'Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApprovalModal;

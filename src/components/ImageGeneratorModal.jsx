import React, { useState } from 'react';
import { X, Wand2, RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { generateImage } from '../aiService';
import { uploadFile, saveAssetToFirestore } from '../firebase';
import { useAuth } from '../context/AuthContext';

const ImageGeneratorModal = ({ isOpen, onClose, onImageSelected }) => {
    const { userProfile } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null); // base64 string or URL
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setGenerating(true);
        setError('');
        setGeneratedImage(null);

        try {
            const result = await generateImage(prompt);

            if (result.success) {
                // If it's a raw base64 string (no schema), prepend schema for display
                const imageUrl = result.isBase64 && !result.imageUrl.startsWith('data:')
                    ? `data:image/png;base64,${result.imageUrl}`
                    : result.imageUrl;

                setGeneratedImage(imageUrl);
            } else {
                setError(result.error || 'Failed to generate image');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const handleUseImage = async () => {
        if (!generatedImage) return;

        // SKIP UPLOAD - Pass Base64 directly to Editor
        // This avoids Firebase Storage quota issues.
        onImageSelected(generatedImage);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f111a] rounded-xl border border-[#1F2937] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1F2937]">
                    <div className="flex items-center gap-2">
                        <Wand2 className="text-[#6366F1]" size={24} />
                        <h2 className="text-xl font-semibold text-white">AI Image Generator</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Prompt Input */}
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Describe the image you want to create
                            </label>
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="A futuristic city with neon lights and flying cars..."
                                    className="w-full bg-[#1F2937]/50 border border-[#1F2937] rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366F1] transition-colors resize-none h-32"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={generating || !prompt.trim()}
                                    className="absolute bottom-4 right-4 bg-[#6366F1] hover:bg-[#5558E3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={16} />
                                            Generate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Result Area */}
                    <div className="bg-[#1F2937]/30 rounded-xl min-h-[300px] flex items-center justify-center border border-[#1F2937] border-dashed">
                        {error ? (
                            <div className="text-center p-6">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <p className="text-red-400">{error}</p>
                            </div>
                        ) : generatedImage ? (
                            <div className="relative group w-full h-full">
                                <img
                                    src={generatedImage}
                                    alt="Generated"
                                    className="w-full h-full object-contain max-h-[400px] rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Enter a prompt above to generate an image</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#1F2937] flex justify-end gap-3 bg-[#0f111a]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    {generatedImage && (
                        <button
                            onClick={handleUseImage}
                            disabled={uploading}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Use This Image
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorModal;

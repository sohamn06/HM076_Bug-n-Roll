import React, { useState } from 'react';
import {
    generateCaption,
    generateImage,
    adaptContentForAllPlatforms
} from '../aiService';
import { Sparkles, Image as ImageIcon, Zap, Loader2 } from 'lucide-react';

const TestAI = () => {
    // Caption Generation State
    const [captionTopic, setCaptionTopic] = useState('');
    const [captionPlatform, setCaptionPlatform] = useState('Instagram');
    const [captionTone, setCaptionTone] = useState('casual');
    const [generatedCaption, setGeneratedCaption] = useState('');
    const [captionLoading, setCaptionLoading] = useState(false);

    // Image Generation State
    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);

    // Multi-Platform Adapter State
    const [originalContent, setOriginalContent] = useState('');
    const [adaptedContent, setAdaptedContent] = useState(null);
    const [adapterLoading, setAdapterLoading] = useState(false);

    // Handle Caption Generation
    const handleGenerateCaption = async () => {
        if (!captionTopic.trim()) return;

        setCaptionLoading(true);
        try {
            const result = await generateCaption(captionTopic, captionPlatform, captionTone);
            setGeneratedCaption(result);
        } catch (error) {
            setGeneratedCaption(`Error: ${error.message}`);
        }
        setCaptionLoading(false);
    };

    // Handle Image Generation
    const handleGenerateImage = async () => {
        if (!imagePrompt.trim()) return;

        setImageLoading(true);
        try {
            const result = await generateImage(imagePrompt);
            setGeneratedImage(result);
        } catch (error) {
            setGeneratedImage({ success: false, error: error.message });
        }
        setImageLoading(false);
    };

    // Handle Multi-Platform Adaptation
    const handleAdaptContent = async () => {
        if (!originalContent.trim()) return;

        setAdapterLoading(true);
        try {
            const result = await adaptContentForAllPlatforms(originalContent);
            setAdaptedContent(result);
        } catch (error) {
            setAdaptedContent({ error: error.message });
        }
        setAdapterLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Content Generation Testing</h1>
                <p className="text-gray-600">Test all AI features for Member 2's implementation</p>
            </div>

            {/* Caption Generation Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-purple-600" size={24} />
                    <h2 className="text-2xl font-bold text-gray-900">AI Caption Generation</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                        <select
                            value={captionPlatform}
                            onChange={(e) => setCaptionPlatform(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option>Instagram</option>
                            <option>Twitter</option>
                            <option>LinkedIn</option>
                            <option>Facebook</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                        <select
                            value={captionTone}
                            onChange={(e) => setCaptionTone(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="professional">🎯 Professional</option>
                            <option value="casual">😊 Casual</option>
                            <option value="playful">🎉 Playful</option>
                            <option value="inspirational">✨ Inspirational</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                        <input
                            type="text"
                            value={captionTopic}
                            onChange={(e) => setCaptionTopic(e.target.value)}
                            placeholder="e.g., New product launch"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerateCaption}
                    disabled={captionLoading || !captionTopic.trim()}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {captionLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Generating Caption...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Generate Caption
                        </>
                    )}
                </button>

                {generatedCaption && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Generated Caption:</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{generatedCaption}</p>
                        <p className="text-xs text-gray-500 mt-2">Characters: {generatedCaption.length}</p>
                    </div>
                )}
            </div>

            {/* Image Generation Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="text-blue-600" size={24} />
                    <h2 className="text-2xl font-bold text-gray-900">AI Image Generation</h2>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Description</label>
                    <textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="e.g., A modern tech startup office with diverse team collaborating"
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    onClick={handleGenerateImage}
                    disabled={imageLoading || !imagePrompt.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {imageLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Generating Image...
                        </>
                    ) : (
                        <>
                            <ImageIcon size={20} />
                            Generate Image
                        </>
                    )}
                </button>

                {generatedImage && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        {generatedImage.success ? (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">✅ Image Generated!</p>
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
                                <p className="text-sm font-medium text-red-600 mb-2">❌ {generatedImage.error}</p>
                                {generatedImage.suggestion && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                        <p className="text-xs font-medium text-yellow-800 mb-1">💡 Suggestion:</p>
                                        <p className="text-xs text-yellow-700 whitespace-pre-wrap">{generatedImage.suggestion}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Multi-Platform Adapter Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-green-600" size={24} />
                    <h2 className="text-2xl font-bold text-gray-900">Multi-Platform Content Adapter</h2>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Content</label>
                    <textarea
                        value={originalContent}
                        onChange={(e) => setOriginalContent(e.target.value)}
                        placeholder="Paste your long-form content here... Include hashtags like #marketing #socialmedia"
                        rows={5}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <button
                    onClick={handleAdaptContent}
                    disabled={adapterLoading || !originalContent.trim()}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {adapterLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Adapting Content...
                        </>
                    ) : (
                        <>
                            <Zap size={20} />
                            Adapt for All Platforms
                        </>
                    )}
                </button>

                {adaptedContent && !adaptedContent.error && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['instagram', 'twitter', 'linkedin', 'facebook'].map(platform => {
                            const data = adaptedContent[platform];
                            const platformColors = {
                                instagram: 'bg-pink-50 border-pink-300',
                                twitter: 'bg-blue-50 border-blue-300',
                                linkedin: 'bg-indigo-50 border-indigo-300',
                                facebook: 'bg-blue-50 border-blue-300'
                            };

                            return (
                                <div key={platform} className={`p-4 rounded-lg border-2 ${platformColors[platform]}`}>
                                    <h3 className="font-bold text-lg capitalize mb-2">{platform}</h3>
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap mb-2">{data.content}</p>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Chars: {data.length}/{data.limit}</span>
                                        <span className={data.withinLimit ? 'text-green-600' : 'text-red-600'}>
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
                )}

                {adaptedContent && adaptedContent.error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-600">Error: {adaptedContent.error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestAI;

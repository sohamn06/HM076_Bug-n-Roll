import React, { useState, useEffect } from 'react';
import { connectPlatform, isPlatformConnected } from '../oauthService';
import { publishPost, addToQueue, getScheduledPosts, processQueue } from '../platformService';
import { getAuth } from 'firebase/auth';

const TestSocial = () => {
    const [status, setStatus] = useState('');
    const [connections, setConnections] = useState({
        twitter: false,
        facebook: false,
        linkedin: false,
        instagram: false
    });
    const [postContent, setPostContent] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [queue, setQueue] = useState([]);

    // Check connections on load
    useEffect(() => {
        const checkConnections = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const newConns = { ...connections };
                for (const platform of Object.keys(connections)) {
                    newConns[platform] = await isPlatformConnected(user.uid, platform);
                }
                setConnections(newConns);
            }
        };
        checkConnections();
        refreshQueue();
    }, []);

    const refreshQueue = async () => {
        try {
            const posts = await getScheduledPosts();
            setQueue(posts);
        } catch (error) {
            console.error(error);
        }
    };

    const handleConnect = async (platform) => {
        try {
            setStatus(`Connecting to ${platform}...`);
            await connectPlatform(platform);
            setStatus(`Connected to ${platform} successfully!`);
            setConnections(prev => ({ ...prev, [platform]: true }));
        } catch (error) {
            setStatus(`Error connecting: ${error.message}`);
        }
    };

    const handlePublish = async (platform) => {
        const auth = getAuth();
        if (!auth.currentUser) return setStatus("Please login first");

        try {
            setStatus(`Publishing to ${platform}...`);
            await publishPost({
                title: postContent,
                content: postContent
            }, platform, auth.currentUser.uid);
            setStatus(`Published to ${platform}!`);
        } catch (error) {
            setStatus(`Error publishing: ${error.message}`);
        }
    };

    const handleSchedule = async () => {
        const auth = getAuth();
        if (!auth.currentUser) return setStatus("Please login first");
        if (!scheduledTime) return setStatus("Select a time");

        try {
            setStatus("Scheduling...");
            await addToQueue({
                title: postContent,
                content: postContent,
                platform: 'twitter' // defaulting to twitter for demo
            }, new Date(scheduledTime), auth.currentUser.uid);
            setStatus("Scheduled successfully!");
            refreshQueue();
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };

    const handleProcessQueue = async () => {
        setStatus("Processing queue...");
        await processQueue();
        setStatus("Queue processed.");
        refreshQueue();
    };

    return (
        <div className="p-8 text-white bg-[#0B0C15] min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Social Media Integration Test</h1>

            {/* Status Bar */}
            {status && (
                <div className="p-4 mb-6 bg-blue-500/20 border border-blue-500 rounded-lg">
                    {status}
                </div>
            )}

            {/* 1. Connections */}
            <div className="mb-8 border border-gray-700 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">1. OAuth Connections</h2>
                <div className="flex gap-4">
                    {Object.keys(connections).map(platform => (
                        <button
                            key={platform}
                            onClick={() => handleConnect(platform)}
                            className={`px-4 py-2 rounded-lg capitalize ${connections[platform]
                                    ? 'bg-green-500/20 text-green-400 border border-green-500'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {connections[platform] ? `${platform} Connected` : `Connect ${platform}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Create Post */}
            <div className="mb-8 border border-gray-700 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">2. Create & Publish</h2>
                <textarea
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg mb-4 text-white"
                    rows="3"
                    placeholder="What's on your mind?"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                />
                <div className="flex gap-4 items-end">
                    <button
                        onClick={() => handlePublish('twitter')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                    >
                        Publish Now (Twitter)
                    </button>

                    <div className="flex flex-col gap-1 ml-auto">
                        <span className="text-sm text-gray-400">Schedule for:</span>
                        <input
                            type="datetime-local"
                            className="bg-gray-800 text-white p-2 rounded border border-gray-700"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSchedule}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                    >
                        Schedule Post
                    </button>
                </div>
            </div>

            {/* 3. Queue */}
            <div className="mb-8 border border-gray-700 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">3. Scheduled Queue</h2>
                    <button
                        onClick={handleProcessQueue}
                        className="px-3 py-1 bg-yellow-600/50 hover:bg-yellow-600 text-yellow-100 rounded text-sm"
                    >
                        Simulate Queue Processor ({queue.length} pending)
                    </button>
                </div>

                <div className="space-y-2">
                    {queue.length === 0 ? (
                        <p className="text-gray-500">No pending posts.</p>
                    ) : queue.map(item => (
                        <div key={item.id} className="p-3 bg-gray-800 rounded flex justify-between items-center">
                            <div>
                                <span className="font-semibold block">{item.title}</span>
                                <span className="text-xs text-gray-400">
                                    Due: {item.scheduledAt?.toDate ? item.scheduledAt.toDate().toLocaleString() : new Date(item.scheduledAt).toLocaleString()}
                                </span>
                            </div>
                            <span className="px-2 py-1 bg-blue-900/50 text-blue-200 text-xs rounded">
                                {item.status} - {item.platform}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestSocial;

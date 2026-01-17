import React, { useState, useEffect } from 'react';
import { Upload, Search, Filter, Trash2, Eye, Download, Image as ImageIcon, Video, File as FileIcon } from 'lucide-react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll, getMetadata } from 'firebase/storage';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Assets = () => {
    const { userProfile } = useAuth();
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (!userProfile?.organizationId) return;

        // Fetch assets filtered by organization
        const q = query(
            collection(db, 'assets'),
            where('organizationId', '==', userProfile.organizationId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const assetsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAssets(assetsData);
        });

        return () => unsubscribe();
    }, [userProfile]);

    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            for (const file of files) {
                // Create storage reference
                const storageRef = ref(storage, `assets/${Date.now()}_${file.name}`);

                // Upload file
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        setUploading(false);
                    },
                    async () => {
                        // Get download URL
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        // Determine file type
                        let type = 'document';
                        if (file.type.startsWith('image/')) type = 'image';
                        else if (file.type.startsWith('video/')) type = 'video';

                        // Save metadata to Firestore
                        await addDoc(collection(db, 'assets'), {
                            name: file.name,
                            type,
                            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                            url: downloadURL,
                            storagePath: uploadTask.snapshot.ref.fullPath,
                            organizationId: userProfile.organizationId,
                            uploadedAt: new Date().toISOString(),
                            createdAt: new Date()
                        });

                        setUploadProgress(0);
                    }
                );
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (asset) => {
        if (!confirm(`Delete "${asset.name}"?`)) return;

        try {
            // Delete from Storage
            const storageRef = ref(storage, asset.storagePath);
            await deleteObject(storageRef);

            // Delete from Firestore
            await deleteDoc(doc(db, 'assets', asset.id));
        } catch (error) {
            console.error('Error deleting asset:', error);
        }
    };

    const handleDownload = (asset) => {
        const link = document.createElement('a');
        link.href = asset.url;
        link.download = asset.name;
        link.click();
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || asset.type === filterType;
        return matchesSearch && matchesType;
    });

    const getAssetIcon = (type) => {
        switch (type) {
            case 'image': return <ImageIcon size={40} className="text-blue-400" />;
            case 'video': return <Video size={40} className="text-purple-400" />;
            default: return <FileIcon size={40} className="text-gray-400" />;
        }
    };

    // Loading state
    if (!userProfile?.organizationId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/30 animate-pulse">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <p className="text-gray-400">Loading assets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Assets</h1>
                    <p className="text-gray-400 text-sm">Centralized storage for all your marketing assets · {assets.length} files</p>
                </div>
                <label className="relative cursor-pointer">
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                    <div className={`flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium rounded-lg transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Upload size={16} />
                        {uploading ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Upload Assets'}
                    </div>
                </label>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0B0C15] border border-[#1F2937]/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#6366F1]/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === 'all'
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-[#1F2937]/50 text-gray-400 hover:text-white'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('image')}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === 'image'
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-[#1F2937]/50 text-gray-400 hover:text-white'
                            }`}
                    >
                        Images
                    </button>
                    <button
                        onClick={() => setFilterType('video')}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === 'video'
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-[#1F2937]/50 text-gray-400 hover:text-white'
                            }`}
                    >
                        Videos
                    </button>
                    <button
                        onClick={() => setFilterType('document')}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === 'document'
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-[#1F2937]/50 text-gray-400 hover:text-white'
                            }`}
                    >
                        Documents
                    </button>
                </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAssets.map((asset) => (
                    <div
                        key={asset.id}
                        className="group bg-[#0B0C15] border border-[#1F2937]/50 rounded-xl p-4 hover:border-[#6366F1]/50 transition-all"
                    >
                        {/* Preview Area */}
                        <div className="w-full h-40 bg-[#1F2937]/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            {asset.type === 'image' ? (
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                                getAssetIcon(asset.type)
                            )}
                        </div>

                        {/* Asset Info */}
                        <h3 className="text-sm font-semibold text-white mb-1 truncate" title={asset.name}>{asset.name}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>{asset.size}</span>
                            <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                                href={asset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#1F2937]/50 hover:bg-[#1F2937] rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                <Eye size={14} />
                            </a>
                            <button
                                onClick={() => handleDownload(asset)}
                                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#1F2937]/50 hover:bg-[#1F2937] rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                <Download size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(asset)}
                                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredAssets.length === 0 && !uploading && (
                <div className="text-center py-16">
                    <Upload size={48} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-semibold text-white mb-2">No assets found</h3>
                    <p className="text-gray-500 text-sm">Upload your first asset to get started</p>
                </div>
            )}
        </div>
    );
};

export default Assets;

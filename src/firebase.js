import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Creates a new campaign in the 'campaigns' collection
 */
export const createCampaign = async (title, description, startDate) => {
    try {
        const docRef = await addDoc(collection(db, 'campaigns'), {
            title,
            description,
            startDate,
            createdAt: serverTimestamp()
        });
        console.log('Campaign created with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating campaign:', error);
        throw error;
    }
};

/**
 * Creates a new post in the 'content' collection
 */
export const createPost = async (campaignId, title, platform, assignedUser) => {
    try {
        const docRef = await addDoc(collection(db, 'content'), {
            campaignId,
            title,
            platform,
            assignedUser,
            status: 'DRAFT',
            createdAt: serverTimestamp()
        });
        console.log('Post created with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

/**
 * Retrieves all campaigns from the 'campaigns' collection
 */
export const getCampaigns = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'campaigns'));
        const campaigns = [];
        querySnapshot.forEach((doc) => {
            campaigns.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return campaigns;
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
    }
};

/**
 * Updates the status of a post in the 'content' collection
 */
export const updatePostStatus = async (postId, newStatus) => {
    try {
        const postRef = doc(db, 'content', postId);
        await updateDoc(postRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        console.log('Post status updated successfully');
    } catch (error) {
        console.error('Error updating post status:', error);
        throw error;
    }
};

// ============================================
// APPROVAL WORKFLOW FUNCTIONS
// ============================================

/**
 * Submits a post for review
 */
export const submitPostForReview = async (postId, submitterId, submitterName, postTitle) => {
    try {
        const postRef = doc(db, 'content', postId);
        await updateDoc(postRef, {
            status: 'IN_REVIEW',
            submittedForReviewAt: serverTimestamp(),
            submittedBy: submitterId,
            updatedAt: serverTimestamp()
        });

        await addDoc(collection(db, 'notifications'), {
            type: 'REVIEW_REQUEST',
            postId: postId,
            postTitle: postTitle || 'Untitled Post',
            message: `${submitterName} submitted a post for review`,
            createdBy: submitterId,
            createdByName: submitterName,
            createdAt: serverTimestamp(),
            isRead: false,
            actionUrl: `/editor/${postId}`
        });

        console.log('Post submitted for review successfully');
    } catch (error) {
        console.error('Error submitting post for review:', error);
        throw error;
    }
};

/**
 * Approves a post
 */
export const approvePost = async (postId, managerId, managerName, submitterId, postTitle, notes = '') => {
    try {
        const postRef = doc(db, 'content', postId);
        await updateDoc(postRef, {
            status: 'APPROVED',
            approvedBy: managerId,
            approvedByName: managerName,
            approvedAt: serverTimestamp(),
            approvalNotes: notes,
            updatedAt: serverTimestamp()
        });

        if (submitterId) {
            await addDoc(collection(db, 'notifications'), {
                userId: submitterId,
                type: 'APPROVED',
                postId: postId,
                postTitle: postTitle || 'Untitled Post',
                message: `Your post "${postTitle}" was approved by ${managerName}`,
                createdBy: managerId,
                createdByName: managerName,
                createdAt: serverTimestamp(),
                isRead: false,
                actionUrl: `/editor/${postId}`,
                notes: notes
            });
        }

        console.log('Post approved successfully');
    } catch (error) {
        console.error('Error approving post:', error);
        throw error;
    }
};

/**
 * Rejects a post
 */
export const rejectPost = async (postId, managerId, managerName, submitterId, postTitle, reason) => {
    try {
        const postRef = doc(db, 'content', postId);
        await updateDoc(postRef, {
            status: 'DRAFT',
            rejectedBy: managerId,
            rejectedByName: managerName,
            rejectedAt: serverTimestamp(),
            rejectionReason: reason,
            updatedAt: serverTimestamp()
        });

        if (submitterId) {
            await addDoc(collection(db, 'notifications'), {
                userId: submitterId,
                type: 'REJECTED',
                postId: postId,
                postTitle: postTitle || 'Untitled Post',
                message: `Your post "${postTitle}" was rejected by ${managerName}`,
                createdBy: managerId,
                createdByName: managerName,
                createdAt: serverTimestamp(),
                isRead: false,
                actionUrl: `/editor/${postId}`,
                reason: reason
            });
        }

        console.log('Post rejected successfully');
    } catch (error) {
        console.error('Error rejecting post:', error);
        throw error;
    }
};

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Gets all notifications (for managers - review requests)
 */
export const getAllNotifications = async () => {
    try {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const notifications = [];
        querySnapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

/**
 * Gets notifications for a specific user
 */
export const getUserNotifications = async (userId) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const notifications = [];
        querySnapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        return notifications;
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        throw error;
    }
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, { isRead: true, readAt: serverTimestamp() });
        console.log('Notification marked as read');
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Gets unread notification count for a user
 */
export const getUnreadNotificationCount = async (userId) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('isRead', '==', false)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
};
// ============================================
// COMMENTING FUNCTIONS
// ============================================

/**
 * Adds a comment to a post
 */
export const addComment = async (postId, userId, userName, text) => {
    try {
        const commentRef = await addDoc(collection(db, 'content', postId, 'comments'), {
            text,
            userId,
            userName,
            createdAt: serverTimestamp()
        });

        // Update the post's lastActivity
        const postRef = doc(db, 'content', postId);
        await updateDoc(postRef, {
            lastCommentAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        console.log('Comment added successfully');
        return commentRef.id;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
};

/**
 * Deletes a comment from a post
 */
export const deleteComment = async (postId, commentId) => {
    try {
        const commentRef = doc(db, 'content', postId, 'comments', commentId);
        await updateDoc(commentRef, { deleted: true, deletedAt: serverTimestamp() });
        console.log('Comment deleted successfully');
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
};

// ============================================
// CLIENT SHARE LINK FUNCTIONS
// ============================================

/**
 * Generates or retrieves a unique share hash for a post
 */
export const generateShareLink = async (postId) => {
    try {
        const postRef = doc(db, 'content', postId);
        // Generate a random 16-char hash if it doesn't exist
        const hash = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        await updateDoc(postRef, {
            shareHash: hash,
            shareEnabled: true,
            updatedAt: serverTimestamp()
        });
        return hash;
    } catch (error) {
        console.error('Error generating share link:', error);
        throw error;
    }
};

/**
 * Disables sharing for a post
 */
export const disableSharing = async (postId) => {
    try {
        const postRef = doc(db, 'content', postId);
        await updateDoc(postRef, {
            shareEnabled: false,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error disabling sharing:', error);
        throw error;
    }
};

/**
 * Retrieves a post by its share hash for public viewing
 */
export const getPostByHash = async (hash) => {
    try {
        const q = query(
            collection(db, 'content'),
            where('shareHash', '==', hash),
            where('shareEnabled', '==', true)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error('Error fetching post by hash:', error);
        throw error;
    }
};

// ============================================
// ORGANIZATION & BRANDING FUNCTIONS
// ============================================

/**
 * Updates organization branding settings
 */
export const updateOrgBranding = async (orgId, brandingData) => {
    try {
        const orgRef = doc(db, 'organizations', orgId);
        await updateDoc(orgRef, {
            branding: brandingData,
            updatedAt: serverTimestamp()
        });
        console.log('Branding updated successfully');
    } catch (error) {
        console.error('Error updating branding:', error);
        throw error;
    }
};
// ============================================
// TEAM MANAGEMENT FUNCTIONS
// ============================================

/**
 * Invites a user to the organization
 */
export const inviteUser = async (email, role, orgId, invitedBy) => {
    try {
        const inviteRef = await addDoc(collection(db, 'invitations'), {
            email,
            role,
            organizationId: orgId,
            invitedBy,
            status: 'PENDING',
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        return inviteRef.id;
    } catch (error) {
        console.error('Error inviting user:', error);
        throw error;
    }
};

/**
 * Gets all members of an organization
 */
export const getOrganizationMembers = async (orgId) => {
    try {
        // Query users collection where organizationId matches
        const q = query(collection(db, 'users'), where('organizationId', '==', orgId));
        const querySnapshot = await getDocs(q);
        const members = [];
        querySnapshot.forEach((doc) => {
            members.push({ id: doc.id, ...doc.data() });
        });
        return members;
    } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
    }
};

/**
 * Updates a member's role
 */
export const updateMemberRole = async (userId, newRole) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            role: newRole,
            updatedAt: serverTimestamp()
        });
        console.log('Member role updated');
    } catch (error) {
        console.error('Error updating member role:', error);
        throw error;
    }
};

/**
 * Removes a member from the organization
 */
export const removeMember = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            organizationId: null,
            role: 'VIEWER', // Reset to default low priv
            removedAt: serverTimestamp()
        });
        console.log('Member removed');
    } catch (error) {
        console.error('Error removing member:', error);
        throw error;
    }
};

// ============================================
// ASSET MANAGEMENT FUNCTIONS
// ============================================
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file (Blob or File) to Firebase Storage
 */
export const uploadFile = async (file, path = 'assets') => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name || 'generated_image.png'}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                // You can add progress tracking here if needed
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error('Upload failed:', error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                    url: downloadURL,
                    storagePath: uploadTask.snapshot.ref.fullPath,
                    name: file.name
                });
            }
        );
    });
};

/**
 * Saves asset metadata to Firestore
 */
export const saveAssetToFirestore = async (name, url, storagePath, type, size, organizationId) => {
    try {
        const docRef = await addDoc(collection(db, 'assets'), {
            name,
            type,
            size,
            url,
            storagePath,
            organizationId,
            uploadedAt: new Date().toISOString(),
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving asset metadata:', error);
        throw error;
    }
};

// ============================================
// INBOX REPLY FUNCTIONS
// ============================================

/**
 * Stores a reply to an inbox message
 */
export const saveInboxReply = async (messageId, platform, replyText, userId, userName) => {
    try {
        const replyRef = await addDoc(collection(db, 'inbox_replies'), {
            messageId,
            platform,
            replyText,
            userId,
            userName,
            sentAt: serverTimestamp(),
            status: 'sent'
        });

        console.log('Reply saved with ID:', replyRef.id);
        return replyRef.id;
    } catch (error) {
        console.error('Error saving reply:', error);
        throw error;
    }
};

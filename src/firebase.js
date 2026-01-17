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

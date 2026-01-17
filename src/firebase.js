import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Added for Firebase Storage

// Firebase configuration - Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // Changed to use environment variable
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // Changed to use environment variable
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, // Changed to use environment variable
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // Changed to use environment variable
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // Changed to use environment variable
    appId: import.meta.env.VITE_FIREBASE_APP_ID, // Changed to use environment variable
    // measurementId: "G-70KQQRYYDT" // Removed as per the provided edit snippet
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Added Firebase Storage initialization

/**
 * Creates a new campaign in the 'campaigns' collection
 * @param {string} title - Campaign title
 * @param {string} description - Campaign description
 * @param {string} startDate - Campaign start date
 * @returns {Promise<string>} - Returns the created campaign document ID
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
 * @param {string} campaignId - ID of the associated campaign
 * @param {string} title - Post title
 * @param {string} platform - Social media platform (e.g., 'Facebook', 'Twitter', 'Instagram')
 * @param {string} assignedUser - User assigned to this post
 * @returns {Promise<string>} - Returns the created post document ID
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
 * @returns {Promise<Array>} - Returns array of campaign objects with their IDs
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
 * @param {string} postId - ID of the post to update
 * @param {string} newStatus - New status value (e.g., 'DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED')
 * @returns {Promise<void>}
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

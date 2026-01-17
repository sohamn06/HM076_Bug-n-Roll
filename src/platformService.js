import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db, updatePostStatus } from "./firebase";

/**
 * Publishes a post to the specified platform authentication.
 * @param {object} post - The post object containing title, content, etc.
 * @param {string} platform - The target platform (e.g., 'Twitter', 'Facebook').
 * @param {string} userId - The ID of the user publishing the post.
 * @returns {Promise<object>} - Result of the publish operation.
 */
export const publishPost = async (post, platform, userId) => {
    console.log(`Attempting to publish to ${platform}...`);

    // In a real app, we would fetch the user's stored OAuth token from Firestore here
    // const token = await getAccessToken(userId, platform);

    try {
        // MOCK API CALLS
        // Replace this block with actual API calls to Twitter/Meta using the token
        const mockResponse = await mockApiCall(platform, post);

        if (mockResponse.success) {
            console.log(`Successfully published to ${platform}:`, mockResponse.id);
            // Update local status
            if (post.id) {
                await updatePostStatus(post.id, 'PUBLISHED');
            }
            return mockResponse;
        } else {
            throw new Error(mockResponse.error || "Unknown error during publishing");
        }

    } catch (error) {
        console.error(`Failed to publish to ${platform}:`, error);
        throw error;
    }
};

/**
 * Mocks the API call to social platforms.
 */
const mockApiCall = (platform, data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                id: `${platform}_post_${Date.now()}`,
                platform: platform,
                timestamp: new Date().toISOString()
            });
        }, 1500); // Simulate network delay
    });
};

/**
 * Adds a post to the scheduling queue.
 * @param {object} post - The post data.
 * @param {Date} scheduledDate - The Date object for when it should be posted.
 * @param {string} userId - The user ID.
 */
export const addToQueue = async (post, scheduledDate, userId) => {
    try {
        const queueRef = collection(db, 'queue');
        const docRef = await addDoc(queueRef, {
            ...post,
            originalPostId: post.id || null,
            scheduledAt: scheduledDate,
            status: 'PENDING',
            userId: userId,
            createdAt: serverTimestamp()
        });

        // Update original post status if it exists
        if (post.id) {
            await updatePostStatus(post.id, 'SCHEDULED');
        }

        console.log("Added to queue with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding to queue:", error);
        throw error;
    }
};

/**
 * Retrieves the upcoming scheduled posts.
 * @returns {Promise<Array>}
 */
export const getScheduledPosts = async () => {
    try {
        const queueRef = collection(db, 'queue');
        const q = query(
            queueRef,
            where("status", "==", "PENDING"),
            orderBy("scheduledAt", "asc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching schedule:", error);
        throw error;
    }
};

/**
 * SIMULATION: Process the queue.
 * In a real app, this would be a Cloud Function triggered every minute.
 * Here, we check for any posts strictly past their due date and 'publish' them.
 */
export const processQueue = async () => {
    console.log("Processing queue...");
    const now = new Date();

    // Fetch all pending posts (client-side filter for demo)
    const pendingPosts = await getScheduledPosts();

    for (const item of pendingPosts) {
        // converting Firestore Timestamp to Date if needed
        const scheduledTime = item.scheduledAt.toDate ? item.scheduledAt.toDate() : new Date(item.scheduledAt);

        if (scheduledTime <= now) {
            console.log(`Publishing due post: ${item.title}`);
            try {
                // Publish
                await publishPost(item, item.platform || 'Unknown', item.userId);

                // Update Queue Item Status
                const queueDocRef = doc(db, 'queue', item.id);
                await updateDoc(queueDocRef, { status: 'COMPLETED', publishedAt: serverTimestamp() });

            } catch (err) {
                console.error(`Failed to process queue item ${item.id}`, err);
                const queueDocRef = doc(db, 'queue', item.id);
                await updateDoc(queueDocRef, { status: 'FAILED', error: err.message });
            }
        }
    }
};

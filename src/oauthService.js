import {
    getAuth,
    signInWithPopup,
    TwitterAuthProvider,
    FacebookAuthProvider,
    OAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const auth = getAuth();

/**
 * Initiates the OAuth flow for a specific platform.
 * @param {string} platform - The platform to connect ('twitter', 'facebook', 'linkedin', 'instagram').
 * @returns {Promise<object>} - Returns the user credentials and provider data.
 */
export const connectPlatform = async (platform) => {
    let provider;

    try {
        switch (platform.toLowerCase()) {
            case 'twitter':
                provider = new TwitterAuthProvider();
                break;
            case 'facebook':
                provider = new FacebookAuthProvider();
                break;
            case 'linkedin':
                // LinkedIn usually requires OIDC or specific OAuth setup in Firebase
                provider = new OAuthProvider('oidc.linkedin');
                break;
            case 'instagram':
                // Instagram Basic Display usually via Facebook Auth or custom OIDC
                provider = new OAuthProvider('facebook');
                provider.addScope('instagram_basic');
                provider.addScope('pages_show_list');
                break;
            default:
                throw new Error(`Platform ${platform} is not supported.`);
        }

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Retrieve access token (implementation varies by provider)
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;
        const secret = credential?.secret; // For Twitter v1.1

        // Store secure tokens in Firestore (Note: In production, treat tokens more securely)
        if (user && accessToken) {
            await saveConnection(user.uid, platform, {
                accessToken,
                secret,
                connectedAt: serverTimestamp(),
                profileId: result.user.providerData[0]?.uid || user.uid,
                email: result.user.email
            });
        }

        return { user, credential };

    } catch (error) {
        console.error(`Error connecting to ${platform}:`, error);
        throw error;
    }
};

/**
 * Saves the platform connection details to Firestore.
 * @param {string} userId - The Firebase User ID.
 * @param {string} platform - The platform name.
 * @param {object} data - Token and connection data.
 */
const saveConnection = async (userId, platform, data) => {
    const connectionRef = doc(db, "users", userId, "connections", platform);
    await setDoc(connectionRef, data, { merge: true });
    console.log(`Successfully linked ${platform} for user ${userId}`);
};

/**
 * Checks if a specific platform is connected for the current user.
 * @param {string} userId 
 * @param {string} platform 
 * @returns {Promise<boolean>}
 */
export const isPlatformConnected = async (userId, platform) => {
    try {
        const connectionRef = doc(db, "users", userId, "connections", platform);
        const docSnap = await getDoc(connectionRef);
        return docSnap.exists();
    } catch (error) {
        console.error("Error checking platform connection:", error);
        return false;
    }
};

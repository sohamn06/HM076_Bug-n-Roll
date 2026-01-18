import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign up with organization creation or joining via invite
    const signup = async (email, password, userData) => {
        console.log('🔍 Signup - userData received:', userData);
        try {
            // 1. Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            let finalOrgId = userData.organizationId;
            let finalRole = 'ADMIN'; // Default for new org owners

            // 2. Check for pending invitations
            const invitesRef = collection(db, 'invitations');
            const q = query(invitesRef, where('email', '==', email), where('status', '==', 'PENDING'));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // User has an invite! Join that org instead.
                const inviteDoc = querySnapshot.docs[0];
                const inviteData = inviteDoc.data();

                finalOrgId = inviteData.organizationId;
                finalRole = inviteData.role;

                // Mark invite as accepted
                await updateDoc(doc(db, 'invitations', inviteDoc.id), {
                    status: 'ACCEPTED',
                    acceptedAt: new Date(),
                    userId: user.uid
                });
            } else {
                // No invite found
                // If user is trying to join a team but has no invite, show specific error
                if (!userData.organizationName && !userData.organizationId) {
                    throw new Error("No invitation found. Please ask your team admin to send you an invite, or uncheck 'joining team' to create a new organization.");
                }

                // Creating a NEW Organization - requires organization name
                if (!userData.organizationName) {
                    throw new Error("Organization Name is required to create a new workspace.");
                }

                const orgRef = doc(db, 'organizations', userData.organizationId);
                await setDoc(orgRef, {
                    name: userData.organizationName,
                    createdAt: new Date(),
                    plan: 'free',
                    ownerId: user.uid
                });
            }

            // 3. Create user profile
            const userProfileData = {
                email: user.email,
                name: userData.name,
                organizationId: finalOrgId,
                role: finalRole,
                createdAt: new Date()
            };

            console.log('🔍 Signup - Saving user profile to Firestore:', userProfileData);
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, userProfileData);
            console.log('✅ Signup - User profile saved successfully!');

            // 4. Immediately fetch the profile to update state
            await fetchUserProfile(user.uid);

            return user;
        } catch (error) {
            console.error('❌ Signup error:', error);
            throw error;
        }
    };

    // Sign in
    const signin = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    // Sign out
    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    // Password reset
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    // Fetch user profile from Firestore
    const fetchUserProfile = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                setUserProfile({
                    uid: userId,
                    ...userDoc.data()
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        signup,
        signin,
        logout,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseReady = isFirebaseConfigured();

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, [firebaseReady]);

  const signInWithGoogle = async () => {
    if (!firebaseReady) {
      throw new Error("Firebase is not configured. Check your .env.local file.");
    }
    await signInWithPopup(getFirebaseAuth(), googleProvider);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!firebaseReady) {
      throw new Error("Firebase is not configured. Check your .env.local file.");
    }
    const userCredential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await updateProfile(userCredential.user, { displayName: name });
    setUser({ ...userCredential.user }); // Force trigger state update
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!firebaseReady) {
      throw new Error("Firebase is not configured. Check your .env.local file.");
    }
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(getFirebaseAuth());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firebaseReady,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

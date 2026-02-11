"use client";

import { useSearchParams } from "next/navigation";
import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Github } from "lucide-react";

export function GithubAuthButton() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [isLoading, setIsLoading] = useState(false);

    const handleGithubLogin = async () => {
        if (!auth || !db) {
            toast.error("Firebase is not initialized");
            return;
        }
        setIsLoading(true);
        try {
            const provider = new GithubAuthProvider();
            const result = await signInWithPopup(auth!, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userRef = doc(db!, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Create new user doc
                await setDoc(userRef, {
                    id: user.uid,
                    name: user.displayName || user.email?.split('@')[0] || "User",
                    email: user.email,
                    role: "user", // Default role
                    createdAt: new Date().toISOString(),
                    provider: "github"
                });
            }

            toast.success("Logged in successfully");
            router.push(callbackUrl);
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/account-exists-with-different-credential') {
                toast.error("Account exists with different provider");
            } else {
                toast.error("GitHub login failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant="outline" className="w-full" onClick={handleGithubLogin} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Github className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
        </Button>
    );
}

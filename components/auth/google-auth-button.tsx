"use client";

import { useSearchParams } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function GoogleAuthButton() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        if (!auth || !db) {
            toast.error("Firebase is not initialized");
            return;
        }
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth!, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userRef = doc(db!, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Create new user doc
                await setDoc(userRef, {
                    id: user.uid,
                    name: user.displayName,
                    email: user.email,
                    role: "user", // Default role
                    createdAt: new Date().toISOString(),
                });
            }

            toast.success("Logged in successfully");
            router.push(callbackUrl);
        } catch (error: any) {
            console.error(error);
            toast.error("Google login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue with Google
        </Button>
    );
}

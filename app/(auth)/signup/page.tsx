import { SignupForm } from "@/components/auth/signup-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { GithubAuthButton } from "@/components/auth/github-auth-button";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up | Gig-a-bit",
    description: "Create a new account",
};

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md border-white/10 bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                    <CardDescription className="text-center">
                        Join Gig-a-bit to host and discover events
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SignupForm />
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Suspense fallback={<div>Loading...</div>}>
                            <GoogleAuthButton />
                        </Suspense>
                        <Suspense fallback={<div>Loading...</div>}>
                            <GithubAuthButton />
                        </Suspense>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Sign In
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

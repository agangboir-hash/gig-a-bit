"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Loader2 } from "lucide-react";

export function Navbar() {
    const { user, loading, userRole } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">GiG<span className="text-primary">.</span>A<span className="text-primary">.</span>BiT</span>
                </Link>

                <div className="flex items-center gap-4">
                    {!loading && (
                        user ? (
                            <>
                                {userRole === 'host' && (
                                    <Link href="/events/create">
                                        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            <span>Create Event</span>
                                        </Button>
                                    </Link>
                                )}
                                <Button variant="ghost" size="sm">Dashboard</Button>
                                {/* Avatar/Dropdown logic here later */}
                            </>
                        ) : (
                            <Button asChild size="sm">
                                <Link href="/login">Sign In</Link>
                            </Button>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
}

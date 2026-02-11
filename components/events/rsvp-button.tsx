"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { Event } from "@/types";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";
import { Loader2, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

interface RSVPButtonProps {
    event: Event;
}

export function RSVPButton({ event }: RSVPButtonProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"going" | "interested" | null>(null);

    useEffect(() => {
        if (!user) return;
        const checkRSVP = async () => {
            const rsvpRef = doc(db, "rsvps", `${event.id}_${user.uid}`);
            const snap = await getDoc(rsvpRef);
            if (snap.exists()) {
                setStatus(snap.data().status);
            }
        };
        checkRSVP();
    }, [event.id, user]);

    const handleRSVP = async () => {
        if (!user) {
            toast.error("Please login to RSVP");
            router.push("/login");
            return;
        }

        if (event.price > 0) {
            setLoading(true);
            try {
                const response = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ event, userId: user.uid }),
                });

                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    toast.error(data.error || "Payment initiation failed");
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                toast.error("Network error");
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            const rsvpRef = doc(db!, "rsvps", `${event.id}_${user.uid}`);

            // Toggle logic or set "going"
            // If already going, maybe cancel? For now, simpler: just RSVP
            await setDoc(rsvpRef, {
                id: `${event.id}_${user.uid}`,
                eventId: event.id,
                userId: user.uid,
                status: "going",
                createdAt: new Date().toISOString(),
            });

            setStatus("going");
            toast.success("You are on the list!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to RSVP");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Button onClick={() => router.push("/login")} size="lg" className="w-full md:w-auto">
                Sign In to RSVP
            </Button>
        );
    }

    if (status === "going") {
        return (
            <Button variant="secondary" size="lg" className="w-full md:w-auto bg-success/20 text-success hover:bg-success/30 cursor-default">
                You're Going!
            </Button>
        );
    }

    return (
        <Button onClick={handleRSVP} disabled={loading} size="lg" className="w-full md:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Ticket className="mr-2 h-4 w-4" />
            {event.price === 0 ? "RSVP for Free" : `Buy Ticket ($${event.price})`}
        </Button>
    );
}

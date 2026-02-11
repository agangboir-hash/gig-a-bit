"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Event } from "@/types";
import { EventCard } from "@/components/events/event-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user, userRole, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hostingEvents, setHostingEvents] = useState<Event[]>([]);
    const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch Hosting Events
                if (userRole === "host") {
                    const qHost = query(collection(db, "events"), where("hostId", "==", user.uid));
                    const snapHost = await getDocs(qHost);
                    setHostingEvents(snapHost.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
                }

                // Fetch Attending Events (RSVPs)
                const qRsvp = query(collection(db, "rsvps"), where("userId", "==", user.uid));
                const snapRsvp = await getDocs(qRsvp);

                const eventIds = snapRsvp.docs.map(d => d.data().eventId);
                if (eventIds.length > 0) {
                    // Fetch events in parallel (batches of 10 ideally, but map is fine for small scale)
                    const eventPromises = eventIds.map(id => getDoc(doc(db, "events", id)));
                    const eventSnaps = await Promise.all(eventPromises);
                    setAttendingEvents(
                        eventSnaps
                            .filter(s => s.exists())
                            .map(s => ({ id: s.id, ...s.data() } as Event))
                    );
                } else {
                    setAttendingEvents([]);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, userRole, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <Tabs defaultValue="attending" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-lg">
                    <TabsTrigger value="attending" className="rounded-md">Attending</TabsTrigger>
                    {userRole === "host" && <TabsTrigger value="hosting" className="rounded-md">Hosting</TabsTrigger>}
                </TabsList>

                <TabsContent value="attending" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">My Tickets</h2>
                        <span className="text-sm text-muted-foreground">{attendingEvents.length} events</span>
                    </div>
                    {attendingEvents.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                            <p className="text-muted-foreground mb-4">You haven't RSVP'd to any events yet.</p>
                            <Button variant="outline" onClick={() => router.push("/")}>Explore Events</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {attendingEvents.map(e => <EventCard key={e.id} event={e} />)}
                        </div>
                    )}
                </TabsContent>

                {userRole === "host" && (
                    <TabsContent value="hosting" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">My Events</h2>
                            <Button onClick={() => router.push("/events/create")} size="sm">Create New</Button>
                        </div>
                        {hostingEvents.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                                <p className="text-muted-foreground mb-4">You haven't hosted any events yet.</p>
                                <Button variant="outline" onClick={() => router.push("/events/create")}>Create Your First Event</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hostingEvents.map(e => <EventCard key={e.id} event={e} />)}
                            </div>
                        )}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

// Import Button to fix lint error if I used it above
import { Button } from "@/components/ui/button";

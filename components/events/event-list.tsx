"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Event } from "@/types";
import { EventCard } from "@/components/events/event-card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EventList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "today" | "week">("all");

    useEffect(() => {
        // Listen for events
        // Ideally we should use orderBy("date"), but it might require an index if mixed with where()
        // For MVP, just get all and sort/filter client side or basic order
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, orderBy("date", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
            setEvents(eventsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events:", error);
            // Fallback for missing index error
            if (error.code === 'failed-precondition') {
                console.warn("Missing index, falling back to unordered fetch");
                const simpleQ = query(eventsRef);
                onSnapshot(simpleQ, (snap) => {
                    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
                    // Sort manually
                    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setEvents(data);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const filteredEvents = events.filter(event => {
        // Filter out past events
        const eventDate = new Date(event.date);
        const now = new Date();
        // Keep events from today onwards (simple check)
        if (eventDate < new Date(now.setHours(0, 0, 0, 0))) return false;

        if (filter === "all") return true;

        const today = new Date();
        if (filter === "today") {
            return eventDate.toDateString() === today.toDateString();
        }
        if (filter === "week") {
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            return eventDate <= nextWeek;
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (filteredEvents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-4">
                <p>No upcoming events found matching your filter.</p>
                <Button variant="outline" onClick={() => setFilter("all")}>Clear Filters</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                    size="sm"
                    className="rounded-full"
                >
                    All Events
                </Button>
                <Button
                    variant={filter === "today" ? "default" : "outline"}
                    onClick={() => setFilter("today")}
                    size="sm"
                    className="rounded-full"
                >
                    Today
                </Button>
                <Button
                    variant={filter === "week" ? "default" : "outline"}
                    onClick={() => setFilter("week")}
                    size="sm"
                    className="rounded-full"
                >
                    This Week
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}

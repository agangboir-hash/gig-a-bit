"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Event } from "@/types";
import { RSVPButton } from "@/components/events/rsvp-button";
import { EventMap } from "@/components/shared/event-map";
import { CalendarDays, MapPin, User, Star, Share2 } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface EventDetailViewProps {
    eventId: string;
}

export function EventDetailView({ eventId }: EventDetailViewProps) {
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [hostName, setHostName] = useState("Unknown Host");

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const docRef = doc(db, "events", eventId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...data } = docSnap.data() as Event;
                    setEvent({ id: docSnap.id, ...data });

                    // Fetch host name
                    if (data.hostId) {
                        const hostRef = doc(db, "users", data.hostId);
                        const hostSnap = await getDoc(hostRef);
                        if (hostSnap.exists()) {
                            setHostName(hostSnap.data().name);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                Event not found.
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Hero Image */}
            <div className="relative aspect-video max-h-[400px] w-full overflow-hidden rounded-xl border border-white/10 shadow-lg mb-8 bg-muted group">
                <Image src={event.imageUrl} alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{event.title}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm font-medium">
                                <Star className="h-3 w-3 fill-primary" />
                                {event.averageRating > 0 ? event.averageRating.toFixed(1) : "New"}
                            </span>
                            <span className="text-sm">({event.reviewCount} reviews)</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-primary">About this Event</h2>
                        <p className="whitespace-pre-line text-muted-foreground leading-relaxed text-lg/8">
                            {event.description}
                        </p>
                    </div>

                    <Separator className="bg-white/10" />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Host</h2>
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                            <Avatar className="h-12 w-12 border border-white/10">
                                <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-lg">{hostName}</p>
                                <p className="text-sm text-muted-foreground">Joined {new Date().getFullYear()}</p>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto">View Profile</Button>
                        </div>
                    </div>

                    {/* Reviews Section Placeholder */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                        <div className="text-muted-foreground text-sm italic p-8 text-center border border-dashed border-white/10 rounded-xl">
                            No reviews yet. Be the first to review after the event!
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm p-6 shadow-xl space-y-6 sticky top-24">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Date & Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(event.date), "PPP")}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(event.date), "p")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Location</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {event.locationName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <EventMap lat={event.latitude} lng={event.longitude} locationName={event.locationName} />

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-muted-foreground">Total Price</span>
                                <span className="text-3xl font-bold text-primary">
                                    {event.price === 0 ? "Free" : `$${event.price}`}
                                </span>
                            </div>
                            <RSVPButton event={event} />
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                {event.remainingTickets} spots remaining
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

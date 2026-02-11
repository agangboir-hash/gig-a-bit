import { EventDetailView } from "@/components/events/event-detail-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Event Details | Gig-a-bit",
    description: "Join this event",
};

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <EventDetailView eventId={resolvedParams.id} />;
}

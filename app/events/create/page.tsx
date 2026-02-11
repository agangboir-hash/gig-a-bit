import { CreateEventForm } from "@/components/events/create-event-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Event | Gig-a-bit",
    description: "Host a new event",
};

export default function CreateEventPage() {
    return (
        <div className="container mx-auto max-w-3xl py-10 px-4">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Create an Event</h1>
                <p className="text-muted-foreground">
                    Fill in the details below to host your next event.
                </p>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <CreateEventForm />
            </div>
        </div>
    );
}

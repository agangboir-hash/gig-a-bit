import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/types";

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    return (
        <Link href={`/events/${event.id}`}>
            <Card className="h-full overflow-hidden border-border/50 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                        <Badge variant={event.price === 0 ? "secondary" : "default"} className="font-semibold shadow-sm">
                            {event.price === 0 ? "Free" : `$${event.price}`}
                        </Badge>
                    </div>
                </div>
                <CardHeader className="p-4 pb-2">
                    <h3 className="line-clamp-1 text-lg font-bold group-hover:text-primary transition-colors">
                        {event.title}
                    </h3>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>{format(new Date(event.date), "PPP p")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="line-clamp-1">{event.locationName}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

import { EventList } from "@/components/events/event-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-background">
        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm text-primary font-medium mb-6">
            Hyperlocal Event Discovery
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-wb from-white via-white/90 to-white/50 mb-6 pb-2">
            Discover <span className="text-primary">Gigs</span> Near You
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl mb-8">
            Find the best concerts, meetups, and parties happening right in your neighborhood. Join the community.
          </p>
          {/* Search Bar */}
          <div className="flex w-full max-w-sm items-center space-x-2 relative group">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input type="text" placeholder="Search by event or location..." className="pl-10 bg-background/50 backdrop-blur-sm border-white/10 focus-visible:ring-primary/50 text-base py-6 rounded-full" />
            <Button type="submit" className="absolute right-1 rounded-full px-6" size="sm">
              Search
            </Button>
          </div>
        </div>
        {/* Background Gradients/Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Events Section */}
      <section className="container px-4 md:px-6 py-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
          </div>
          <EventList />
        </div>
      </section>
    </div>
  );
}

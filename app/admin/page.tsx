"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, Event } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Ban, CheckCircle } from "lucide-react";

export default function AdminPage() {
    const { user, userRole, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user || userRole !== "admin") {
            toast.error("Unauthorized access");
            router.push("/");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const usersSnap = await getDocs(collection(db, "users"));
                setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User)));

                const eventsSnap = await getDocs(collection(db, "events"));
                setEvents(eventsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Event)));
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, userRole, authLoading, router]);

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await deleteDoc(doc(db, "events", eventId));
            setEvents(events.filter(e => e.id !== eventId));
            toast.success("Event deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete event");
        }
    };

    // const handleSuspendUser = ... (need isActive field on user, assume generic update)

    if (authLoading || loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <Tabs defaultValue="events" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                <TabsContent value="events">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Host ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.title}</TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{event.hostId}</TableCell>
                                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{event.isActive ? "Active" : "Inactive"}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="users">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell className="capitalize">{u.role}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" disabled>
                                                <Ban className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

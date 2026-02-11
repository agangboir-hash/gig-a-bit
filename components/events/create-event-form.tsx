"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Upload } from "lucide-react";
import { LocationPicker } from "@/components/shared/location-picker";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "@/lib/firebase/config";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "sonner";

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    date: z.date(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    locationName: z.string().min(1, "Location is required"),
    price: z.coerce.number().min(0, "Price must be positive"), // coerce handles string->number
    isFree: z.boolean().default(false),
    totalTickets: z.coerce.number().min(1, "Must have at least 1 ticket"),
});

export function CreateEventForm() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            time: "18:00",
            locationName: "",
            price: 0,
            isFree: false,
            totalTickets: 100,
        },
    });

    const isFree = form.watch("isFree");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast.error("You must be logged in to create an event");
            return;
        }
        if (!imageFile) {
            toast.error("Please upload a cover image");
            return;
        }
        if (!locationCoords) {
            toast.error("Please select a valid location");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Upload Image
            const storageRef = ref(storage, `events/${user.uid}/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(snapshot.ref);

            // 2. Create Event Doc
            // Combine Date and Time
            const dateTime = new Date(values.date);
            const [hours, minutes] = values.time.split(":").map(Number);
            dateTime.setHours(hours, minutes);

            const eventData = {
                hostId: user.uid,
                title: values.title,
                description: values.description,
                date: dateTime.toISOString(),
                locationName: values.locationName,
                latitude: locationCoords.lat,
                longitude: locationCoords.lng,
                imageUrl,
                price: values.isFree ? 0 : values.price,
                totalTickets: values.totalTickets,
                remainingTickets: values.totalTickets,
                averageRating: 0,
                reviewCount: 0,
                createdAt: new Date().toISOString(),
                isActive: true,
            };

            await addDoc(collection(db, "events"), eventData);

            toast.success("Event created successfully!");
            router.push("/");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create event");
        } finally {
            setIsLoading(false);
        }
    }

    const handleLocationSelect = (loc: { address: string; lat: number; lng: number }) => {
        form.setValue("locationName", loc.address);
        setLocationCoords({ lat: loc.lat, lng: loc.lng });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Info</h3>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tech Meetup 2026" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Tell us about your event..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Date & Location */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Date & Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <LocationPicker onLocationSelect={handleLocationSelect} />
                        </FormControl>
                        {/* We can show the selected address here if needed, but the input shows it */}
                        <FormMessage>
                            {form.formState.errors.locationName?.message}
                        </FormMessage>
                    </FormItem>
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Cover Image</h3>
                    <FormItem>
                        <FormLabel className="cursor-pointer block">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                                {imageFile ? (
                                    <div className="text-success font-medium flex items-center justify-center gap-2">
                                        <span className="text-primary truncate max-w-[200px]">{imageFile.name}</span> selected
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Upload className="h-8 w-8" />
                                        <span>Click to upload cover image</span>
                                    </div>
                                )}
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setImageFile(file);
                                }}
                            />
                        </FormLabel>
                    </FormItem>
                </div>

                {/* Tickets */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ticketing</h3>
                    <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Free Event</FormLabel>
                                    <FormDescription>
                                        This event is free for everyone.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {!isFree && (
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ticket Price ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="0" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="totalTickets"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Tickets Available</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Event
                </Button>
            </form>
        </Form>
    );
}

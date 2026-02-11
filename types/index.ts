export interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "host" | "admin";
    createdAt: string;
}

export interface Event {
    id: string;
    hostId: string;
    title: string;
    description: string;
    date: string;
    locationName: string;
    latitude: number;
    longitude: number;
    imageUrl: string;
    price: number;
    totalTickets: number;
    remainingTickets: number;
    averageRating: number;
    reviewCount: number;
    createdAt: string;
    isActive: boolean;
}

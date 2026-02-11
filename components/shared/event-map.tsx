"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface EventMapProps {
    lat: number;
    lng: number;
    locationName: string;
}

export function EventMap({ lat, lng, locationName }: EventMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) return;

        const loader = new Loader({
            apiKey: apiKey,
            version: "weekly",
            libraries: ["marker"],
        });

        (loader as any).importLibrary("maps").then(async () => {
            const { Map } = await (loader as any).importLibrary("maps") as google.maps.MapsLibrary;
            const { AdvancedMarkerElement } = await (loader as any).importLibrary("marker") as google.maps.MarkerLibrary;

            if (!mapRef.current) return;

            const map = new Map(mapRef.current, {
                center: { lat, lng },
                zoom: 15,
                mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement, use DEMO_MAP_ID or real one
                disableDefaultUI: true,
                zoomControl: true,
            });

            new AdvancedMarkerElement({
                map: map,
                position: { lat, lng },
                title: locationName,
            });
        }).catch((err: any) => console.error(err));
    }, [lat, lng, locationName]);

    return (
        <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-xl overflow-hidden shadow-sm border border-white/10" />
    );
}

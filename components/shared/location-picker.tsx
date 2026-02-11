"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";

interface LocationPickerProps {
    onLocationSelect: (location: {
        address: string;
        lat: number;
        lng: number;
    }) => void;
    defaultValue?: string;
    className?: string; // Add className prop support
}

export function LocationPicker({ onLocationSelect, defaultValue, className }: LocationPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(defaultValue || "");

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) return;

        const loader = new Loader({
            apiKey: apiKey,
            version: "weekly",
            libraries: ["places"],
        });

        // Cast loader to any to avoid type error
        (loader as any).importLibrary("maps").then(async () => {
            const { Map } = await (loader as any).importLibrary("maps");
            const { AdvancedMarkerElement } = await (loader as any).importLibrary("marker");

            // The Autocomplete functionality still relies on the 'places' library
            // which is loaded via the 'libraries' array in the Loader constructor.
            if (!inputRef.current) return;

            const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
                types: ["geocode", "establishment"],
                fields: ["formatted_address", "geometry"],
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (place.geometry && place.geometry.location) {
                    const location = {
                        address: place.formatted_address || "",
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };
                    onLocationSelect(location);
                    setInputValue(place.formatted_address || "");
                }
            });
        }).catch((err: any) => console.error("Error loading Google Maps:", err));
    }, [onLocationSelect]);

    return (
        <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for a location..."
            className={className}
        />
    );
}

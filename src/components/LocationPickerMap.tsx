import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LocationPickerMapProps {
    latitude?: number;
    longitude?: number;
    onLocationSelect: (lat: number, lon: number) => void;
    height?: number;
}

export const LocationPickerMap = ({
    latitude,
    longitude,
    onLocationSelect,
    height = 300
}: LocationPickerMapProps) => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Default to India center if no coords provided
    const defaultLat = 20.5937;
    const defaultLon = 78.9629;
    const initialLat = latitude || defaultLat;
    const initialLon = longitude || defaultLon;
    const initialZoom = latitude ? 15 : 5;

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map if not already created
        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView([initialLat, initialLon], initialZoom);

            // Use OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // Add click handler
            map.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                updateMarker(lat, lng);
                onLocationSelect(lat, lng);
            });

            mapInstanceRef.current = map;
        }

        // Update marker if props change
        if (latitude && longitude) {
            updateMarker(latitude, longitude);
            // Only fly to location if it's significantly different to avoid jitter
            const currentCenter = mapInstanceRef.current?.getCenter();
            if (currentCenter) {
                const dist = currentCenter.distanceTo([latitude, longitude]);
                if (dist > 100) { // Only move if > 100m away
                    mapInstanceRef.current?.setView([latitude, longitude], 15);
                }
            } else {
                mapInstanceRef.current?.setView([latitude, longitude], 15);
            }
        }

        return () => {
            // Cleanup is handled by React unmount usually, but Leaflet instances should be managed carefully.
            // We keep the instance alive to avoid re-initialization issues during re-renders.
        };
    }, [latitude, longitude]); // Re-run when props change

    const updateMarker = (lat: number, lng: number) => {
        if (!mapInstanceRef.current) return;

        if (!markerRef.current) {
            const customIcon = L.divIcon({
                className: 'custom-location-marker',
                html: `<div style="background-color: #ef4444; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 4px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
          <div style="transform: rotate(45deg); color: white; font-size: 18px;">📍</div>
        </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
            });

            markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true })
                .addTo(mapInstanceRef.current);

            // Handle drag end
            markerRef.current.on('dragend', (event) => {
                const marker = event.target;
                const position = marker.getLatLng();
                onLocationSelect(position.lat, position.lng);
            });
        } else {
            markerRef.current.setLatLng([lat, lng]);
        }
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lon } = position.coords;
                updateMarker(lat, lon);
                onLocationSelect(lat, lon);
                mapInstanceRef.current?.setView([lat, lon], 16);
                setIsLocating(false);
                toast.success('Location detected!');
            },
            (error) => {
                console.error('Geolocation error:', error);
                toast.error('Failed to detect location. Please pick manually on the map.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Pin your exact delivery location</label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="h-8 text-xs"
                >
                    <Navigation className={`h-3 w-3 mr-1 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Locating...' : 'Detect My Location'}
                </Button>
            </div>

            <div className="relative border rounded-md overflow-hidden shadow-sm">
                <div
                    ref={mapRef}
                    style={{
                        height: `${height}px`,
                        width: '100%',
                        zIndex: 0
                    }}
                />
                {!latitude && !longitude && (
                    <div className="absolute inset-0 bg-black/5 pointer-events-none flex items-center justify-center z-[400]">
                        <div className="bg-background/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-medium text-muted-foreground">
                            Click map to set location
                        </div>
                    </div>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                * Drag the pin or click on the map to set the exact delivery spot.
            </p>
        </div>
    );
};

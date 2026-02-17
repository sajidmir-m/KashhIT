import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

interface LocationPickerMapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lon: number) => void;
  height?: number;
}

const defaultCenter: LatLngLiteral = { lat: 20.5937, lng: 78.9629 };

// Fix default Leaflet marker icon paths so markers show correctly in bundlers like Vite
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface InternalMarkerProps {
  marker: LatLngLiteral | null;
  setMarker: (p: LatLngLiteral) => void;
  onLocationSelect: (lat: number, lon: number) => void;
}

const InternalInteractiveLayer = ({ marker, setMarker, onLocationSelect }: InternalMarkerProps) => {
  const map = useMapEvents({
    click(e) {
      const next = e.latlng;
      setMarker(next);
      onLocationSelect(next.lat, next.lng);
      map.setView(next, 16);
    },
  });

  useEffect(() => {
    if (marker) {
      map.setView(marker, 16);
    }
  }, [marker, map]);

  return marker ? (
    <Marker
      position={marker}
      icon={defaultIcon}
      draggable
      eventHandlers={{
        dragend(e) {
          const next = (e.target as L.Marker).getLatLng();
          setMarker(next);
          onLocationSelect(next.lat, next.lng);
        },
      }}
    />
  ) : null;
};

export const LocationPickerMap = ({ latitude, longitude, onLocationSelect, height = 300 }: LocationPickerMapProps) => {
  const [isLocating, setIsLocating] = useState(false);
  const [marker, setMarker] = useState<LatLngLiteral | null>(
    latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null,
  );

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setMarker({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const next = { lat, lng };
        setMarker(next);
        onLocationSelect(lat, lng);
        setIsLocating(false);
        toast.success("Current location set!");
      },
      (err) => {
        console.error("Geolocation error:", err);
        toast.error("Failed to get current location. Please choose on the map.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
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
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="h-8 text-xs"
        >
          <Navigation className={`h-3 w-3 mr-1 ${isLocating ? "animate-spin" : ""}`} />
          {isLocating ? "Locating..." : "Use Current Location"}
        </Button>
      </div>

      <div className="relative border rounded-md overflow-hidden shadow-sm">
        <MapContainer
          center={marker ?? defaultCenter}
          zoom={marker ? 16 : 5}
          style={{ width: "100%", height: `${height}px` }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <InternalInteractiveLayer marker={marker} setMarker={setMarker} onLocationSelect={onLocationSelect} />
        </MapContainer>

        {!marker && (
          <div className="absolute inset-0 bg-black/5 pointer-events-none flex items-center justify-center">
            <div className="bg-background/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-medium text-muted-foreground">
              Click map to set location
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">* Drag the pin or click on the map to set the exact delivery spot.</p>
    </div>
  );
};

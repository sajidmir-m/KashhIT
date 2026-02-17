import { useMemo } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface PincodeMapProps {
  latitude: number;
  longitude: number;
  pincode: string;
  city?: string;
  state?: string;
  height?: number;
}

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const PincodeMap = ({ latitude, longitude, pincode, city, state, height = 300 }: PincodeMapProps) => {
  const center = useMemo<LatLngLiteral>(() => ({ lat: latitude, lng: longitude }), [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>
          Location for Pincode: <strong>{pincode}</strong>
        </span>
        {city && state && <span className="text-xs">({city}, {state})</span>}
      </div>
      <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
        <MapContainer center={center} zoom={13} style={{ width: "100%", height: `${height}px` }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={defaultIcon} />
        </MapContainer>
      </div>
    </div>
  );
};


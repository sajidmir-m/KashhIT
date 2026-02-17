import { useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lon: number };

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const LiveMap = ({
  center,
  partner,
  selected,
  height = 220,
  selectable = false,
  onSelect,
  trackingPath,
}: {
  center?: LatLng;
  partner?: LatLng | null;
  selected?: LatLng | null;
  height?: number;
  selectable?: boolean;
  onSelect?: (coords: LatLng) => void;
  trackingPath?: Array<{ latitude: number; longitude: number }>;
}) => {
  const defaultCenter: LatLngExpression = useMemo(() => ({ lat: 20.5937, lng: 78.9629 }), []);

  const centerPos = center?.lat != null && center?.lon != null ? ({ lat: center.lat, lng: center.lon } as const) : null;
  const partnerPos = partner?.lat != null && partner?.lon != null ? ({ lat: partner.lat, lng: partner.lon } as const) : null;
  const selectedPos =
    selected?.lat != null && selected?.lon != null ? ({ lat: selected.lat, lng: selected.lon } as const) : null;

  const initialCenter: LatLngExpression = centerPos ?? partnerPos ?? defaultCenter;

  const routePath: LatLngExpression[] | null = useMemo(() => {
    if (!centerPos || !partnerPos) return null;
    return [centerPos, partnerPos];
  }, [centerPos?.lat, centerPos?.lng, partnerPos?.lat, partnerPos?.lng]);

  const trackingPolylinePath: LatLngExpression[] | null = useMemo(() => {
    const pts =
      trackingPath
        ?.filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => ({ lat: p.latitude, lng: p.longitude })) || [];
    return pts.length > 1 ? pts : null;
  }, [trackingPath]);

  const handleClick = (e: L.LeafletMouseEvent) => {
    if (!selectable || !onSelect) return;
    const { lat, lng } = e.latlng;
    onSelect({ lat, lon: lng });
  };

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <MapContainer
        center={initialCenter}
        zoom={centerPos || partnerPos ? 14 : 5}
        style={{ width: "100%", height: `${height}px` }}
        scrollWheelZoom
        whenCreated={(map) => {
          // Fit bounds if both points available
          const points: LatLngExpression[] = [];
          if (centerPos) points.push(centerPos);
          if (partnerPos) points.push(partnerPos);
          if (selectable && selectedPos) points.push(selectedPos);

          if (points.length === 1) {
            map.setView(points[0], selectable ? 16 : 14);
          } else if (points.length > 1) {
            const bounds = L.latLngBounds(points as any);
            map.fitBounds(bounds, { padding: [30, 30] });
          }

          if (selectable) {
            map.on("click", handleClick);
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {centerPos && <Marker position={centerPos} icon={defaultIcon} title="Your Location" />}
        {partnerPos && <Marker position={partnerPos} icon={defaultIcon} title="Delivery Partner" />}
        {selectable && selectedPos && <Marker position={selectedPos} icon={defaultIcon} title="Selected drop location" />}

        {trackingPolylinePath && <Polyline positions={trackingPolylinePath} pathOptions={{ color: "#10b981", weight: 3 }} />}

        {routePath && <Polyline positions={routePath} pathOptions={{ color: "#3b82f6", weight: 4 }} />}
      </MapContainer>
    </div>
  );
};

export default LiveMap;

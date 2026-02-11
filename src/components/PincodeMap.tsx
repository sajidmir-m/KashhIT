import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

interface PincodeMapProps {
  latitude: number;
  longitude: number;
  pincode: string;
  city?: string;
  state?: string;
  height?: number;
}

export const PincodeMap = ({ latitude, longitude, pincode, city, state, height = 300 }: PincodeMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([latitude, longitude], 13);
      
      // Use OpenStreetMap tiles (free, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      // Update map view if coordinates change
      mapInstanceRef.current.setView([latitude, longitude], 13);
    }

    // Create or update marker
    if (!markerRef.current && mapInstanceRef.current) {
      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-pincode-marker',
        html: `<div style="background-color: #ef4444; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 4px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
          <div style="transform: rotate(45deg); color: white; font-size: 18px;">📍</div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      markerRef.current = L.marker([latitude, longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current);
      
      const popupText = city && state 
        ? `<strong>📍 ${pincode}</strong><br/>${city}, ${state}`
        : `<strong>📍 Pincode: ${pincode}</strong>`;
      
      markerRef.current.bindPopup(popupText).openPopup();
    } else if (markerRef.current) {
      // Update marker position
      markerRef.current.setLatLng([latitude, longitude]);
      const popupText = city && state 
        ? `<strong>📍 ${pincode}</strong><br/>${city}, ${state}`
        : `<strong>📍 Pincode: ${pincode}</strong>`;
      markerRef.current.setPopupContent(popupText);
    }

    // Cleanup function
    return () => {
      if (markerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [latitude, longitude, pincode, city, state]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>Location for Pincode: <strong>{pincode}</strong></span>
        {city && state && (
          <span className="text-xs">({city}, {state})</span>
        )}
      </div>
      <div
        ref={mapRef}
        style={{
          height: `${height}px`,
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid hsl(var(--border))',
        }}
      />
    </div>
  );
};


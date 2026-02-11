import { useEffect, useRef } from 'react';
import L from 'leaflet';

export type LatLng = { lat: number; lon: number };

export const LiveMap = ({ center, partner, selected, height = 220, selectable = false, onSelect, trackingPath }: { center?: LatLng; partner?: LatLng | null; selected?: LatLng | null; height?: number; selectable?: boolean; onSelect?: (coords: LatLng) => void; trackingPath?: Array<{ latitude: number; longitude: number }> }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const instRef = useRef<L.Map | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const partnerMarkerRef = useRef<L.Marker | null>(null);
  const selectionMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const pathPolylineRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || instRef.current) return;
    const m = L.map(mapRef.current).setView([center?.lat || 20.5937, center?.lon || 78.9629], center ? 14 : 5);
    // Use Google Maps tiles
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '© Google Maps',
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(m);
    instRef.current = m;
    if (selectable) {
      m.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (selectionMarkerRef.current) {
          selectionMarkerRef.current.setLatLng([lat, lng]);
        } else {
          selectionMarkerRef.current = L.marker([lat, lng]).addTo(m);
          selectionMarkerRef.current.bindPopup('📍 Selected drop location').openPopup();
        }
        onSelect && onSelect({ lat, lon: lng });
      });
    }
  }, []);

  // Reflect externally provided selected coordinate
  useEffect(() => {
    if (!instRef.current || !selectable) return;
    if (selected && selected.lat != null && selected.lon != null) {
      if (selectionMarkerRef.current) {
        selectionMarkerRef.current.setLatLng([selected.lat, selected.lon]);
      } else {
        selectionMarkerRef.current = L.marker([selected.lat, selected.lon]).addTo(instRef.current);
        selectionMarkerRef.current.bindPopup('📍 Selected drop location').openPopup();
      }
      instRef.current.setView([selected.lat, selected.lon], 16);
    }
  }, [selected, selectable]);

  // Update center marker (user location)
  useEffect(() => {
    if (!instRef.current) return;
    
    // Create a custom icon for user location (blue) - more visible
    const userIcon = L.divIcon({
      className: 'custom-user-icon',
      html: `<div style="background-color: #3b82f6; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 4px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);">
        <div style="transform: rotate(45deg); color: white; font-size: 20px; line-height: 36px; text-align: center;">📍</div>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    if (center?.lat && center?.lon) {
      if (!centerMarkerRef.current) {
        centerMarkerRef.current = L.marker([center.lat, center.lon], { 
          icon: userIcon 
        }).addTo(instRef.current);
        centerMarkerRef.current.bindPopup('📍 Your Location').openPopup();
      } else {
        centerMarkerRef.current.setLatLng([center.lat, center.lon]);
      }
    } else if (centerMarkerRef.current) {
      instRef.current.removeLayer(centerMarkerRef.current);
      centerMarkerRef.current = null;
    }
  }, [center]);

  // Update partner marker (delivery partner location)
  useEffect(() => {
    if (!instRef.current) return;
    
    // Create a custom icon for delivery partner (green) - more visible
    const partnerIcon = L.divIcon({
      className: 'custom-delivery-icon',
      html: `<div style="background-color: #10b981; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 4px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);">
        <div style="transform: rotate(45deg); color: white; font-size: 20px; line-height: 36px; text-align: center;">🚚</div>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    if (partner?.lat && partner?.lon) {
      if (!partnerMarkerRef.current) {
        partnerMarkerRef.current = L.marker([partner.lat, partner.lon], { 
          icon: partnerIcon 
        }).addTo(instRef.current);
        partnerMarkerRef.current.bindPopup('🚚 Delivery Partner Location').openPopup();
      } else {
        partnerMarkerRef.current.setLatLng([partner.lat, partner.lon]);
      }
    } else if (partnerMarkerRef.current) {
      instRef.current.removeLayer(partnerMarkerRef.current);
      partnerMarkerRef.current = null;
    }
  }, [partner]);

  // Draw tracking path (delivery partner's movement history) - like Zomato
  useEffect(() => {
    if (!instRef.current) return;
    
    if (trackingPath && trackingPath.length > 1) {
      const pathPoints: L.LatLng[] = trackingPath
        .filter(p => p.latitude != null && p.longitude != null)
        .map(p => [p.latitude, p.longitude] as L.LatLng);
      
      if (pathPoints.length > 1) {
        if (!pathPolylineRef.current) {
          pathPolylineRef.current = L.polyline(pathPoints, {
            color: '#10b981',
            weight: 3,
            opacity: 0.6,
            smoothFactor: 1,
          }).addTo(instRef.current);
        } else {
          pathPolylineRef.current.setLatLngs(pathPoints);
        }
      }
    } else if (pathPolylineRef.current) {
      instRef.current.removeLayer(pathPolylineRef.current);
      pathPolylineRef.current = null;
    }
  }, [trackingPath]);

  // Update route polyline between user and delivery partner (direct line)
  useEffect(() => {
    if (!instRef.current) return;
    
    // Draw route line between user and delivery partner
    if (center?.lat && center?.lon && partner?.lat && partner?.lon) {
      const routePoints: L.LatLng[] = [
        [center.lat, center.lon],
        [partner.lat, partner.lon]
      ];
      
      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(routePoints, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '15, 10',
        }).addTo(instRef.current);
        routePolylineRef.current.bringToFront();
      } else {
        routePolylineRef.current.setLatLngs(routePoints);
      }
    } else if (routePolylineRef.current) {
      instRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
  }, [center, partner]);

  // Update map view to show both markers and route
  useEffect(() => {
    if (!instRef.current) return;
    
    const markers: L.LatLng[] = [];
    if (center?.lat && center?.lon) markers.push([center.lat, center.lon]);
    if (partner?.lat && partner?.lon) markers.push([partner.lat, partner.lon]);
    
    if (markers.length === 2) {
      // Both locations available - fit bounds to show both with padding
      const bounds = L.latLngBounds(markers);
      instRef.current.fitBounds(bounds.pad(0.15));
    } else if (markers.length === 1) {
      // Only one location - center on it
      instRef.current.setView(markers[0], 14);
    } else if (center?.lat && center?.lon) {
      // Fallback to center if available
      instRef.current.setView([center.lat, center.lon], 14);
    } else if (partner?.lat && partner?.lon) {
      // Fallback to partner if available
      instRef.current.setView([partner.lat, partner.lon], 14);
    }
  }, [center, partner]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid hsl(var(--border))' }}
    />
  );
};

export default LiveMap;



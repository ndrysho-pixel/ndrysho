import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VisitorLocation {
  id: string;
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
  ip_address: string | null;
  page_path: string;
  last_seen: string;
}

interface VisitorMapProps {
  visitors: VisitorLocation[];
}

// Component to fit map bounds to markers
function MapBounds({ visitors }: { visitors: VisitorLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (visitors.length > 0) {
      const bounds = L.latLngBounds(
        visitors.map(v => [v.latitude, v.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [visitors, map]);

  return null;
}

export default function VisitorMap({ visitors }: VisitorMapProps) {
  // Filter visitors with valid coordinates
  const validVisitors = visitors.filter(
    v => v.latitude && v.longitude && !isNaN(v.latitude) && !isNaN(v.longitude)
  );

  const mapCenter: LatLngExpression = validVisitors.length > 0
    ? [validVisitors[0].latitude, validVisitors[0].longitude]
    : [0, 0];

  if (validVisitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Visitor Locations
          </CardTitle>
          <CardDescription>Geographic distribution of active visitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No visitor location data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Visitor Locations
        </CardTitle>
        <CardDescription>
          Real-time geographic distribution of {validVisitors.length} active visitor{validVisitors.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg overflow-hidden border">
          <MapContainer
            // @ts-ignore - react-leaflet type issue
            center={mapCenter}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              // @ts-ignore - react-leaflet type issue
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validVisitors.map((visitor) => (
              <Marker
                key={visitor.id}
                position={[visitor.latitude, visitor.longitude]}
              >
                <Popup>
                  <div className="space-y-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      {visitor.city && visitor.country && (
                        <Badge variant="outline">
                          {visitor.city}, {visitor.country}
                        </Badge>
                      )}
                      {!visitor.city && visitor.country && (
                        <Badge variant="outline">{visitor.country}</Badge>
                      )}
                    </div>
                    <p className="text-sm">
                      <strong>Page:</strong> {visitor.page_path}
                    </p>
                    {visitor.ip_address && (
                      <p className="text-xs text-muted-foreground">
                        IP: {visitor.ip_address}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Last seen: {new Date(visitor.last_seen).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapBounds visitors={validVisitors} />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

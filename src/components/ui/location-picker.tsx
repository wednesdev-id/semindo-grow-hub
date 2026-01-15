import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Navigation, MapPin, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface LocationData {
    address: string;
    city: string;
    province: string;
    lat: number;
    lng: number;
}

interface LocationPickerProps {
    label: string;
    value: LocationData;
    onChange: (value: LocationData) => void;
    placeholder?: string;
}

// Reverse geocode using OpenStreetMap Nominatim (free, no API key)
async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string; province: string }> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { 'Accept-Language': 'id' } }
        );
        const data = await res.json();

        const addr = data.address || {};
        const address = data.display_name || '';
        const city = addr.city || addr.town || addr.municipality || addr.county || addr.regency || '';
        const province = addr.state || addr.province || '';

        return { address, city, province };
    } catch (error) {
        console.error('Reverse geocode failed:', error);
        return { address: '', city: '', province: '' };
    }
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Lokasi terpilih</Popup>
        </Marker>
    );
}

export default function LocationPicker({ label, value, onChange, placeholder }: LocationPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        value?.lat && value?.lng ? new L.LatLng(value.lat, value.lng) : null
    );
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [loadingGeocode, setLoadingGeocode] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Default center (Indonesia)
    const defaultCenter: L.LatLngExpression = [-2.5489, 118.0149];

    const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({ ...value, address: e.target.value });
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, city: e.target.value });
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, province: e.target.value });
    };

    // Auto-fill address when map is clicked
    const handleMapClick = async (newPos: L.LatLng) => {
        setPosition(newPos);
        setLoadingGeocode(true);

        // Update coordinates immediately
        onChange({
            ...value,
            lat: newPos.lat,
            lng: newPos.lng,
        });

        // Reverse geocode to fill address
        const geo = await reverseGeocode(newPos.lat, newPos.lng);
        onChange({
            ...value,
            lat: newPos.lat,
            lng: newPos.lng,
            address: geo.address,
            city: geo.city,
            province: geo.province,
        });
        setLoadingGeocode(false);
    };

    // Get current location and auto-fill
    const handleGetCurrentLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = new L.LatLng(latitude, longitude);
                    setPosition(newPos);
                    setShowMap(true);

                    // Update coordinates immediately
                    onChange({
                        ...value,
                        lat: latitude,
                        lng: longitude,
                    });

                    // Reverse geocode
                    setLoadingGeocode(true);
                    const geo = await reverseGeocode(latitude, longitude);
                    onChange({
                        ...value,
                        lat: latitude,
                        lng: longitude,
                        address: geo.address,
                        city: geo.city,
                        province: geo.province,
                    });
                    setLoadingGeocode(false);
                    setLoadingLocation(false);
                },
                (err) => {
                    console.error("Error getting location:", err);
                    alert("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
                    setLoadingLocation(false);
                }
            );
        } else {
            alert("Browser tidak mendukung geolokasi.");
            setLoadingLocation(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">{label}</Label>
                {loadingGeocode && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Mengisi alamat...
                    </span>
                )}
            </div>

            {/* Address Input */}
            <Textarea
                placeholder={placeholder || "Alamat lengkap..."}
                value={value.address}
                onChange={handleAddressChange}
                rows={2}
                className="resize-none text-sm"
            />

            {/* City & Province */}
            <div className="grid grid-cols-2 gap-2">
                <Input
                    placeholder="Kota/Kabupaten"
                    value={value.city}
                    onChange={handleCityChange}
                    className="h-9"
                />
                <Input
                    placeholder="Provinsi"
                    value={value.province}
                    onChange={handleProvinceChange}
                    className="h-9"
                />
            </div>

            {/* Map Toggle Button */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMap(!showMap)}
                    className="flex-1"
                >
                    <MapPin className="w-3 h-3 mr-1" />
                    {showMap ? 'Sembunyikan Peta' : 'Pilih di Peta'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={loadingLocation}
                    title="Gunakan lokasi saat ini"
                >
                    {loadingLocation ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Navigation className="w-3 h-3" />
                    )}
                </Button>
            </div>

            {/* Map */}
            {showMap && (
                <div className="h-[180px] w-full rounded-md border overflow-hidden relative z-0">
                    <MapContainer
                        center={position || defaultCenter}
                        zoom={position ? 15 : 5}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={handleMapClick} />
                    </MapContainer>
                </div>
            )}

            {/* Coordinates Display */}
            {value.lat !== 0 && value.lng !== 0 && (
                <p className="text-[10px] text-muted-foreground">
                    📍 {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
                </p>
            )}
        </div>
    );
}

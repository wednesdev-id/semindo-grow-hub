import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Navigation } from 'lucide-react';
import { LocationValue, AssessmentQuestion } from '../../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationQuestionProps {
    question: AssessmentQuestion;
    value: LocationValue | null;
    onChange: (value: LocationValue) => void;
}

// Component to handle map clicks
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

export default function LocationQuestion({ question, value, onChange }: LocationQuestionProps) {
    const [address, setAddress] = useState(value?.address || '');
    const [position, setPosition] = useState<L.LatLng | null>(
        value?.lat && value?.lng ? new L.LatLng(value.lat, value.lng) : null
    );
    const [loadingLocation, setLoadingLocation] = useState(false);

    // Default center (Jakarta)
    const defaultCenter: L.LatLngExpression = [-6.2088, 106.8456];

    useEffect(() => {
        if (value) {
            setAddress(value.address);
            if (value.lat && value.lng) {
                setPosition(new L.LatLng(value.lat, value.lng));
            }
        }
    }, [value]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newAddress = e.target.value;
        setAddress(newAddress);
        updateValue(newAddress, position);
    };

    const handleMapClick = (newPos: L.LatLng) => {
        setPosition(newPos);
        updateValue(address, newPos);
    };

    const updateValue = (addr: string, pos: L.LatLng | null) => {
        onChange({
            address: addr,
            lat: pos ? pos.lat : 0,
            lng: pos ? pos.lng : 0,
            // You might want to reverse geocode city/province here if needed
        });
    };

    const handleGetCurrentLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = new L.LatLng(latitude, longitude);
                    setPosition(newPos);
                    updateValue(address, newPos);
                    setLoadingLocation(false);
                },
                (err) => {
                    console.error("Error getting location:", err);
                    alert("Gagal mendapatkan lokasi saat ini. Pastikan GPS aktif dan izin diberikan.");
                    setLoadingLocation(false);
                }
            );
        } else {
            alert("Browser Anda tidak mendukung geolokasi.");
            setLoadingLocation(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor={`address-${question.id}`}>Alamat Lengkap</Label>
                <Textarea
                    id={`address-${question.id}`}
                    placeholder="Masukkan alamat lengkap usaha Anda..."
                    value={address}
                    onChange={handleAddressChange}
                    className="min-h-[100px]"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Titik Lokasi (Peta)</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetCurrentLocation}
                        disabled={loadingLocation}
                    >
                        {loadingLocation ? (
                            <span className="animate-spin mr-2">⏳</span>
                        ) : (
                            <Navigation className="mr-2 h-4 w-4" />
                        )}
                        Gunakan Lokasi Saat Ini
                    </Button>
                </div>

                <div className="h-[300px] w-full rounded-md border overflow-hidden relative z-0">
                    <MapContainer
                        center={position || defaultCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={handleMapClick} />
                    </MapContainer>
                </div>
                <p className="text-sm text-muted-foreground">
                    Klik pada peta untuk menyesuaikan titik lokasi usaha Anda.
                </p>
            </div>
            {value?.lat !== 0 && (
                <div className="text-xs text-muted-foreground">
                    Koordinat: {value?.lat.toFixed(6)}, {value?.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
}

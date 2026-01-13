import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, X } from 'lucide-react';
import { INDONESIA_CENTER, PROVINCE_COORDINATES } from './OpenStreetMap';

// Fix for default marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom draggable marker icon
const createPickerIcon = () => {
    return L.divIcon({
        className: 'picker-marker',
        html: `<div style="
            background-color: #ef4444;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
        "><div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
        "></div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });
};

export interface LocationData {
    lat: number;
    lng: number;
    address?: string;
}

interface MapPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (location: LocationData) => void;
    initialLocation?: LocationData | null;
    province?: string;
}

// Component to handle map clicks and marker dragging
function LocationMarker({
    position,
    onPositionChange,
}: {
    position: L.LatLng | null;
    onPositionChange: (latlng: L.LatLng) => void;
}) {
    const markerRef = useRef<L.Marker>(null);

    useMapEvents({
        click(e) {
            onPositionChange(e.latlng);
        },
    });

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                onPositionChange(marker.getLatLng());
            }
        },
    };

    return position === null ? null : (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={createPickerIcon()}
        />
    );
}

// Component to center map on position
function MapCenterer({ position }: { position: L.LatLng | null }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);

    return null;
}

// Geocoding using Nominatim (OSM's free geocoding service)
async function searchAddress(query: string): Promise<Array<{
    display_name: string;
    lat: string;
    lon: string;
}>> {
    if (!query || query.length < 3) return [];

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, Indonesia&limit=5`,
            {
                headers: {
                    'Accept-Language': 'id',
                },
            }
        );
        return await response.json();
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
}

// Reverse geocoding to get address from coordinates
async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
            {
                headers: {
                    'Accept-Language': 'id',
                },
            }
        );
        const data = await response.json();
        return data.display_name || '';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return '';
    }
}

export default function MapPickerModal({
    open,
    onOpenChange,
    onConfirm,
    initialLocation,
    province,
}: MapPickerModalProps) {
    // Initial position based on initial location, province, or Indonesia center
    const getInitialPosition = useCallback(() => {
        if (initialLocation) {
            return L.latLng(initialLocation.lat, initialLocation.lng);
        }
        if (province && PROVINCE_COORDINATES[province]) {
            return L.latLng(
                PROVINCE_COORDINATES[province].lat,
                PROVINCE_COORDINATES[province].lng
            );
        }
        return L.latLng(INDONESIA_CENTER[0], INDONESIA_CENTER[1]);
    }, [initialLocation, province]);

    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{
        display_name: string;
        lat: string;
        lon: string;
    }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [address, setAddress] = useState<string>(initialLocation?.address || '');
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Reset position when modal opens
    useEffect(() => {
        if (open) {
            setPosition(getInitialPosition());
            setSearchQuery('');
            setSearchResults([]);
            setAddress(initialLocation?.address || '');
        }
    }, [open, getInitialPosition, initialLocation]);

    // Update address when position changes
    useEffect(() => {
        if (position) {
            reverseGeocode(position.lat, position.lng).then(addr => {
                if (addr) setAddress(addr);
            });
        }
    }, [position]);

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.length >= 3) {
            setIsSearching(true);
            searchTimeoutRef.current = setTimeout(async () => {
                const results = await searchAddress(value);
                setSearchResults(results);
                setShowResults(true);
                setIsSearching(false);
            }, 500);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    const handleSelectResult = (result: { display_name: string; lat: string; lon: string }) => {
        const newPosition = L.latLng(parseFloat(result.lat), parseFloat(result.lon));
        setPosition(newPosition);
        setAddress(result.display_name);
        setSearchQuery('');
        setShowResults(false);
        setSearchResults([]);
    };

    const handleConfirm = () => {
        if (position) {
            onConfirm({
                lat: position.lat,
                lng: position.lng,
                address,
            });
            onOpenChange(false);
        }
    };

    const handlePositionChange = (latlng: L.LatLng) => {
        setPosition(latlng);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-500" />
                        Pilih Lokasi UMKM
                    </DialogTitle>
                    <DialogDescription>
                        Klik pada peta atau drag marker untuk memilih lokasi. Anda juga bisa mencari alamat.
                    </DialogDescription>
                </DialogHeader>

                {/* Search Box */}
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Cari alamat atau nama tempat..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                        {searchQuery && !isSearching && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSearchResults([]);
                                    setShowResults(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm border-b last:border-b-0"
                                    onClick={() => handleSelectResult(result)}
                                >
                                    <MapPin className="inline w-4 h-4 mr-2 text-red-500" />
                                    {result.display_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map Container */}
                <div className="flex-1 rounded-lg overflow-hidden border relative">
                    <MapContainer
                        center={getInitialPosition()}
                        zoom={province ? 10 : 5}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker
                            position={position}
                            onPositionChange={handlePositionChange}
                        />
                        <MapCenterer position={position} />
                    </MapContainer>

                    {/* Instructions Overlay */}
                    <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 rounded-lg px-3 py-2 shadow text-xs">
                        💡 Klik pada peta atau drag marker merah untuk memilih lokasi
                    </div>
                </div>

                {/* Selected Location Info */}
                {position && (
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Koordinat:</span>
                            <span className="font-mono text-xs bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                            </span>
                        </div>
                        {address && (
                            <div className="flex items-start gap-2 text-sm">
                                <span className="text-gray-500 shrink-0">Alamat:</span>
                                <span className="text-gray-700 dark:text-gray-300 line-clamp-2">{address}</span>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!position}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <MapPin className="w-4 h-4 mr-2" />
                        Gunakan Lokasi Ini
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

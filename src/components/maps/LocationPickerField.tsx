import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, Edit2, X } from 'lucide-react';
import MapPickerModal, { LocationData } from './MapPickerModal';
import { INDONESIA_CENTER, PROVINCE_COORDINATES } from './OpenStreetMap';

// Fix for default marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon for preview
const createPreviewIcon = () => {
    return L.divIcon({
        className: 'preview-marker',
        html: `<div style="
            background-color: #ef4444;
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        "><div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
        "></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
    });
};

interface LocationPickerFieldProps {
    value?: LocationData | null;
    onChange: (location: LocationData | null) => void;
    province?: string;
    label?: string;
    description?: string;
    required?: boolean;
    error?: string;
}

export default function LocationPickerField({
    value,
    onChange,
    province,
    label = 'Lokasi pada Peta',
    description = 'Pilih lokasi usaha Anda pada peta untuk memudahkan pelanggan menemukan Anda',
    required = false,
    error,
}: LocationPickerFieldProps) {
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Get center for preview map
    const previewCenter: [number, number] = value
        ? [value.lat, value.lng]
        : province && PROVINCE_COORDINATES[province]
            ? [PROVINCE_COORDINATES[province].lat, PROVINCE_COORDINATES[province].lng]
            : INDONESIA_CENTER;

    const handleConfirm = (location: LocationData) => {
        onChange(location);
    };

    const handleClear = () => {
        onChange(null);
    };

    return (
        <div className="space-y-2">
            {/* Label */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="h-auto p-1 text-gray-400 hover:text-red-500"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}

            {/* Preview or Empty State */}
            {value ? (
                <div className="relative rounded-lg overflow-hidden border">
                    {/* Mini Map Preview */}
                    <div className="h-40">
                        <MapContainer
                            center={[value.lat, value.lng]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                            zoomControl={false}
                            dragging={false}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker
                                position={[value.lat, value.lng]}
                                icon={createPreviewIcon()}
                            />
                        </MapContainer>
                    </div>

                    {/* Location Info */}
                    <div className="p-3 bg-gray-50 dark:bg-slate-800 border-t">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <MapPin className="w-3 h-3 text-red-500" />
                                    <span className="font-mono text-xs">
                                        {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                                    </span>
                                </div>
                                {value.address && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {value.address}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPickerOpen(true)}
                                className="shrink-0"
                            >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Ubah
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className={`
                        w-full p-6 border-2 border-dashed rounded-lg
                        flex flex-col items-center justify-center gap-3
                        text-gray-400 hover:text-gray-600 hover:border-gray-400
                        transition-colors duration-200
                        ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}
                    `}
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium">Pilih Lokasi pada Peta</p>
                        <p className="text-sm text-gray-400">
                            Klik untuk membuka peta dan memilih lokasi usaha Anda
                        </p>
                    </div>
                </button>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Map Picker Modal */}
            <MapPickerModal
                open={isPickerOpen}
                onOpenChange={setIsPickerOpen}
                onConfirm={handleConfirm}
                initialLocation={value}
                province={province}
            />
        </div>
    );
}

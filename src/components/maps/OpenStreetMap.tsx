import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

// Fix for default marker icons in react-leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different segmentation levels
const createCustomIcon = (color: string, size: number = 25) => {
    return L.divIcon({
        className: 'custom-marker transition-all duration-300 hover:scale-110',
        html: `<div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
};

// Custom cluster icon (bubble with count)
const createClusterIcon = (count: number, size: number, isSelected: boolean) => {
    const bgColor = isSelected ? 'rgba(139, 92, 246, 0.9)' : 'rgba(59, 130, 246, 0.9)'; // violet-500 : blue-500
    return L.divIcon({
        className: 'cluster-icon',
        html: `<div style="
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${bgColor};
            border-radius: 50%;
            border: 4px solid white;
            color: white;
            font-weight: bold;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: ${Math.max(12, size / 3)}px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
        ">
            ${count.toLocaleString('id-ID')}
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

// Segmentation colors
export const SEGMENTATION_MARKER_COLORS: Record<string, string> = {
    Pemula: '#3b82f6',  // Blue
    Madya: '#f59e0b',   // Amber
    Utama: '#10b981',   // Emerald
    default: '#6b7280', // Gray
};

// Province center coordinates for Indonesia
export const INDONESIA_CENTER: [number, number] = [-2.5, 118];
export const INDONESIA_ZOOM = 5;

// Province coordinates
export const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'Aceh': { lat: 4.695135, lng: 96.749397 },
    'Sumatera Utara': { lat: 2.115355, lng: 99.545097 },
    'Sumatera Barat': { lat: -0.739940, lng: 100.800003 },
    'Riau': { lat: 0.507068, lng: 101.447777 },
    'Kepulauan Riau': { lat: 3.945638, lng: 108.142166 },
    'Jambi': { lat: -1.609972, lng: 103.607254 },
    'Sumatera Selatan': { lat: -3.319437, lng: 103.914399 },
    'Bangka Belitung': { lat: -2.741050, lng: 106.440588 },
    'Bengkulu': { lat: -3.792857, lng: 102.260760 },
    'Lampung': { lat: -4.558585, lng: 105.406586 },
    'DKI Jakarta': { lat: -6.211544, lng: 106.845172 },
    'Jawa Barat': { lat: -6.914744, lng: 107.609810 },
    'Banten': { lat: -6.405817, lng: 106.064018 },
    'Jawa Tengah': { lat: -7.150975, lng: 110.140259 },
    'DI Yogyakarta': { lat: -7.797068, lng: 110.370529 },
    'Jawa Timur': { lat: -7.536064, lng: 112.238402 },
    'Bali': { lat: -8.340539, lng: 115.091949 },
    'Nusa Tenggara Barat': { lat: -8.652930, lng: 117.361648 },
    'Nusa Tenggara Timur': { lat: -8.657383, lng: 121.079372 },
    'Kalimantan Barat': { lat: -0.278790, lng: 111.475293 },
    'Kalimantan Tengah': { lat: -1.681490, lng: 113.382355 },
    'Kalimantan Selatan': { lat: -3.092641, lng: 115.283478 },
    'Kalimantan Timur': { lat: 0.538659, lng: 116.419389 },
    'Kalimantan Utara': { lat: 3.073020, lng: 116.041740 },
    'Sulawesi Utara': { lat: 0.625993, lng: 123.975021 },
    'Gorontalo': { lat: 0.545290, lng: 123.062126 },
    'Sulawesi Tengah': { lat: -1.430427, lng: 121.445612 },
    'Sulawesi Barat': { lat: -2.844726, lng: 119.232070 },
    'Sulawesi Selatan': { lat: -3.669500, lng: 119.999889 },
    'Sulawesi Tenggara': { lat: -4.144919, lng: 122.174605 },
    'Maluku': { lat: -3.238462, lng: 130.145270 },
    'Maluku Utara': { lat: 1.570858, lng: 127.808808 },
    'Papua': { lat: -4.269928, lng: 138.080353 },
    'Papua Barat': { lat: -1.336826, lng: 133.174166 },
    'Papua Tengah': { lat: -3.510000, lng: 136.890000 },
    'Papua Pegunungan': { lat: -4.100000, lng: 138.500000 },
    'Papua Selatan': { lat: -6.500000, lng: 139.500000 },
    'Papua Barat Daya': { lat: -2.000000, lng: 131.500000 },
};

export interface UMKMMapMarker {
    id: string;
    businessName: string;
    ownerName?: string;
    lat: number;
    lng: number;
    province: string;
    city?: string;
    segmentation: string;
    level?: string;
    sector?: string;
    // Statistics
    turnover?: number | null;
    employees?: number | null;
    status?: string;
}

export interface ProvinceCluster {
    province: string;
    count: number;
    lat: number;
    lng: number;
}

// Component to handle map view changes and events
function MapController({
    center,
    zoom,
    selectedProvince,
    onResetSelection
}: {
    center: [number, number];
    zoom: number;
    selectedProvince: string | null;
    onResetSelection: () => void;
}) {
    const map = useMap();

    // Update view when center/zoom changes programmatically
    useEffect(() => {
        map.setView(center, zoom, {
            animate: true,
            duration: 1.5 // Slower animation
        });
    }, [center, zoom, map]);

    // Handle user interactions (Zoom Out detection)
    // We use useMapEvents instead of map.on directly for better React integration
    const mapEvents = useMapEvents({
        zoomend: () => {
            const currentZoom = map.getZoom();
            // If zoomed out significantly (closer to national view) and a province is selected
            // Reset selection to show all bubbles again
            if (currentZoom < 7 && selectedProvince) {
                onResetSelection();
            }
        }
    });

    return null;
}

// Legend component
function MapLegend() {
    return (
        <div className="leaflet-bottom leaflet-left">
            <div className="leaflet-control bg-white dark:bg-slate-900 rounded-lg p-3 shadow-lg m-3">
                <div className="text-xs font-medium mb-2">Segmentasi UMKM</div>
                <div className="space-y-1">
                    {Object.entries(SEGMENTATION_MARKER_COLORS).filter(([k]) => k !== 'default').map(([name, color]) => (
                        <div key={name} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-xs">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

interface OpenStreetMapProps {
    markers?: UMKMMapMarker[];
    clusters?: ProvinceCluster[];
    onMarkerClick?: (marker: UMKMMapMarker) => void;
    onClusterClick?: (cluster: ProvinceCluster) => void;
    onResetSelection?: () => void; // New prop for zoom out reset
    selectedProvince?: string | null;
    className?: string;
    showLegend?: boolean;
    height?: string;
    getDetailUrl?: (id: string) => string;
}

export default function OpenStreetMap({
    markers = [],
    clusters = [],
    onMarkerClick,
    onClusterClick,
    onResetSelection, // Destructure new prop
    selectedProvince,
    className = '',
    showLegend = true,
    height = '500px',
    getDetailUrl,
}: OpenStreetMapProps) {
    // Determine map center based on selected province
    const center: [number, number] = selectedProvince && PROVINCE_COORDINATES[selectedProvince]
        ? [PROVINCE_COORDINATES[selectedProvince].lat, PROVINCE_COORDINATES[selectedProvince].lng]
        : INDONESIA_CENTER;

    const zoom = selectedProvince ? 8 : INDONESIA_ZOOM;

    return (
        <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <MapController
                    center={center}
                    zoom={zoom}
                    selectedProvince={selectedProvince}
                    onResetSelection={() => onResetSelection?.()}
                />

                {/* OpenStreetMap Tile Layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Province Clusters - Bubbles with Count */}
                {clusters.map((cluster) => {
                    const maxCount = Math.max(...clusters.map(c => c.count), 1);
                    const intensity = cluster.count / maxCount;
                    // Visual radius for bubble (pixels) - Reduced size for better visibility
                    const bubbleSize = 25 + intensity * 20; // 25px to 45px (was 40-80)
                    // Geographic radius for Circle (meters)
                    const geoRadius = 30000 + intensity * 100000;

                    const isSelected = selectedProvince === cluster.province;

                    return (
                        <div key={cluster.province}>
                            {/* Background Area Indication */}
                            {!isSelected && (
                                <Circle
                                    center={[cluster.lat, cluster.lng]}
                                    radius={geoRadius}
                                    pathOptions={{
                                        color: isSelected ? '#8b5cf6' : '#3b82f6',
                                        fillColor: isSelected ? '#8b5cf6' : '#3b82f6',
                                        fillOpacity: 0.1, // Lighter background
                                        weight: 1,
                                        dashArray: '5, 5', // Dashed line for area
                                    }}
                                    interactive={false}
                                />
                            )}

                            {/* Interactive Bubble with Count - ONLY SHOW IF NOT SELECTED OR WE WANT TO SEE BUBBLES ALWAYS */}
                            {/* User request: "ketika saya klik bubble hilang jadi fokus ke lokasi" */}
                            {/* So we hide the BUBBLE (Marker) when isSelected is true */}
                            {!isSelected && (
                                <Marker
                                    position={[cluster.lat, cluster.lng]}
                                    icon={createClusterIcon(cluster.count, bubbleSize, isSelected)}
                                    eventHandlers={{
                                        click: () => onClusterClick?.(cluster),
                                        mouseover: (e) => {
                                            const div = e.target._icon.querySelector('div');
                                            if (div) {
                                                div.style.transform = 'scale(1.1)';
                                                div.style.zIndex = '1000';
                                            }
                                        },
                                        mouseout: (e) => {
                                            const div = e.target._icon.querySelector('div');
                                            if (div) {
                                                div.style.transform = 'scale(1)';
                                                div.style.zIndex = 'auto';
                                            }
                                        }
                                    }}
                                >
                                    <Popup>
                                        <div className="text-center p-2">
                                            <div className="font-bold text-lg mb-1">{cluster.province}</div>
                                            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm inline-block font-medium">
                                                {cluster.count.toLocaleString('id-ID')} UMKM
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </div>
                    );
                })}

                {/* Individual UMKM Markers - Clustered with Spiderfy */}
                {selectedProvince && (
                    <MarkerClusterGroup
                        chunkedLoading
                        maxClusterRadius={60}
                        spiderfyOnMaxZoom={true}
                        showCoverageOnHover={false}
                        zoomToBoundsOnClick={true}
                        spiderLegPolylineOptions={{ weight: 1.5, color: '#222', opacity: 0.5 }}
                    >
                        {markers.map((marker) => {
                            const color = SEGMENTATION_MARKER_COLORS[marker.segmentation] || SEGMENTATION_MARKER_COLORS.default;
                            const icon = createCustomIcon(color, 20);

                            return (
                                <Marker
                                    key={marker.id}
                                    position={[marker.lat, marker.lng]}
                                    icon={icon}
                                    eventHandlers={{
                                        click: () => onMarkerClick?.(marker),
                                    }}
                                >
                                    <Popup>
                                        <div className="min-w-[220px]">
                                            <div className="font-semibold text-base">{marker.businessName}</div>
                                            {marker.ownerName && (
                                                <div className="text-sm text-gray-600">{marker.ownerName}</div>
                                            )}
                                            <div className="mt-2 space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Lokasi:</span>
                                                    <span>{marker.city ? `${marker.city}, ` : ''}{marker.province}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Segmentasi:</span>
                                                    <span
                                                        className="px-2 py-0.5 rounded text-white text-xs"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {marker.segmentation}
                                                    </span>
                                                </div>
                                                {marker.level && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Level:</span>
                                                        <span>{marker.level}</span>
                                                    </div>
                                                )}
                                                {marker.sector && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Sektor:</span>
                                                        <span>{marker.sector}</span>
                                                    </div>
                                                )}
                                                {/* Statistics Section */}
                                                <div className="border-t pt-2 mt-2">
                                                    {marker.turnover != null && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-500">Omzet/Tahun:</span>
                                                            <span className="font-medium text-green-600">
                                                                Rp {marker.turnover.toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {marker.employees != null && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-500">Karyawan:</span>
                                                            <span className="font-medium">
                                                                {marker.employees} orang
                                                            </span>
                                                        </div>
                                                    )}
                                                    {marker.status && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-500">Status:</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${marker.status === 'verified'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {marker.status === 'verified' ? 'Terverifikasi' : 'Pending'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Detail Button */}
                                                <div className="mt-3 pt-2 border-t">
                                                    <Link
                                                        to={getDetailUrl ? getDetailUrl(marker.id) : `/admin/umkm/${marker.id}`}
                                                        className="block w-full text-center py-1.5 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
                                                    >
                                                        Lihat Detail
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MarkerClusterGroup>
                )}
            </MapContainer>

            {/* Custom Legend Overlay */}
            {showLegend && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-slate-900 rounded-lg p-3 shadow-lg">
                    <div className="text-xs font-medium mb-2">Segmentasi UMKM</div>
                    <div className="space-y-1">
                        {Object.entries(SEGMENTATION_MARKER_COLORS)
                            .filter(([k]) => k !== 'default')
                            .map(([name, color]) => (
                                <div key={name} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs">{name}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Simpler map for showing just clusters/provinces
export function ProvinceMap({
    provinces,
    selectedProvince,
    onSelectProvince,
    height = '400px',
}: {
    provinces: { province: string; count: number }[];
    selectedProvince: string | null;
    onSelectProvince: (province: string) => void;
    height?: string;
}) {
    // Convert provinces to clusters with coordinates
    const clusters: ProvinceCluster[] = provinces
        .filter(p => PROVINCE_COORDINATES[p.province])
        .map(p => ({
            province: p.province,
            count: p.count,
            lat: PROVINCE_COORDINATES[p.province].lat,
            lng: PROVINCE_COORDINATES[p.province].lng,
        }));

    return (
        <OpenStreetMap
            clusters={clusters}
            onClusterClick={(cluster) => onSelectProvince(cluster.province)}
            selectedProvince={selectedProvince}
            height={height}
            showLegend={false}
        />
    );
}

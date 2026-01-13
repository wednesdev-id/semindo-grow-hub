
import React from 'react';
import { MapPin, Navigation, Home } from 'lucide-react';

interface TrackingMapProps {
    progress: number; // 0 to 100
}

export const TrackingMap: React.FC<TrackingMapProps> = ({ progress }) => {
    return (
        <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            {/* Background Map Pattern (Simulated) */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Route Line */}
            <div className="absolute top-1/2 left-10 right-10 h-2 bg-gray-300 rounded-full translate-y-[-50%]">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Origin Point */}
            <div className="absolute top-1/2 left-10 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200">
                    <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-xs font-medium text-gray-600">Gudang</span>
            </div>

            {/* Destination Point */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 translate-x-1/2 flex flex-col items-center gap-1">
                <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200">
                    <Home className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-medium text-gray-600">Tujuan</span>
            </div>

            {/* Courier Pin */}
            <div
                className="absolute top-1/2 transition-all duration-1000 ease-in-out z-10"
                style={{ left: `calc(10% + ${progress * 0.8}%)` }} // Adjust for padding
            >
                <div className="-translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center">
                    <div className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full shadow-sm mb-1 whitespace-nowrap">
                        Kurir
                    </div>
                    <div className="p-2 bg-primary rounded-full shadow-lg text-white ring-4 ring-white">
                        <Navigation className="w-5 h-5 fill-current" />
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded text-xs text-center text-gray-500">
                Visualisasi simulasi. Posisi kurir tidak real-time.
            </div>
        </div>
    );
};


import React from 'react';
import { CheckCircle2, Circle, Package, Truck, MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";

export type TrackingStatus =
    | 'processed'
    | 'packed'
    | 'shipped'
    | 'in_transit'
    | 'near_destination'
    | 'delivered';

interface TrackingTimelineProps {
    currentStatus: TrackingStatus;
}

const statusSteps: { id: TrackingStatus; label: string; icon: React.ElementType }[] = [
    { id: 'processed', label: 'Pesanan Diproses', icon: Package },
    { id: 'packed', label: 'Dikemas', icon: Package },
    { id: 'shipped', label: 'Diserahkan ke Kurir', icon: Truck },
    { id: 'in_transit', label: 'Dalam Perjalanan', icon: Truck },
    { id: 'near_destination', label: 'Mendekati Lokasi', icon: MapPin },
    { id: 'delivered', label: 'Pesanan Diterima', icon: CheckCircle2 },
];

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ currentStatus }) => {
    const currentIndex = statusSteps.findIndex(s => s.id === currentStatus);

    return (
        <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-8">
                {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.id} className="relative flex items-center gap-4">
                            <div
                                className={cn(
                                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-colors",
                                    isCompleted ? "border-primary bg-primary text-white" : "border-gray-300 text-gray-300",
                                    isCurrent && "ring-4 ring-primary/20"
                                )}
                            >
                                <step.icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-sm font-medium",
                                    isCompleted ? "text-gray-900" : "text-gray-500",
                                    isCurrent && "text-primary"
                                )}>
                                    {step.label}
                                </span>
                                {isCurrent && (
                                    <span className="text-xs text-gray-500 animate-pulse">
                                        Sedang berlangsung...
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

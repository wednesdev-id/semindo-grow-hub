import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MapPin, ArrowUpRight } from "lucide-react";
import { Webinar } from "@/services/lmsService";
import { Link } from "react-router-dom";

interface WebinarCardProps {
    webinar: Webinar;
}

export default function WebinarCard({ webinar }: WebinarCardProps) {
    const startDate = new Date(webinar.startDate);
    // Format: "28 Januari 2026"
    const formattedDate = startDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Format: "13.00-selesai"
    // Keep strict 24h format for start time
    const startTime = startDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    }).replace('.', ':');

    const formattedTime = `${startTime}-selesai`;

    const isOnline = webinar.venue?.toLowerCase().includes('online') || webinar.venue?.toLowerCase().includes('zoom') || webinar.venue?.toLowerCase().includes('meet');
    const statusLabel = isOnline ? "Online" : "Offline";
    const statusColor = isOnline ? "text-[#F97316]" : "text-[#06B6D4]"; // Orange for Online, Cyan for Offline

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-none shadow-sm overflow-hidden bg-white rounded-xl">
            {/* Image Placeholder */}
            <div className="relative pt-[60%] bg-gray-200">
                {webinar.thumbnail ? (
                    <img
                        src={webinar.thumbnail}
                        alt={webinar.title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-300">
                        {/* Empty gray placeholder as in design */}
                    </div>
                )}
            </div>

            <CardContent className="flex-1 p-5 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {webinar.title}
                </h3>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {webinar.description}
                </p>

                <div className={`text-sm font-medium mb-4 ${statusColor}`}>
                    {statusLabel}
                </div>

                <div className="flex flex-col gap-2 mb-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formattedTime}</span>
                    </div>
                </div>

                <div className="mt-auto flex gap-3">
                    <Button className="flex-1 bg-[#1e2350] hover:bg-[#2a306e] text-white h-10 rounded-md font-medium text-sm">
                        Ikuti Sekarang
                    </Button>

                    <Link to={webinar.venue && isOnline ? webinar.venue : '#'} target={isOnline ? "_blank" : "_self"}>
                        <Button variant="outline" className="h-10 w-10 p-0 border-gray-300 rounded-md text-[#1e2350]">
                            {isOnline ? <ArrowUpRight className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

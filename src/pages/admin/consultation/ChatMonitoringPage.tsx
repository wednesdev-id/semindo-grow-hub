import { useState, useEffect } from 'react';
import Navigation from "@/components/admin/AdminNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, MessageSquare, ArrowRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { consultationService } from "@/services/consultationService";
import { useNavigate } from 'react-router-dom';

export default function ChatMonitoringPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [channels, setChannels] = useState<any[]>([]);
    const [filteredChannels, setFilteredChannels] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchChannels();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredChannels(channels);
        } else {
            const q = searchQuery.toLowerCase();
            setFilteredChannels(channels.filter(c =>
                c.request.consultant.user.fullName.toLowerCase().includes(q) ||
                c.request.client.fullName.toLowerCase().includes(q) ||
                c.request.topic.toLowerCase().includes(q)
            ));
        }
    }, [searchQuery, channels]);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            const data = await consultationService.getAdminAllChannels();
            setChannels(data);
            setFilteredChannels(data);
        } catch (error) {
            toast({
                title: "Error fetching channels",
                description: "Could not load chat channels.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            <Navigation /> {/* Admin Sidebar */}

            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Chat Monitoring</h1>
                        <p className="text-muted-foreground">Monitor active and archived consultation chats.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex gap-2 items-center text-sm text-muted-foreground mb-2">
                            <Search className="w-4 h-4" />
                            <Input
                                placeholder="Search by topic, consultant, or client..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-md"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            </div>
                        ) : filteredChannels.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No chat channels found.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredChannels.map((channel) => (
                                    <div key={channel.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors flex justify-between items-center">
                                        <div className="flex gap-4 items-start">
                                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold">{channel.request.topic}</h4>
                                                    <Badge variant={channel.isActive ? "default" : "secondary"}>
                                                        {channel.isActive ? "Active" : "Archived"}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(channel.updatedAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    <span className="font-medium">{channel.request.client.fullName}</span> with <span className="font-medium">{channel.request.consultant.user.fullName}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate max-w-md">
                                                    Last: {channel.messages[0]?.content || "No messages yet"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {channel._count.messages} msgs
                                            </Badge>
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/consultation/chats/${channel.id}`)}>
                                                View Transcript <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

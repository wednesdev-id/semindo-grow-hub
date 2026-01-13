import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/admin/AdminNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { consultationService } from "@/services/consultationService";
import { ChatMessage } from "@/types/consultation";

export default function ChatTranscriptPage() {
    const { channelId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (channelId) {
            fetchTranscript();
        }
    }, [channelId]);

    const fetchTranscript = async () => {
        try {
            setLoading(true);
            const data = await consultationService.getAdminChatHistory(channelId!);
            setMessages(data);
        } catch (error) {
            toast({
                title: "Error fetching transcript",
                description: "Could not load messages.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            <Navigation />

            <div className="flex-1 p-8">
                <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Monitoring
                </Button>

                <Card className="h-[calc(100vh-150px)] flex flex-col">
                    <CardHeader className="border-b">
                        <CardTitle>Chat Transcript</CardTitle>
                        <CardDescription>Channel ID: {channelId}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No messages in this channel.
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        {msg.sender.profilePictureUrl ? (
                                            <img src={msg.sender.profilePictureUrl} alt={msg.sender.fullName} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{msg.sender.fullName}</span>
                                            <span className="text-xs text-muted-foreground">{format(new Date(msg.createdAt), "MMM d, HH:mm")}</span>
                                        </div>
                                        <div className={`text-sm p-3 rounded-lg inline-block max-w-[80%] ${msg.sender.id === 'system' ? 'bg-gray-100 italic' : 'bg-white border'
                                            }`}>
                                            {msg.contentType === 'file' ? (
                                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                    {msg.content}
                                                </a>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Paperclip, FileIcon, Loader2, X } from 'lucide-react';
import { consultationService } from '@/services/consultationService';
import { useAuth } from '@/core/auth/hooks/useAuth';
import type { ChatMessage } from '@/types/consultation';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ChatWidgetProps {
    requestId: string;
    className?: string;
}

export default function ChatWidget({ requestId, className }: ChatWidgetProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    // State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Refs
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial load & Polling
    useEffect(() => {
        loadChat();
        const interval = setInterval(() => {
            loadChat(true);
        }, 5000);
        return () => clearInterval(interval);
    }, [requestId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedFile]); // Also scroll when file selected

    const loadChat = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const result = await consultationService.getChatDetails(requestId);

            if (result.channel?.messages) {
                setMessages(result.channel.messages);
            }
            setCanChat(result.canChat);

            if (result.channel?.messages?.length > 0) {
                consultationService.markMessagesAsRead(requestId).catch(() => { });
            }

        } catch (error) {
            console.error('Failed to load chat:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Simple validation
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: "File too large",
                    description: "Maximum file size is 5MB",
                    variant: "destructive"
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!input.trim() && !selectedFile) || sending) return;

        try {
            setSending(true);
            let fileUrl = undefined;

            // 1. Upload file if exists
            if (selectedFile) {
                setUploading(true);
                try {
                    console.log('Uploading file...', selectedFile.name);
                    const uploadResult = await consultationService.uploadFile(requestId, selectedFile);
                    console.log('Upload success:', uploadResult);
                    fileUrl = uploadResult.data.fileUrl; // Ensure this matches API response structure
                } catch (err: any) {
                    console.error('Upload failed:', err);
                    toast({
                        title: "Upload failed",
                        description: err.message || "Could not upload file",
                        variant: "destructive"
                    });
                    setUploading(false);
                    setSending(false);
                    return;
                }
                setUploading(false);
            }

            // 2. Send Message
            await consultationService.sendMessage(requestId, input, fileUrl);

            // 3. Cleanup
            setInput('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            // 4. Refresh
            await loadChat(true);

        } catch (error: any) {
            console.error('Failed to send message:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to send message',
                variant: 'destructive',
            });
        } finally {
            setSending(false);
            setUploading(false);
        }
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading && messages.length === 0) {
        return (
            <Card className={cn("h-[500px] flex flex-col", className)}>
                <CardHeader className="border-b px-4 py-3">
                    <CardTitle className="text-sm font-medium">Live Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("h-[600px] flex flex-col shadow-md border-0 bg-[#e5ddd5]", className)}>
            <CardHeader className="border-b px-4 py-3 bg-white rounded-t-xl z-10 sticky top-0 shadow-sm">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse ring-2 ring-green-100" />
                        Live Chat
                    </CardTitle>
                    {!canChat && (
                        <span className="text-[10px] font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                            Chat Locked
                        </span>
                    )}
                </div>
            </CardHeader>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#e5ddd5]" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Send className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-xs bg-[#dcf8c6] px-3 py-1 rounded-full shadow-sm text-gray-600">No messages yet.</p>
                        {canChat && <p className="text-xs text-gray-500">Say hello!</p>}
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === user?.id;
                        const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                        return (
                            <div key={msg.id} className={cn("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn("flex max-w-[85%] md:max-w-[70%] relative group")}>

                                    {/* Message Bubble */}
                                    <div className={cn(
                                        "px-2 pl-3 py-1 shadow-sm text-sm break-words relative z-10 min-w-[80px]",
                                        isMe
                                            ? "bg-[#d9fdd3] text-gray-900 rounded-lg rounded-tr-none"
                                            : "bg-white text-gray-900 rounded-lg rounded-tl-none"
                                    )}

                                        style={{
                                            boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)"
                                        }}
                                    >
                                        {/* Tail SVG */}
                                        {isMe ? (
                                            <span className="absolute -right-2 top-0 block w-2 h-3 overflow-hidden">
                                                <svg viewBox="0 0 8 13" width="8" height="13" className="w-full h-full fill-[#d9fdd3]">
                                                    <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                                                </svg>
                                            </span>
                                        ) : (
                                            <span className="absolute -left-2 top-0 block w-2 h-3 overflow-hidden">
                                                <svg viewBox="0 0 8 13" width="8" height="13" className="w-full h-full fill-white">
                                                    <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 0.474 2.156 1.533 3.568z"></path>
                                                </svg>
                                            </span>
                                        )}

                                        {/* Sender Name */}
                                        {!isMe && showAvatar && (
                                            <p className="text-[11px] font-bold text-[#e5593f] mb-0.5 cursor-pointer hover:underline leading-tight">
                                                {msg.sender?.fullName}
                                            </p>
                                        )}

                                        {/* Content */}
                                        <p className="whitespace-pre-wrap leading-[1.3] text-[14px] text-[#111b21] pb-1 pr-16">{msg.content}</p>

                                        {/* Attachment */}
                                        {msg.fileUrl && (
                                            <a
                                                href={msg.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={cn(
                                                    "flex items-center gap-2 mt-1 p-1.5 rounded-md text-xs transition-colors border max-w-full overflow-hidden",
                                                    isMe ? "bg-[#c0ebba] border-[#a9db9e]" : "bg-gray-50 border-gray-100"
                                                )}
                                            >
                                                <div className="p-1 bg-white/40 rounded shrink-0">
                                                    <FileIcon className="w-3.5 h-3.5 text-gray-600" />
                                                </div>
                                                <span className="truncate flex-1 text-gray-700">Attachment</span>
                                            </a>
                                        )}

                                        {/* Timestamp & Status */}
                                        <div className={cn(
                                            "text-[10px] text-gray-500 select-none flex justify-end items-center gap-1 absolute bottom-1 right-2"
                                        )}>
                                            <span>{formatTime(msg.createdAt)}</span>
                                            {isMe && (
                                                <span className="text-blue-500">
                                                    <svg viewBox="0 0 16 11" height="11" width="16" className="w-[14px] h-[10px] fill-current">
                                                        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.473-.018l5.897-7.56a.34.34 0 0 0-.078-.462l-.478-.372zm-4.7 9.153l-1.32-1.266a.418.418 0 0 1-.036-.541l.378-.483a.319.319 0 0 1 .484-.032l.358.325a.32.32 0 0 0 .484-.033l1.86-2.378a.332.332 0 0 1 .458-.06l.54.39c.15.11.173.328.06.467l-2.793 3.593a.355.355 0 0 1-.472.018zM5.522 3.32l-.478-.372a.365.365 0 0 0-.51.063L.548 8.086a.258.258 0 0 0 .041.365l.504.385a.322.322 0 0 0 .42-.047l3.525-4.52a.376.376 0 0 1 .484-.031l.478.371a.365.365 0 0 1 .063.51l-4.708 6.035a.258.258 0 0 1-.365.04l-.504-.384a.322.322 0 0 1-.047-.42l4.897-6.277a.365.365 0 0 1 .51-.064l.478.372a.365.365 0 0 1 .063.51l-1.42 1.82a.376.376 0 0 0 .03 4.84l.478.371a.365.365 0 0 0 .51-.063l1.942-2.49a.365.365 0 0 0-.063-.51z"></path>
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-2 bg-[#f0f2f5] border-t sticky bottom-0">
                {/* File Preview */}
                {selectedFile && (
                    <div className="flex items-center justify-between p-2 mb-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 animate-in slide-in-from-bottom-2 shadow-sm mx-2">
                        <div className="flex items-center gap-2 truncate">
                            <div className="p-1.5 bg-blue-50 rounded">
                                <Paperclip className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            </div>
                            <span className="truncate max-w-[200px] font-medium text-xs">{selectedFile.name}</span>
                            <span className="text-[10px] text-gray-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 items-end px-2 pb-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-200 h-10 w-10"
                        disabled={!canChat || sending}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <div className="flex-1 bg-white rounded-2xl border border-gray-200 focus-within:ring-1 focus-within:ring-white px-4 py-2 flex items-center shadow-sm">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={canChat ? "Type a message" : "Chat locked"}
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-400 font-normal"
                            disabled={!canChat || sending}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                    </div>

                    <Button
                        type="submit"
                        size="icon"
                        className={cn("shrink-0 rounded-full shadow-md w-10 h-10 transition-all", sending ? "bg-gray-400 scale-95" : "bg-blue-600 hover:bg-blue-700 hover:scale-105")}
                        disabled={!canChat || (!input.trim() && !selectedFile) || sending}
                    >
                        {sending || uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5 ml-0.5" />
                        )}
                    </Button>
                </form>
            </div>
        </Card>
    );
}

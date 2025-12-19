import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { consultationService } from '../../services/consultationService';
import type { ChatMessage, ChatChannel } from '../../types/consultation';
import { io, Socket } from 'socket.io-client';
import { Send } from 'lucide-react';

export default function ConsultationChat() {
    const { requestId } = useParams<{ requestId: string }>();
    const [channel, setChannel] = useState<ChatChannel | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (requestId) {
            initializeChat();
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [requestId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = async () => {
        try {
            // Get channel
            const channelData = await consultationService.getChannel(requestId!);
            setChannel(channelData);

            // Load message history
            const history = await consultationService.getChatHistory(channelData.id);
            setMessages(history);

            // Initialize Socket.io
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const newSocket = io(socketUrl, {
                path: '/consultation-chat',
                auth: {
                    token: localStorage.getItem('token'),
                },
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                newSocket.emit('join_room', {
                    channelId: channelData.id,
                    userId: currentUser.id,
                });
            });

            newSocket.on('joined_room', (data) => {
                console.log('Joined room:', data);
            });

            newSocket.on('new_message', (message: ChatMessage) => {
                setMessages((prev) => [...prev, message]);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            setSocket(newSocket);
            setLoading(false);
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !socket || !channel) return;

        socket.emit('send_message', {
            channelId: channel.id,
            userId: currentUser.id,
            content: newMessage,
            contentType: 'text',
        });

        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <h2 className="text-xl font-semibold">Consultation Chat</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => {
                    const isOwn = message.senderId === currentUser.id;
                    return (
                        <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-900 shadow'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium">
                                        {message.sender.fullName}
                                    </span>
                                    <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {new Date(message.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t p-4">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Send
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

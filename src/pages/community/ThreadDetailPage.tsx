import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Users, Clock, ThumbsUp, Share2, Flag } from 'lucide-react';
import { api } from '../../services/api';
import { ForumThread, ForumPost } from '../../types/community';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { useAuth } from '../../contexts/AuthContext';

export const ThreadDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [thread, setThread] = useState<ForumThread | null>(null);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<{ data: ForumThread }>(`/community/forum/threads/${id}`);
                setThread(response.data);
                // Assuming posts are included in the thread response based on service implementation
                // If not, we'd fetch them separately. Service includes them.
                setPosts((response.data as any).posts || []);
            } catch (error) {
                console.error('Failed to fetch thread:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !id) return;

        setSubmitting(true);
        try {
            const response = await api.post<{ data: ForumPost }>('/community/forum/posts', {
                content: replyContent,
                threadId: id
            });
            setPosts([...posts, response.data]);
            setReplyContent('');
        } catch (error) {
            console.error('Failed to post reply:', error);
            alert('Gagal mengirim balasan. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpvote = async (type: 'thread' | 'post', itemId: string) => {
        try {
            await api.post('/community/forum/upvote', { type, id: itemId });
            // Optimistically update UI or refetch
            // For simplicity, we'll just alert for now or do nothing visible until refetch logic is better
            // Ideally we update the local state count.
        } catch (error) {
            console.error('Failed to upvote:', error);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!thread) return <div className="text-center p-12">Diskusi tidak ditemukan.</div>;

    return (
        <div className="space-y-8">
            {/* Thread Header & Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                        <Link to="/community/forum" className="hover:text-blue-600">Forum</Link>
                        <span>/</span>
                        <Link to={`/community/forum/category/${thread.categoryId}`} className="hover:text-blue-600">
                            {thread.category?.name || 'Kategori'}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 truncate max-w-xs">{thread.title}</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{thread.title}</h1>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                                    {thread.author.fullName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{thread.author.fullName}</p>
                                    <p className="text-xs text-gray-500">{thread.author.businessName || 'Member'}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date(thread.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleUpvote('thread', thread.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                            >
                                <ThumbsUp className="w-4 h-4" />
                                <span>{thread._count?.upvotes || 0}</span>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {thread.content}
                </div>
            </div>

            {/* Comments Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {posts.length} Balasan
                </h3>

                <div className="space-y-4 mb-8">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
                                        {post.author.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{post.author.fullName}</p>
                                        <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-700 whitespace-pre-wrap pl-11">
                                {post.content}
                            </div>
                            <div className="flex items-center space-x-4 mt-4 pl-11">
                                <button
                                    onClick={() => handleUpvote('post', post.id)}
                                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>Suka</span>
                                </button>
                                <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Balas</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Tulis Balasan</h3>
                    <form onSubmit={handleReply}>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Tulis tanggapan Anda di sini..."
                            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px] mb-4"
                            required
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Mengirim...' : 'Kirim Balasan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

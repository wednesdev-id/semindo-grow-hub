import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { MessageSquare, Users, Clock, Search, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { ForumThread, ForumCategory } from '../../types/community';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

export const ThreadListPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [category, setCategory] = useState<ForumCategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch category info if not 'all'
                if (categoryId && categoryId !== 'all') {
                    // We might need a separate endpoint for single category or filter from list
                    // For now, assuming we can get it from the list or separate call.
                    // Let's just fetch all categories and find it for simplicity, or add getCategory endpoint.
                    // To keep it simple, we'll skip category details for now or fetch from a new endpoint if needed.
                    // Actually, let's just use the ID in the header for now.
                }

                const params = new URLSearchParams();
                if (categoryId) params.append('categoryId', categoryId);
                params.append('page', page.toString());
                params.append('limit', '10');
                if (search) params.append('search', search);
                if (sort) params.append('sort', sort);

                const response = await api.get<{ data: ForumThread[], meta: any }>(`/community/forum/threads?${params.toString()}`);
                setThreads(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error('Failed to fetch threads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId, page, search, sort]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = formData.get('search') as string;
        setSearchParams({ search: q, page: '1', sort });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {categoryId === 'all' || !categoryId ? 'Semua Diskusi' : 'Diskusi Kategori'}
                    </h1>
                    <p className="text-gray-500">
                        {meta.total} diskusi ditemukan
                    </p>
                </div>
                <Link
                    to="/community/forum/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Buat Diskusi
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="Cari topik diskusi..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </form>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                        value={sort}
                        onChange={(e) => setSearchParams({ search, page: '1', sort: e.target.value })}
                        className="border border-gray-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="newest">Terbaru</option>
                        <option value="popular">Terpopuler</option>
                    </select>
                </div>
            </div>

            {/* Thread List */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {threads.length > 0 ? (
                        threads.map((thread) => (
                            <div key={thread.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <Link to={`/community/forum/thread/${thread.id}`} className="block">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                                            {thread.title}
                                        </h3>
                                        {thread.isPinned && (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                                Pinned
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                        {thread.content}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                                        <span className="flex items-center">
                                            <Users className="w-4 h-4 mr-1" />
                                            {thread.author.fullName}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {new Date(thread.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center text-blue-600">
                                            <MessageSquare className="w-4 h-4 mr-1" />
                                            {thread._count?.posts || 0} Balasan
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            Belum ada diskusi di kategori ini. Jadilah yang pertama memulai!
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setSearchParams({ search, sort, page: (page - 1).toString() })}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                        Page {page} of {meta.totalPages}
                    </span>
                    <button
                        disabled={page === meta.totalPages}
                        onClick={() => setSearchParams({ search, sort, page: (page + 1).toString() })}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

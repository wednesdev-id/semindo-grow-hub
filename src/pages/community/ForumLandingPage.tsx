import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { ForumCategory, ForumThread } from '../../types/community';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

export const ForumLandingPage: React.FC = () => {
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [trendingThreads, setTrendingThreads] = useState<ForumThread[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, threadsRes] = await Promise.all([
                    api.get<{ data: ForumCategory[] }>('/community/forum/categories'),
                    api.get<{ data: ForumThread[] }>('/community/forum/threads?sort=popular&limit=5')
                ]);
                setCategories(catsRes.data);
                setTrendingThreads(threadsRes.data);
            } catch (error) {
                console.error('Failed to fetch forum data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-4">Forum Diskusi UMKM</h1>
                <p className="text-blue-100 text-lg max-w-2xl mb-6">
                    Bergabunglah dalam diskusi, bagikan pengalaman, dan temukan solusi bersama ribuan pelaku UMKM lainnya.
                </p>
                <Link
                    to="/community/forum/create"
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Mulai Diskusi Baru
                </Link>
            </div>

            {/* Categories Grid */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Kategori Diskusi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/community/forum/category/${category.id}`}
                            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                    {/* We could render dynamic icons here based on category.icon string */}
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                    {category._count?.threads || 0} Topik
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                                {category.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Trending Threads */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                        Sedang Hangat
                    </h2>
                    <Link to="/community/forum/all" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                        Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {trendingThreads.map((thread) => (
                        <div key={thread.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <Link to={`/community/forum/thread/${thread.id}`} className="block">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                                    {thread.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                    {thread.content}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 space-x-4">
                                    <span className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        {thread.author.fullName}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="flex items-center text-orange-600">
                                        <MessageSquare className="w-4 h-4 mr-1" />
                                        {thread._count?.posts || 0} Balasan
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

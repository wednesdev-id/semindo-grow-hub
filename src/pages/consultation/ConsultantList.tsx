import { useState, useEffect } from 'react';
import { consultationService } from '../../services/consultationService';
import type { ConsultantProfile } from '../../types/consultation';
import { Star, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ConsultantList() {
    const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        expertise: '',
        minRating: 0,
        maxPrice: 0,
        featured: false,
    });

    useEffect(() => {
        loadConsultants();
    }, [filters]);

    const loadConsultants = async () => {
        try {
            setLoading(true);
            const data = await consultationService.listConsultants(filters);
            setConsultants(data);
        } catch (error) {
            console.error('Failed to load consultants:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Find a Consultant</h1>
                    <p className="mt-2 text-gray-600">
                        Connect with expert consultants to grow your business
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expertise
                            </label>
                            <select
                                value={filters.expertise}
                                onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">All</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Finance">Finance</option>
                                <option value="Legal">Legal</option>
                                <option value="Technology">Technology</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Rating
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.5"
                                value={filters.minRating}
                                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Price (IDR)
                            </label>
                            <input
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Any"
                            />
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.featured}
                                    onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Featured Only</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Consultant Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {consultants.map((consultant) => (
                            <Link
                                key={consultant.id}
                                to={`/consultation/consultants/${consultant.id}`}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                            >
                                <div className="p-6">
                                    {/* Profile Header */}
                                    <div className="flex items-start mb-4">
                                        <img
                                            src={consultant.user.profilePictureUrl || '/default-avatar.png'}
                                            alt={consultant.user.fullName}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                        <div className="ml-4 flex-1">
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                {consultant.user.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-600">{consultant.title}</p>
                                        </div>
                                    </div>

                                    {/* Tagline */}
                                    {consultant.tagline && (
                                        <p className="text-sm text-gray-700 mb-3">{consultant.tagline}</p>
                                    )}

                                    {/* Expertise Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {consultant.expertiseAreas.slice(0, 3).map((area, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                            >
                                                {area}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                                            <span>{consultant.averageRating.toFixed(1)}</span>
                                            <span className="ml-1">({consultant.totalSessions} sessions)</span>
                                        </div>
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            <span>
                                                Rp {consultant.hourlyRate?.toLocaleString() || 'N/A'}/hr
                                            </span>
                                        </div>
                                    </div>
                                    {/* Status */}
                                    {consultant.isAcceptingNewClients ? (
                                        <div className="text-sm text-green-600 font-medium">
                                            ✓ Accepting new clients
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">Not accepting clients</div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && consultants.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No consultants found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}

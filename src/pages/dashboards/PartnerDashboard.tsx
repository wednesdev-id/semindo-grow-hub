
import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { marketplaceService, Product } from '@/services/marketplaceService';
import { Globe, Filter, Search, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PartnerDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('opportunities');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Partner Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Welcome back, {user?.fullName}. Find your next strategic partnership.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
                <button
                    onClick={() => setActiveTab('opportunities')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'opportunities'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Export Opportunities
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'analytics'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Impact Analytics
                </button>
            </div>

            {/* Content */}
            {activeTab === 'opportunities' ? <ExportOpportunities /> : <ImpactAnalytics />}
        </div>
    );
}

function ExportOpportunities() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        const fetchOpportunities = async () => {
            setLoading(true);
            try {
                const { products: data } = await marketplaceService.getExportReadyProducts({
                    region,
                    category
                });
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch export opportunities', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchOpportunities, 500);
        return () => clearTimeout(timer);
    }, [region, category]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter by:</span>
                </div>
                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="h-9 rounded-md border border-gray-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Regions</option>
                    <option value="Indramayu">Indramayu</option>
                    <option value="Jakarta">Jakarta</option>
                    <option value="Bandung">Bandung</option>
                </select>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 rounded-md border border-gray-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Categories</option>
                    <option value="Craft">Craft</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Culinary">Culinary</option>
                </select>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-12">Loading opportunities...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
                    <p className="text-gray-500">Try adjusting your filters to find more export-ready products.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-48 overflow-hidden relative">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                    Export Ready
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 truncate pr-4">{product.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {product.location}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                                        {product.category}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                    {product.description}
                                </p>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">Price (FOB est.)</p>
                                        <p className="font-semibold text-gray-900">{product.price}</p>
                                    </div>
                                    <Link
                                        to={`/marketplace/product/${product.slug}`}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ImpactAnalytics() {
    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Impact Tracking Coming Soon</h3>
            <p className="text-gray-500">Track the export growth and social impact of your partnered UMKMs.</p>
        </div>
    )
}

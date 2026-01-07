
import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { marketplaceService } from '@/services/marketplaceService';
import { Landmark, Search, TrendingUp, CheckCircle } from 'lucide-react';

export default function BankDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('financing');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Bank Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Welcome back, {user?.fullName}. Identifying eligible UMKMs for financing.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
                <button
                    onClick={() => setActiveTab('financing')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'financing'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Financing Candidates
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'applications'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Application Status
                </button>
            </div>

            {/* Content */}
            {activeTab === 'financing' ? <FinancingCandidates /> : <ApplicationStatus />}
        </div>
    );
}

function FinancingCandidates() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState('');
    const [minRevenue, setMinRevenue] = useState(1000000);

    useEffect(() => {
        const fetchCandidates = async () => {
            setLoading(true);
            try {
                const { candidates: data } = await marketplaceService.getFinancingCandidates({
                    location,
                    minRevenue
                });
                setCandidates(data);
            } catch (error) {
                console.error('Failed to fetch financing candidates', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchCandidates, 500);
        return () => clearTimeout(timer);
    }, [location, minRevenue]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by city..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-9 h-10 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={minRevenue}
                    onChange={(e) => setMinRevenue(Number(e.target.value))}
                    className="h-10 rounded-md border border-gray-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={1000000}>Min Revenue > 1 Juta</option>
                    <option value={5000000}>Min Revenue > 5 Juta</option>
                    <option value={10000000}>Min Revenue > 10 Juta</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading candidates...</div>
                ) : candidates.length === 0 ? (
                    <div className="p-12 text-center">
                        <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                        <p className="text-gray-500">Try lowering requirements or changing location.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Business Name</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Est. Revenue & Orders</th>
                                <th className="px-6 py-4">Eligibility</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {candidates.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.owner}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.location}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900 font-medium">
                                            Rp {c.estimatedRevenue.toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {c.orderCount} total orders
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <CheckCircle className="w-3 h-3" /> {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
                                            Offer Financing
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function ApplicationStatus() {
    return (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
                Once you offer financing, applications will appear here for review and approval.
            </p>
        </div>
    )
}

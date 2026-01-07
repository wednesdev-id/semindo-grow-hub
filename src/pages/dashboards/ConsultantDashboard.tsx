import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { marketplaceService } from '@/services/marketplaceService';
import { BookOpen, DollarSign, Plus, Video, Layout, BarChart2 } from 'lucide-react';

import { Link } from 'react-router-dom';

interface DashboardStats {
  earnings: number;
  sessions: number;
  rating: number;
  students: number;
  courses: number;
}

export default function ConsultantDashboard() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'marketplace' | 'lms'>('marketplace');
  const [stats, setStats] = useState<DashboardStats>({
    earnings: 0,
    sessions: 0,
    rating: 0,
    students: 0,
    courses: 0
  });

  useEffect(() => {
    // Mock loading stats
    // In real app, fetch from API
    setStats({
      earnings: 12500000,
      sessions: 42,
      rating: 4.8,
      students: 156,
      courses: 3
    });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Consultant Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.fullName}</p>
        </div>

        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setActiveMode('marketplace')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${activeMode === 'marketplace'
              ? 'bg-white shadow text-blue-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <DollarSign size={18} />
            Marketplace
          </button>
          <button
            onClick={() => setActiveMode('lms')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${activeMode === 'lms'
              ? 'bg-white shadow text-purple-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <BookOpen size={18} />
            LMS Instructor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {activeMode === 'marketplace' ? (
          <>
            <StatsCard label="Total Earnings" value={`Rp ${stats.earnings.toLocaleString()}`} icon={<DollarSign />} color="blue" />
            <StatsCard label="Completed Sessions" value={stats.sessions} icon={<Video />} color="green" />
            <StatsCard label="Average Rating" value={stats.rating} icon={<BarChart2 />} color="yellow" />
            <StatsCard label="Active Clients" value="12" icon={<Layout />} color="indigo" />
          </>
        ) : (
          <>
            <StatsCard label="Course Revenue" value={`Rp ${(stats.earnings * 0.4).toLocaleString()}`} icon={<DollarSign />} color="purple" />
            <StatsCard label="Total Students" value={stats.students} icon={<BookOpen />} color="pink" />
            <StatsCard label="Active Courses" value={stats.courses} icon={<Layout />} color="indigo" />
            <StatsCard label="Avg. Course Rating" value="4.9" icon={<BarChart2 />} color="yellow" />
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {activeMode === 'marketplace' ? (
            <MarketplaceSection />
          ) : (
            <LMSSection />
          )}
        </div>

        {/* Right Column - Schedule / Notifications */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-4">Upcoming Schedule</h3>
            <div className="space-y-4">
              <ScheduledItem time="10:00 AM" title="Consultation with UMKM Maju" type="Consultation" />
              <ScheduledItem time="02:00 PM" title="Mentoring Session" type="Mentoring" />
              <ScheduledItem time="04:00 PM" title="Live Q&A: Digital Marketing" type="Course Live" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${(colors as any)[color]}`}>
        {icon}
      </div>
    </div>
  );
}

function ScheduledItem({ time, title, type }: any) {
  return (
    <div className="flex gap-4 items-start pb-4 border-b last:border-0 border-gray-50">
      <div className="text-sm font-medium text-gray-900 w-16">{time}</div>
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{type}</span>
      </div>
    </div>
  );
}

// Enhanced Marketplace Section with Tabs
function MarketplaceSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'products'>('overview');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'clients' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          My Clients
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Client Products
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="text-center text-gray-500 py-12">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Recent Activity</h3>
            <p>No new booking requests at the moment.</p>
          </div>
        )}

        {activeTab === 'clients' && (
          <ClientList />
        )}

        {activeTab === 'products' && (
          <ClientProductsList />
        )}
      </div>
    </div>
  );
}

function ClientList() {
  // Mock client list for now
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Your Active Clients</h3>
        <button className="text-sm text-blue-600 hover:underline">+ Add Client</button>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
              UM
            </div>
            <div>
              <p className="font-medium">UMKM Maju {i}</p>
              <p className="text-xs text-gray-500">Jakarta Selatan</p>
            </div>
          </div>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
        </div>
      ))}
    </div>
  )
}

function ClientProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch products using the new Consultant service method
        const { products: data } = await marketplaceService.getConsultantProducts({
          search,
          status: statusFilter
        });
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch client products");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search client products..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-[150px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : (
        <div className="space-y-2">
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products found.</div>
          ) : products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-xs text-blue-600 truncate">{product.seller}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm whitespace-nowrap">
                <span>{product.price}</span>
                <span className={`px-2 py-0.5 rounded text-xs capitalize ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {product.status || 'Draft'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function LMSSection() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          to="/lms/create-course"
          className="flex-1 bg-purple-600 text-white p-4 rounded-xl shadow-sm hover:bg-purple-700 transition flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Create New Course
        </Link>
        <button className="flex-1 bg-white text-gray-700 border border-gray-200 p-4 rounded-xl shadow-sm hover:bg-gray-50 transition font-medium">
          Manage Assignments
        </button>
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-lg">My Courses</h3>
          <Link to="/lms/instructor/courses" className="text-purple-600 text-sm hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-100">
          <CourseRow
            title="Digital Marketing Mastery 2024"
            students={120}
            rating={4.9}
            status="Published"
            revenue={4500000}
          />
          <CourseRow
            title="Financial Planning for UMKM"
            students={36}
            rating={4.7}
            status="Published"
            revenue={1200000}
          />
          <CourseRow
            title="Export Strategy: Entering Global Market"
            students={0}
            rating={0}
            status="Draft"
            revenue={0}
          />
        </div>
      </div>
    </div>
  );
}

function CourseRow({ title, students, rating, status, revenue }: any) {
  return (
    <div className="p-4 hover:bg-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-12 w-16 bg-gray-200 rounded-md"></div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{students} Students • {rating} ★ Rating</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">Rp {revenue.toLocaleString()}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
          {status}
        </span>
      </div>
    </div>
  );
}

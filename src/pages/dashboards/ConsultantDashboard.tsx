import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { consultationService } from '@/services/consultationService';
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
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
              activeMode === 'marketplace' 
                ? 'bg-white shadow text-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign size={18} />
            Marketplace
          </button>
          <button
            onClick={() => setActiveMode('lms')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
              activeMode === 'lms' 
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

function MarketplaceSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Recent Booking Requests</h3>
        <Link to="/consultation/requests" className="text-blue-600 text-sm hover:underline">View All</Link>
      </div>
      <div className="p-6 text-center text-gray-500 py-12">
        <p>No new booking requests at the moment.</p>
      </div>
    </div>
  );
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
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}

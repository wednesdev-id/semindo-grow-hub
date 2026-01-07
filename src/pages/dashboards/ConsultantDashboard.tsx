import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { consultationService } from '@/services/consultationService';
import { BookOpen, DollarSign, Plus, Video, Layout, BarChart2, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PendingRequestCard } from '@/components/consultation/PendingRequestCard';
import { UpcomingSessionCard } from '@/components/consultation/UpcomingSessionCard';
import { QuickAcceptModal } from '@/components/consultation/QuickAcceptModal';
import { RejectRequestDialog } from '@/components/consultation/RejectRequestDialog';
import type { ConsultationRequest } from '@/types/consultation';
import { useToast } from '@/components/ui/use-toast';
import { CompleteSessionModal } from '@/components/consultation/CompleteSessionModal';

interface DashboardStats {
  earnings: number;
  sessions: number;
  rating: number;
  students: number;
  courses: number;
}

export default function ConsultantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  // const [activeMode, setActiveMode] = useState<'marketplace' | 'lms'>('marketplace'); // REMOVED
  const [stats, setStats] = useState<DashboardStats>({
    earnings: 0,
    sessions: 0,
    rating: 0,
    students: 0,
    courses: 0
  });

  // Request management state
  const [pendingRequests, setPendingRequests] = useState<ConsultationRequest[]>([]);
  const [upcomingRequests, setUpcomingRequests] = useState<ConsultationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

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

    // Fetch pending requests
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      const requests = await consultationService.getRequests('consultant');
      const profileResponse = await consultationService.getOwnProfile();
      const profile = Array.isArray(profileResponse) ? profileResponse[0] : (profileResponse as any);

      // Filter pending
      const pending = requests.filter(r => r.status === 'pending');
      setPendingRequests(pending);

      // Filter upcoming (approved & future dates)
      const now = new Date();
      const upcoming = requests
        .filter(r => r.status === 'approved' && new Date(r.requestedDate) >= now)
        .sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime());

      setUpcomingRequests(upcoming.slice(0, 5)); // Show next 5 in sidebar/main

      // Calculate Stats
      const completedSessions = requests.filter(r => r.status === 'completed');
      const totalEarnings = completedSessions.reduce((sum, r) => sum + (r.quotedPrice || 0), 0);

      setStats(prev => ({
        ...prev,
        earnings: totalEarnings,
        sessions: completedSessions.length,
        rating: profile?.averageRating || prev.rating || 0
      }));

    } catch (error) {
      console.error('Failed to load requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consultation requests',
        variant: 'destructive'
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setAcceptModalOpen(true);
    }
  };

  const handleConfirmAccept = async (data: { meetingUrl: string; meetingPlatform: string }) => {
    if (!selectedRequest) return;

    try {
      await consultationService.acceptRequest(selectedRequest.id, data);
      toast({
        title: 'Success',
        description: 'Consultation request accepted successfully'
      });
      setAcceptModalOpen(false);
      setSelectedRequest(null);
      // Refresh requests
      loadPendingRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept request. Please try again.',
        variant: 'destructive'
      });
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setRejectDialogOpen(true);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!selectedRequest) return;

    try {
      await consultationService.rejectRequest(selectedRequest.id, reason);
      toast({
        title: 'Request rejected',
        description: 'The client has been notified'
      });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      // Refresh requests
      loadPendingRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleCompleteSession = (requestId: string) => {
    const request = upcomingRequests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setCompleteModalOpen(true);
    }
  };

  const handleConfirmComplete = async (data: { sessionNotes: string; recommendations?: string }) => {
    if (!selectedRequest) return;

    try {
      await consultationService.completeSession(selectedRequest.id, data);
      toast({
        title: 'Session completed',
        description: 'Session has been marked as completed successfully'
      });
      setCompleteModalOpen(false);
      setSelectedRequest(null);
      // Refresh requests
      loadPendingRequests();
    } catch (error) {
      console.error('Failed to complete session:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete session. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const formatTime = (timeValue: string | Date) => {
    if (!timeValue) return '';
    const date = typeof timeValue === 'string' ? new Date(timeValue) : timeValue;
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Consultant Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.profile?.fullName}</p>
        </div>


      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Earnings" value={`Rp ${stats.earnings.toLocaleString()}`} icon={<DollarSign />} color="blue" />
        <StatsCard label="Completed Sessions" value={stats.sessions} icon={<Video />} color="green" />
        <StatsCard label="Average Rating" value={stats.rating} icon={<BarChart2 />} color="yellow" />
        <Link to="/consultation/requests" className="block">
          <StatsCard
            label="Pending Requests"
            value={pendingRequests.length}
            icon={<Bell />}
            color="orange"
          />
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          <MarketplaceSection
            pendingRequests={pendingRequests}
            upcomingRequests={upcomingRequests}
            loading={loadingRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onComplete={handleCompleteSession}
          />
        </div>

        {/* Right Column - Schedule / Notifications */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-4">Upcoming Schedule</h3>
            <div className="space-y-4">
              {upcomingRequests.length > 0 ? (
                upcomingRequests.slice(0, 3).map(req => (
                  <ScheduledItem
                    key={req.id}
                    time={formatTime(req.requestedStartTime)}
                    title={`Consultation with ${req.client?.fullName || 'Client'}`}
                    type={req.type?.name || 'Consultation'}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming sessions scheduled</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuickAcceptModal
        open={acceptModalOpen}
        onClose={() => {
          setAcceptModalOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmAccept}
        requestInfo={selectedRequest ? {
          clientName: selectedRequest.client?.fullName || 'Client',
          topic: selectedRequest.topic,
          date: new Date(selectedRequest.requestedDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: `${formatTime(selectedRequest.requestedStartTime)} - ${formatTime(selectedRequest.requestedEndTime)}`
        } : undefined}
      />

      <RejectRequestDialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmReject}
        clientName={selectedRequest?.client?.fullName}
      />

      <CompleteSessionModal
        open={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmComplete}
        sessionInfo={selectedRequest ? {
          clientName: selectedRequest.client?.fullName || 'Client',
          topic: selectedRequest.topic,
          date: new Date(selectedRequest.requestedDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: `${formatTime(selectedRequest.requestedStartTime)} - ${formatTime(selectedRequest.requestedEndTime)}`
        } : undefined}
      />
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

function MarketplaceSection({
  pendingRequests,
  upcomingRequests,
  loading,
  onAccept,
  onReject,
  onComplete
}: {
  pendingRequests: ConsultationRequest[];
  upcomingRequests: ConsultationRequest[];
  loading: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onComplete?: (id: string) => void;
}) {
  const displayPending = pendingRequests.slice(0, 3); // Show max 3
  const hasMorePending = pendingRequests.length > 3;
  const displayUpcoming = upcomingRequests.slice(0, 3); // Show max 3

  return (
    <div className="space-y-6">


      {/* Pending Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Pending Requests</h3>
          {pendingRequests.length > 0 && (
            <Link to="/consultation/requests" className="text-blue-600 text-sm hover:underline">
              View All ({pendingRequests.length})
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : displayPending.length > 0 ? (
          <div className="space-y-3">
            {displayPending.map((request) => (
              <PendingRequestCard
                key={request.id}
                request={request}
                onAccept={onAccept}
                onReject={onReject}
              />
            ))}
            {hasMorePending && (
              <div className="text-center pt-2">
                <Link
                  to="/consultation/requests"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  + {pendingRequests.length - 3} more pending requests
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-muted-foreground space-y-2">
              <p className="font-medium">No pending requests</p>
              <p className="text-sm">Requests from clients will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      {upcomingRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Upcoming Sessions</h3>
            <Link to="/consultation/requests" className="text-blue-600 text-sm hover:underline">
              View All Sessions
            </Link>
          </div>

          <div className="space-y-3">
            {displayUpcoming.map((request) => (
              <UpcomingSessionCard
                key={request.id}
                request={request}
                onComplete={(id) => onComplete?.(id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

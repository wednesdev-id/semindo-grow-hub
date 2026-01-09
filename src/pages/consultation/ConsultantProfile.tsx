import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { consultationService } from '../../services/consultationService';
import type { ConsultantProfile } from '../../types/consultation';
import { Star, Clock, Calendar, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { BookingForm } from '@/components/consultation/BookingForm';
import ReviewList from '@/components/consultation/ReviewList';
import ReviewForm from '@/components/consultation/ReviewForm';
import { useToast } from '@/components/ui/use-toast';

export default function ConsultantProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadConsultant();
        }
    }, [id]);

    const loadConsultant = async () => {
        try {
            setLoading(true);
            const data = await consultationService.getConsultant(id!);
            setConsultant(data);
        } catch (error) {
            console.error('Failed to load consultant:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!consultant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Consultant not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />

            {/* Back to Layanan Konsultasi */}
            <div className="max-w-5xl mx-auto px-4 pt-24">
                <Link to="/layanan-konsultasi" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Layanan Konsultasi
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <div className="flex items-start">
                        <img
                            src={consultant.user.profilePictureUrl || '/default-avatar.png'}
                            alt={consultant.user.fullName}
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        <div className="ml-6 flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {consultant.user.fullName}
                            </h1>
                            <p className="text-lg text-gray-600 mt-1">{consultant.title}</p>
                            <p className="text-gray-700 mt-2">{consultant.tagline}</p>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center">
                                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                                    <span className="font-semibold">{consultant.averageRating.toFixed(1)}</span>
                                    <span className="text-gray-600 ml-1">
                                        ({consultant.totalSessions} sessions)
                                    </span>
                                </div>
                                <div className="text-gray-700">
                                    {consultant.yearsExperience} years experience
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                                {consultant.packages?.length ? (
                                    <>Mulai Rp {Math.min(...consultant.packages.map((p: any) => p.price)).toLocaleString()}</>
                                ) : consultant.hourlyRate ? (
                                    <>Rp {consultant.hourlyRate.toLocaleString()}/hr</>
                                ) : null}
                            </div>
                            <button
                                onClick={() => setShowBookingModal(true)}
                                disabled={!consultant.isAcceptingNewClients}
                                className={`mt-4 px-6 py-3 rounded-lg font-semibold ${consultant.isAcceptingNewClients
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {consultant.isAcceptingNewClients ? 'Book Session' : 'Not Available'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">About</h2>
                    <p className="text-gray-700 whitespace-pre-line">{consultant.bio}</p>
                </div>

                {/* Expertise */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                        {((consultant as any).expertise || []).map((exp: any, idx: number) => (
                            <span
                                key={idx}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full"
                            >
                                {exp.expertise?.name || exp.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Industries */}
                {consultant.industries && consultant.industries.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">Industries</h2>
                        <div className="flex flex-wrap gap-2">
                            {consultant.industries.map((industry, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full"
                                >
                                    {industry}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Languages</h2>
                    <div className="flex gap-2">
                        {consultant.languages.map((lang, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="max-w-5xl mx-auto px-4 mb-8">
                <ReviewList consultantId={id!} />
            </div>

            {/* Footer */}
            <div className="mt-auto">
                <Footer />
            </div>

            {/* Booking Modal */}
            {showBookingModal && consultant && (
                <BookingModal
                    consultant={consultant}
                    onClose={() => setShowBookingModal(false)}
                />
            )}

            {/* Review Modal */}
            {/* Logic for showing review modal from URL param or button */}
            {/* For now, we rely on deep linking or a future button. 
                If we want to support ?action=review, we need useEffect logic. 
                Adding basic support for it. */}
            <ReviewModalController consultant={consultant} />
        </div>
    );
}

// Review Modal Controller to handle URL params
function ReviewModalController({ consultant }: { consultant: ConsultantProfile | null }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (searchParams.get('action') === 'review') {
            setIsOpen(true);
        }
    }, [searchParams]);

    const handleClose = () => {
        setIsOpen(false);
        // Remove param
        searchParams.delete('action');
        setSearchParams(searchParams);
    };

    if (!isOpen || !consultant) return null;

            // Calculate duration in minutes
            const start = new Date(`${selectedSlot.date}T${selectedSlot.startTime}`);
            const end = new Date(`${selectedSlot.date}T${selectedSlot.endTime}`);
            const durationMinutes = (end.getTime() - start.getTime()) / 60000;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Write a Review</h3>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <ReviewForm
                    consultantId={consultant.id}
                    consultantName={consultant.user.fullName}
                    onSuccess={() => {
                        handleClose();
                        // Ideally refresh list
                        window.location.reload();
                    }}
                    onCancel={handleClose}
                />
            </div>
        </div>
    )
}

// Booking Modal Component
function BookingModal({ consultant, onClose }: { consultant: ConsultantProfile; onClose: () => void }): JSX.Element {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Book a Session</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <BookingForm
                    consultant={consultant}
                    onSuccess={() => {
                        alert('Booking request submitted successfully! Check pending status in history.');
                        navigate('/consultation/history?status=pending');
                    }}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
}

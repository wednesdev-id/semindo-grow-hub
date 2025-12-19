import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService } from '../../services/consultationService';
import type { ConsultantProfile } from '../../types/consultation';
import { Star, Clock, Calendar } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50">
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
                                Rp {consultant.hourlyRate?.toLocaleString()}/hr
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
                        {consultant.expertiseAreas.map((area, idx) => (
                            <span
                                key={idx}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full"
                            >
                                {area}
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

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    consultant={consultant}
                    onClose={() => setShowBookingModal(false)}
                />
            )}
        </div>
    );
}

// Booking Modal Component
function BookingModal({ consultant, onClose }: { consultant: ConsultantProfile; onClose: () => void }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        duration: 60,
        topic: '',
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await consultationService.createRequest({
                consultantId: consultant.id,
                requestedDate: formData.date,
                requestedStartTime: formData.startTime,
                requestedEndTime: formData.endTime,
                durationMinutes: formData.duration,
                topic: formData.topic,
                description: formData.description,
            });
            alert('Booking request submitted successfully!');
            navigate('/consultation/dashboard');
        } catch (error) {
            console.error('Failed to submit booking:', error);
            alert('Failed to submit booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Book a Session</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Time</label>
                            <input
                                type="time"
                                required
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={90}>1.5 hours</option>
                                <option value={120}>2 hours</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Topic</label>
                        <input
                            type="text"
                            required
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            placeholder="What would you like to discuss?"
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Provide more details about your consultation needs..."
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

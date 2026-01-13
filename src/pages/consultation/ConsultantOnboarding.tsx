import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationService } from '../../services/consultationService';
import { Save, ArrowLeft } from 'lucide-react';

const EXPERTISE_OPTIONS = [
    'Marketing', 'Digital Strategy', 'Social Media',
    'Finance', 'Accounting', 'Budgeting',
    'Legal', 'Licensing', 'Compliance',
    'Technology', 'Digital Transformation', 'E-commerce',
    'Export', 'International Trade', 'Documentation',
    'HR', 'Recruitment', 'Team Management',
    'Product Development', 'Innovation', 'Quality Control'
];

const LANGUAGE_OPTIONS = ['Indonesian', 'English', 'Mandarin', 'Arabic', 'Japanese'];

export default function ConsultantOnboarding() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        tagline: '',
        bio: '',
        expertiseAreas: [] as string[],
        yearsExperience: 0,
        hourlyRate: 0,
        languages: ['Indonesian'] as string[],
        certifications: '',
        education: '',
    });

    const handleExpertiseToggle = (expertise: string) => {
        setFormData(prev => ({
            ...prev,
            expertiseAreas: prev.expertiseAreas.includes(expertise)
                ? prev.expertiseAreas.filter(e => e !== expertise)
                : [...prev.expertiseAreas, expertise]
        }));
    };

    const handleLanguageToggle = (lang: string) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.includes(lang)
                ? prev.languages.filter(l => l !== lang)
                : [...prev.languages, lang]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.expertiseAreas.length === 0) {
            alert('Please select at least one expertise area');
            return;
        }

        try {
            setLoading(true);
            await consultationService.createProfile(formData);
            alert('Profile submitted for admin approval!');
            navigate('/consultation/dashboard');
        } catch (error: any) {
            console.error('Failed to create profile:', error);
            alert(error.message || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold">Become a Consultant</h1>
                    <p className="text-gray-600 mt-2">
                        Share your expertise and help UMKM grow their businesses
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Professional Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Senior Marketing Consultant"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Tagline */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tagline *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.tagline}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            placeholder="e.g., Helping SMEs grow through digital marketing"
                            maxLength={100}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.tagline.length}/100 characters</p>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Professional Bio *
                        </label>
                        <textarea
                            required
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about your experience, achievements, and how you can help UMKM..."
                            rows={6}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Expertise Areas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expertise Areas * (Select all that apply)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {EXPERTISE_OPTIONS.map((expertise) => (
                                <label key={expertise} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.expertiseAreas.includes(expertise)}
                                        onChange={() => handleExpertiseToggle(expertise)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">{expertise}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Selected: {formData.expertiseAreas.length} areas
                        </p>
                    </div>

                    {/* Years of Experience */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Years of Experience *
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            max="50"
                            value={formData.yearsExperience}
                            onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Hourly Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hourly Rate (IDR) *
                        </label>
                        <input
                            type="number"
                            required
                            min="100000"
                            step="50000"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                            placeholder="500000"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Preview: Rp {formData.hourlyRate.toLocaleString()}/hour
                        </p>
                    </div>

                    {/* Languages */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Languages Spoken
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <label key={lang} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.languages.includes(lang)}
                                        onChange={() => handleLanguageToggle(lang)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">{lang}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Certifications */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certifications (Optional)
                        </label>
                        <textarea
                            value={formData.certifications}
                            onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                            placeholder="List your relevant certifications (one per line)"
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Education */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Education Background (Optional)
                        </label>
                        <textarea
                            value={formData.education}
                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                            placeholder="Your educational background"
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Submit for Approval
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your profile will be reviewed by our admin team. You'll receive
                            an email notification once approved. This usually takes 1-2 business days.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

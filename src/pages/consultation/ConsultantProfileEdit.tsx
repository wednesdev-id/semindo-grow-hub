import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationService } from '../../services/consultationService';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

const EXPERTISE_OPTIONS = [
    'Marketing', 'Digital Strategy', 'Social Media',
    'Finance', 'Accounting', 'Budgeting',
    'Legal', 'Licensing', 'Compliance',
    'Technology', 'Digital Transformation', 'E-commerce',
    'Export', 'International Trade', 'Documentation',
    'HR', 'Recruitment', 'Team Management',
    'Product Development', 'Innovation', 'Quality Control'
];

export default function ConsultantProfileEdit() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await consultationService.getOwnProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to load profile:', error);
            alert('Failed to load profile. You may need to complete onboarding first.');
            navigate('/consultation/onboarding');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await consultationService.updateProfile(profile);
            alert('Profile updated successfully!');
            navigate('/consultation/dashboard');
        } catch (error) {
            console.error('Failed to update:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-6">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold">Edit Profile</h1>
                    <p className="text-gray-600 mt-2">Update your consultant profile information</p>
                </div>

                <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={profile?.title || ''}
                            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                        <input
                            type="text"
                            value={profile?.tagline || ''}
                            onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                            value={profile?.bio || ''}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (IDR)</label>
                        <input
                            type="number"
                            value={profile?.hourlyRate || 0}
                            onChange={(e) => setProfile({ ...profile, hourlyRate: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Rp {profile?.hourlyRate?.toLocaleString() || 0}/hour</p>
                    </div>

                    <div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={profile?.isAcceptingNewClients || false}
                                onChange={(e) => setProfile({ ...profile, isAcceptingNewClients: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium">Accepting New Clients</span>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => navigate(-1)} className="flex-1 px-6 py-3 border rounded-lg" disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

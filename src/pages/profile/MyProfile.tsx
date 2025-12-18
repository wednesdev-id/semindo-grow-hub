import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { profileService } from '@/services/profileService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        businessName: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await profileService.getMyProfile();
            const userData = response.data;
            setUser(userData);
            setFormData({
                fullName: userData.fullName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                businessName: userData.businessName || '',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load profile',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await profileService.updateMyProfile({
                fullName: formData.fullName,
                phone: formData.phone,
                businessName: formData.businessName,
            });

            setUser(response.data);
            toast({
                title: 'Success',
                description: 'Profile updated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update profile',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Error',
                description: 'Please select an image file',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Error',
                description: 'File size must be less than 5MB',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);

        try {
            const response = await profileService.uploadProfilePicture(file);
            setUser(response.data);
            toast({
                title: 'Success',
                description: 'Profile picture updated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to upload picture',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">Manage your personal information</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Picture Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>Update your profile photo</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={user?.profilePictureUrl} alt={user?.fullName} />
                            <AvatarFallback className="text-2xl">
                                {user?.fullName ? getInitials(user.fullName) : <UserIcon />}
                            </AvatarFallback>
                        </Avatar>

                        <div className="w-full">
                            <input
                                type="file"
                                id="picture-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById('picture-upload')?.click()}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Photo
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                JPG, PNG or WebP. Max 5MB.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Information Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="businessName">Business Name (Optional)</Label>
                                <Input
                                    id="businessName"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/profile/change-password')}
                                >
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

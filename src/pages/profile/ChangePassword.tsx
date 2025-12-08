import { useState } from 'react';
import { profileService } from '@/services/profileService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    const passwordRequirements = [
        { label: 'At least 8 characters', met: formData.newPassword.length >= 8 },
        { label: 'Contains uppercase and lowercase', met: /[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) },
        { label: 'Contains number', met: /\d/.test(formData.newPassword) },
        { label: 'Contains special character', met: /[^a-zA-Z0-9]/.test(formData.newPassword) },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: 'Error',
                description: 'New passwords do not match',
                variant: 'destructive',
            });
            return;
        }

        if (formData.newPassword.length < 8) {
            toast({
                title: 'Error',
                description: 'Password must be at least 8 characters long',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            await profileService.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            });

            toast({
                title: 'Success',
                description: 'Password changed successfully',
            });

            // Reset form
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            // Navigate back to profile after a short delay
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to change password',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Change Password</h1>
                <p className="text-muted-foreground">Update your password to keep your account secure</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Password Settings</CardTitle>
                    <CardDescription>
                        Choose a strong password that you don't use elsewhere
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Current Password */}
                        <div className="grid gap-2">
                            <Label htmlFor="oldPassword">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="oldPassword"
                                    type={showOldPassword ? 'text' : 'password'}
                                    value={formData.oldPassword}
                                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.newPassword && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-muted'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                                    </p>
                                </div>
                            )}

                            {/* Password Requirements */}
                            {formData.newPassword && (
                                <div className="space-y-1 mt-2">
                                    {passwordRequirements.map((req, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            {req.met ? (
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <XCircle className="h-3 w-3 text-muted-foreground" />
                                            )}
                                            <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <p className="text-xs text-red-500">Passwords do not match</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Changing Password...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/profile')}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

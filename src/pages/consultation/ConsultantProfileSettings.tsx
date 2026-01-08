import { useState, useEffect } from 'react';
import { consultationService } from '../../services/consultationService';
import { api } from '@/services/api';
import { ExpertiseCategory } from '@/types/consultation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Calendar, Clock, Trash2, Check } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import PackagesTab from '@/components/consultation/PackagesTab';

export default function ConsultantProfileSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Profile Data
    const [formData, setFormData] = useState({
        title: '',
        bio: '',
        hourlyRate: 0,
        expertiseAreas: [] as string[], // Deprecated, kept for backward compatibility
        expertiseIds: [] as string[], // New: selected expertise IDs
        isAcceptingNewClients: false,
        videoIntroUrl: ''
    });
    const [expertiseList, setExpertiseList] = useState<ExpertiseCategory[]>([]);
    const [isNewProfile, setIsNewProfile] = useState(false);

    // Availability Data
    const [slots, setSlots] = useState<any[]>([]);
    const [newSlot, setNewSlot] = useState({
        date: '',
        dayOfWeek: 1, // Default Monday
        startTime: '09:00',
        endTime: '10:00',
        isRecurring: false
    });

    useEffect(() => {
        fetchExpertise();
        fetchProfile();
    }, []);

    const fetchExpertise = async () => {
        try {
            const response = await api.get<{ success: boolean; data: ExpertiseCategory[] }>('/consultation/expertise/active');
            const data = response.data || response;
            setExpertiseList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load expertise:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await consultationService.getOwnProfile();
            const profile = (response as any).data || response;

            if (!profile) throw new Error("Profile not found");

            setFormData({
                title: profile.title || '',
                bio: profile.bio || '',
                hourlyRate: profile.hourlyRate || 0,
                expertiseAreas: profile.expertiseAreas || [],
                expertiseIds: profile.expertise?.map((e: any) => e.expertise?.id || e.id) || [],
                isAcceptingNewClients: profile.isAcceptingNewClients || false,
                videoIntroUrl: profile.videoIntroUrl || ''
            });

            setIsNewProfile(false);
            // Only fetch availability if we are SURE profile exists and response was successful
            fetchAvailability();
        } catch (error: any) {
            console.warn("Profile fetch error/not found:", error.message);
            // If 404, it means profile doesn't exist yet
            if (error.response?.status === 404 || error.message?.includes('not found') || error.message?.includes('404')) {
                setIsNewProfile(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailability = async () => {
        try {
            const response = await consultationService.getAvailability();
            setSlots((response as any) || []);
        } catch (error: any) {
            // Silently handle 404 since it just means no availability/profile yet
            if (error.response?.status === 404 || error.message?.includes('not found') || error.message?.includes('404')) {
                console.warn("Availability not found (likely new consultant):", error.message);
                setSlots([]);
                return;
            }
            console.error("Failed to load availability", error);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isNewProfile) {
                await consultationService.createProfile({
                    title: formData.title,
                    bio: formData.bio,
                    hourlyRate: parseFloat(formData.hourlyRate.toString()),
                    expertiseIds: formData.expertiseIds,
                    // Default values for required fields
                    yearsExperience: 1,
                    certifications: '',
                    education: '',
                    languages: ['Indonesian']
                });
                setIsNewProfile(false);
                toast({ title: 'Success', description: 'Profile created successfully' });
            } else {
                await consultationService.updateProfile({
                    title: formData.title,
                    bio: formData.bio,
                    hourlyRate: parseFloat(formData.hourlyRate.toString()),
                    expertiseIds: formData.expertiseIds,
                    isAcceptingNewClients: formData.isAcceptingNewClients
                });
                toast({ title: 'Success', description: 'Profile updated successfully' });
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddSlot = async () => {
        if (isNewProfile) {
            toast({ title: 'Error', description: 'Please create your profile first before adding slots.', variant: 'destructive' });
            return;
        }

        if (!newSlot.startTime || !newSlot.endTime) {
            toast({ title: 'Error', description: 'Please fill time details', variant: 'destructive' });
            return;
        }

        if (!newSlot.isRecurring && !newSlot.date) {
            toast({ title: 'Error', description: 'Please select a date', variant: 'destructive' });
            return;
        }

        try {
            const payload: any = {
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
                isAvailable: true,
                isRecurring: newSlot.isRecurring
            };

            if (newSlot.isRecurring) {
                payload.dayOfWeek = newSlot.dayOfWeek;
            } else {
                payload.specificDate = new Date(newSlot.date).toISOString().split('T')[0];
            }

            await consultationService.addAvailability(payload);
            fetchAvailability();
            toast({ title: 'Success', description: 'Slot added successfully' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteSlot = async (id: string) => {
        try {
            await consultationService.removeAvailability(id);
            setSlots(slots.filter(s => s.id !== id));
            toast({ title: 'Success', description: 'Slot removed' });
        } catch (error: any) {
            toast({ title: 'Error', description: "Failed to remove slot", variant: 'destructive' });
        }
    };

    const toggleExpertise = (expertiseId: string) => {
        setFormData(prev => {
            const isSelected = prev.expertiseIds.includes(expertiseId);
            if (isSelected) {
                // Remove if already selected
                return { ...prev, expertiseIds: prev.expertiseIds.filter(id => id !== expertiseId) };
            } else {
                // Add if not at max (5)
                if (prev.expertiseIds.length >= 5) {
                    toast({ title: 'Limit reached', description: 'Maximum 5 expertise areas allowed', variant: 'destructive' });
                    return prev;
                }
                return { ...prev, expertiseIds: [...prev.expertiseIds, expertiseId] };
            }
        });
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Consultant Management</h1>
                <p className="text-muted-foreground">Manage your profile and availability</p>
            </div>

            <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                    <TabsTrigger value="packages" disabled={isNewProfile} title={isNewProfile ? "Create profile first" : ""}>Packages</TabsTrigger>
                    <TabsTrigger value="availability" disabled={isNewProfile} title={isNewProfile ? "Create profile first" : ""} >Availability & Slots</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Public Profile</CardTitle>
                            <CardDescription>Visible to potential clients</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Accepting New Clients</Label>
                                        <p className="text-sm text-muted-foreground">Turn this on to appear in search results</p>
                                    </div>
                                    <Switch
                                        checked={formData.isAcceptingNewClients}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isAcceptingNewClients: checked })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Professional Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Senior Financial Advisor"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Professional Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="min-h-[120px]"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Expertise Areas *</Label>
                                    <p className="text-sm text-muted-foreground">Select 1-5 areas of expertise</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {expertiseList.map((expertise) => {
                                            const isSelected = formData.expertiseIds.includes(expertise.id);
                                            return (
                                                <button
                                                    key={expertise.id}
                                                    type="button"
                                                    onClick={() => toggleExpertise(expertise.id)}
                                                    className={`flex items-center justify-between gap-2 p-3 rounded-lg border-2 transition-all ${isSelected
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <span className="text-sm font-medium text-left">{expertise.name}</span>
                                                    {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Selected: {formData.expertiseIds.length}/5
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (isNewProfile ? 'Create Profile' : 'Save Profile Changes')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AVAILABILITY TAB */}
                <TabsContent value="availability">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Availability</CardTitle>
                            <CardDescription>Add time slots for clients to book</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add Slot Form */}
                            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                                <div className="flex items-center space-x-4 mb-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={newSlot.isRecurring}
                                            onCheckedChange={(checked) => setNewSlot({ ...newSlot, isRecurring: checked })}
                                            id="recurring-mode"
                                        />
                                        <Label htmlFor="recurring-mode">Weekly Recurring</Label>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {newSlot.isRecurring ? "Set weekly schedule (e.g., Every Monday)" : "Set for a specific date only"}
                                    </span>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    {newSlot.isRecurring ? (
                                        <div className="grid gap-2 w-full md:w-48">
                                            <Label>Day of Week</Label>
                                            <Select
                                                value={newSlot.dayOfWeek.toString()}
                                                onValueChange={(val) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(val) })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                                                        <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div className="grid gap-2 w-full md:w-48">
                                            <Label>Date</Label>
                                            <Input
                                                type="date"
                                                min={format(new Date(), 'yyyy-MM-dd')}
                                                value={newSlot.date}
                                                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-2 w-32">
                                        <Label>Start Time</Label>
                                        <Input
                                            type="time"
                                            value={newSlot.startTime}
                                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2 w-32">
                                        <Label>End Time</Label>
                                        <Input
                                            type="time"
                                            value={newSlot.endTime}
                                            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                        />
                                    </div>
                                    <Button onClick={handleAddSlot}><Plus className="mr-2 h-4 w-4" /> Add Slot</Button>
                                </div>
                            </div>

                            {/* Slots List */}
                            <div className="space-y-2">
                                <h3 className="font-medium">Your Slots</h3>
                                {slots.length === 0 ? (
                                    <p className="text-muted-foreground text-sm italic">No availability slots added yet.</p>
                                ) : (
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {slots.map((slot: any) => (
                                            <div key={slot.id} className="flex items-center justify-between p-3 border rounded-md bg-white shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    <div className="text-sm">
                                                        <div className="font-medium">
                                                            {slot.isRecurring
                                                                ? `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek || 0]}`
                                                                : format(new Date(slot.specificDate || slot.date), 'EEE, dd MMM yyyy')
                                                            }
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {format(new Date(slot.startTime), 'HH:mm')} - {format(new Date(slot.endTime), 'HH:mm')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {slot.isRecurring && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Recurring</Badge>}
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSlot(slot.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PACKAGES TAB */}
                <TabsContent value="packages">
                    <PackagesTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

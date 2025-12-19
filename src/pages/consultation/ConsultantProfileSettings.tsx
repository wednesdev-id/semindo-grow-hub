import { useState, useEffect } from 'react';
import { consultationService } from '../../services/consultationService';
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
import { Loader2, Plus, X, Calendar, Clock, Trash2 } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

export default function ConsultantProfileSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Profile Data
    const [formData, setFormData] = useState({
        title: '',
        bio: '',
        hourlyRate: 0,
        expertiseAreas: [] as string[],
        isAcceptingNewClients: false,
        videoIntroUrl: ''
    });
    const [newExpertise, setNewExpertise] = useState('');

    // Availability Data
    const [slots, setSlots] = useState<any[]>([]);
    const [newSlot, setNewSlot] = useState({
        date: '',
        startTime: '09:00',
        endTime: '10:00'
    });

    useEffect(() => {
        fetchProfile();
        fetchAvailability();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await consultationService.getOwnProfile();
            const profile = (response as any).data || response;
            setFormData({
                title: profile.title || '',
                bio: profile.bio || '',
                hourlyRate: profile.hourlyRate || 0,
                expertiseAreas: profile.expertiseAreas || [],
                isAcceptingNewClients: profile.isAcceptingNewClients || false,
                videoIntroUrl: profile.videoIntroUrl || ''
            });
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailability = async () => {
        try {
            const response = await consultationService.getAvailability();
            setSlots((response as any).data || []);
        } catch (error) {
            console.error("Failed to load availability", error);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await consultationService.updateProfile({
                title: formData.title,
                bio: formData.bio,
                hourlyRate: parseFloat(formData.hourlyRate.toString()),
                expertiseAreas: formData.expertiseAreas,
                isAcceptingNewClients: formData.isAcceptingNewClients
            });
            toast({ title: 'Success', description: 'Profile updated successfully' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddSlot = async () => {
        if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
            toast({ title: 'Error', description: 'Please fill all slot details', variant: 'destructive' });
            return;
        }
        try {
            await consultationService.addAvailability({
                // Using specificDate based on types/consultation.ts AvailabilitySlot interface
                specificDate: new Date(newSlot.date).toISOString().split('T')[0], // format YYYY-MM-DD
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
                isAvailable: true,
                isRecurring: false
            });
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

    const addExpertise = () => {
        if (!newExpertise.trim()) return;
        if (formData.expertiseAreas.includes(newExpertise.trim())) return;
        setFormData(prev => ({ ...prev, expertiseAreas: [...prev.expertiseAreas, newExpertise.trim()] }));
        setNewExpertise('');
    };

    const removeExpertise = (area: string) => {
        setFormData(prev => ({ ...prev, expertiseAreas: prev.expertiseAreas.filter(a => a !== area) }));
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Consultant Management</h1>
                <p className="text-muted-foreground">Manage your profile and availability</p>
            </div>

            <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                    <TabsTrigger value="availability">Availability & Slots</TabsTrigger>
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
                                <div className="grid gap-4 md:grid-cols-2">
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
                                        <Label htmlFor="hourlyRate">Hourly Rate (IDR)</Label>
                                        <Input
                                            id="hourlyRate"
                                            type="number"
                                            value={formData.hourlyRate}
                                            onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                                        />
                                    </div>
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
                                    <Label>Expertise Areas</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newExpertise}
                                            onChange={(e) => setNewExpertise(e.target.value)}
                                            placeholder="Add expertise..."
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                                        />
                                        <Button type="button" onClick={addExpertise} variant="outline"><Plus className="h-4 w-4" /></Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.expertiseAreas.map((area) => (
                                            <Badge key={area} variant="secondary" className="flex items-center gap-1">
                                                {area}
                                                <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeExpertise(area)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Profile Changes'}
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
                            <div className="p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row gap-4 items-end">
                                <div className="grid gap-2 flex-1">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        min={format(new Date(), 'yyyy-MM-dd')}
                                        value={newSlot.date}
                                        onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                                    />
                                </div>
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
                                                        <div className="font-medium">{format(new Date(slot.date), 'EEE, dd MMM yyyy')}</div>
                                                        <div className="text-muted-foreground">{slot.startTime} - {slot.endTime}</div>
                                                    </div>
                                                </div>
                                                {slot.status === 'available' ? (
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSlot(slot.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Badge variant="secondary">Booked</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

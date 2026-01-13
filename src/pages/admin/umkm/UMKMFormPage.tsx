import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

import { UMKMProfile } from '@/types/umkm';

export default function UMKMFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        nib: '',
        npwp: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        sector: '',
        turnover: '',
        assets: '',
        employees: '',
        foundedYear: '',
        productionCapacity: '',
    });

    useEffect(() => {
        if (isEdit) {
            fetchProfile();
        }
    }, [id]);

    const fetchProfile = async () => {
        try {
            const data = await api.get<UMKMProfile>(`/umkm/${id}`);
            setFormData({
                businessName: data.businessName || '',
                ownerName: data.ownerName || '',
                nib: data.nib || '',
                npwp: data.npwp || '',
                phone: data.phone || '',
                email: data.email || '',
                website: data.website || '',
                address: data.address || '',
                city: data.city || '',
                province: data.province || '',
                postalCode: data.postalCode || '',
                sector: data.sector || '',
                turnover: data.turnover ? data.turnover.toString() : '',
                assets: data.assets ? data.assets.toString() : '',
                employees: data.employees ? data.employees.toString() : '',
                foundedYear: data.foundedYear ? data.foundedYear.toString() : '',
                productionCapacity: data.productionCapacity || '',
            });
        } catch (error) {
            toast.error('Failed to fetch profile data');
            navigate('/admin/umkm');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                turnover: formData.turnover ? Number(formData.turnover) : undefined,
                assets: formData.assets ? Number(formData.assets) : undefined,
                employees: formData.employees ? Number(formData.employees) : undefined,
                foundedYear: formData.foundedYear ? Number(formData.foundedYear) : undefined,
            };

            if (isEdit) {
                await api.patch(`/umkm/${id}`, payload);
                toast.success('UMKM profile updated successfully');
            } else {
                await api.post('/umkm', payload);
                toast.success('UMKM profile created successfully');
            }
            navigate('/admin/umkm');
        } catch (error) {
            console.error(error);
            toast.error(isEdit ? 'Failed to update profile' : 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/umkm')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit UMKM Profile' : 'New UMKM Profile'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEdit ? 'Update existing UMKM information.' : 'Register a new UMKM into the database.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>Basic details about the business entity.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name *</Label>
                            <Input
                                id="businessName"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ownerName">Owner Name *</Label>
                            <Input
                                id="ownerName"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nib">NIB</Label>
                            <Input
                                id="nib"
                                name="nib"
                                value={formData.nib}
                                onChange={handleChange}
                                placeholder="Nomor Induk Berusaha"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="npwp">NPWP</Label>
                            <Input
                                id="npwp"
                                name="npwp"
                                value={formData.npwp}
                                onChange={handleChange}
                                placeholder="Nomor Pokok Wajib Pajak"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sector">Business Sector</Label>
                            <Select
                                name="sector"
                                value={formData.sector}
                                onValueChange={(val) => handleSelectChange('sector', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select sector" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Kuliner">Kuliner</SelectItem>
                                    <SelectItem value="Fashion">Fashion</SelectItem>
                                    <SelectItem value="Kriya">Kriya</SelectItem>
                                    <SelectItem value="Jasa">Jasa</SelectItem>
                                    <SelectItem value="Agribisnis">Agribisnis</SelectItem>
                                    <SelectItem value="Teknologi">Teknologi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="foundedYear">Founded Year</Label>
                            <Input
                                id="foundedYear"
                                name="foundedYear"
                                type="number"
                                value={formData.foundedYear}
                                onChange={handleChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact & Location</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone / WhatsApp</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City / Regency</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="province">Province</Label>
                            <Input
                                id="province"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Financial & Operational</CardTitle>
                        <CardDescription>Used for automatic segmentation.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="turnover">Annual Turnover (IDR)</Label>
                            <Input
                                id="turnover"
                                name="turnover"
                                type="number"
                                value={formData.turnover}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="assets">Total Assets (IDR)</Label>
                            <Input
                                id="assets"
                                name="assets"
                                type="number"
                                value={formData.assets}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employees">Number of Employees</Label>
                            <Input
                                id="employees"
                                name="employees"
                                type="number"
                                value={formData.employees}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="productionCapacity">Production Capacity</Label>
                            <Input
                                id="productionCapacity"
                                name="productionCapacity"
                                value={formData.productionCapacity}
                                onChange={handleChange}
                                placeholder="e.g., 1000 units/month"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/umkm')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Profile'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

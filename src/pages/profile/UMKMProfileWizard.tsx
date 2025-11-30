import { useState, useEffect } from 'react'
import { profileService } from '@/services/profileService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'

export default function UMKMProfileWizard() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        sector: '',
        yearEstablished: '',
        employeeCount: '',
        annualRevenue: '',
        assetsValue: '',
        legalEntity: '',
        nib: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await profileService.getMe()
            const umkm = res.data.umkm
            if (umkm) {
                setFormData({
                    businessName: umkm.businessName || '',
                    ownerName: umkm.ownerName || '',
                    address: umkm.address || '',
                    city: umkm.city || '',
                    province: umkm.province || '',
                    postalCode: umkm.postalCode || '',
                    phone: umkm.phone || '',
                    email: umkm.email || '',
                    website: umkm.website || '',
                    description: umkm.description || '',
                    sector: umkm.sector || '',
                    yearEstablished: umkm.yearEstablished?.toString() || '',
                    employeeCount: umkm.employeeCount?.toString() || '',
                    annualRevenue: umkm.annualRevenue?.toString() || '',
                    assetsValue: umkm.assetsValue?.toString() || '',
                    legalEntity: umkm.legalEntity || '',
                    nib: umkm.nib || ''
                })
            }
        } catch (error) {
            console.error(error)
            // If 404 or no profile, just leave empty
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Convert numbers
            const payload = {
                ...formData,
                yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : undefined,
                employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
                annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : undefined,
                assetsValue: formData.assetsValue ? parseFloat(formData.assetsValue) : undefined,
            }

            await profileService.updateUMKM(payload)
            toast({ title: 'Success', description: 'Profile updated successfully' })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update profile',
                variant: 'destructive',
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">UMKM Profile</h1>
                    <p className="text-muted-foreground">Manage your business information.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>Basic details about your business.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ownerName">Owner Name</Label>
                            <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="province">Province</Label>
                            <Input id="province" name="province" value={formData.province} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Business Details</CardTitle>
                        <CardDescription>Industry, size, and financials.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="sector">Industry Sector</Label>
                            <Input id="sector" name="sector" value={formData.sector} onChange={handleChange} required placeholder="e.g. F&B, Fashion, Craft" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="yearEstablished">Year Established</Label>
                            <Input id="yearEstablished" name="yearEstablished" type="number" value={formData.yearEstablished} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="employeeCount">Employee Count</Label>
                            <Input id="employeeCount" name="employeeCount" type="number" value={formData.employeeCount} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="annualRevenue">Annual Revenue (IDR)</Label>
                            <Input id="annualRevenue" name="annualRevenue" type="number" value={formData.annualRevenue} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="assetsValue">Assets Value (IDR)</Label>
                            <Input id="assetsValue" name="assetsValue" type="number" value={formData.assetsValue} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Tell us about your business..." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Legal Information</CardTitle>
                        <CardDescription>Legal entity and registration.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="legalEntity">Legal Entity</Label>
                            <select
                                id="legalEntity"
                                name="legalEntity"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.legalEntity}
                                onChange={handleChange}
                            >
                                <option value="">Select Entity</option>
                                <option value="PT">PT</option>
                                <option value="CV">CV</option>
                                <option value="UD">UD</option>
                                <option value="Perorangan">Perorangan</option>
                                <option value="Koperasi">Koperasi</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="nib">NIB (Nomor Induk Berusaha)</Label>
                            <Input id="nib" name="nib" value={formData.nib} onChange={handleChange} />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}

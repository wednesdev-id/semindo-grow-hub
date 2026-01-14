import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { Search, Plus, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import UMKMStats from '@/components/umkm/UMKMStats'; // Added this import

import { UMKMProfile, UMKMListResponse } from '@/types/umkm';

export default function UMKMListPage() {
    const navigate = useNavigate();
    const userIdFilter = new URLSearchParams(window.location.search).get('userId');


    const [profiles, setProfiles] = useState<UMKMProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        fetchProfiles();
    }, [debouncedSearch, page, userIdFilter]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(userIdFilter && { userId: userIdFilter }),
            });


            const response = await api.get<UMKMListResponse>(`/umkm?${params}`);
            if (response.data && Array.isArray(response.data)) {
                setProfiles(response.data);
            } else {
                console.warn('Expected array for profiles but got:', response.data);
                setProfiles([]);
            }
            setTotalPages(response.meta?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch UMKM profiles', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">UMKM Database</h1>
                <p className="text-muted-foreground">Manage and monitor UMKM profiles.</p>
            </div>

            <UMKMStats />

            <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                    Manage and monitor UMKM profiles, segmentation, and growth.
                </p>
                <Button onClick={() => navigate('/admin/umkm/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Add UMKM
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, owner, or NIB..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Sector</TableHead>
                                <TableHead>Segmentation</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : profiles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No UMKM profiles found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                profiles.map((profile) => (
                                    <TableRow
                                        key={profile.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate(`/ admin / umkm / ${profile.id} `)}
                                    >
                                        <TableCell className="font-medium">{profile.businessName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{profile.ownerName}</span>
                                                <span className="text-xs text-muted-foreground">{profile.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{profile.city || '-'}</TableCell>
                                        <TableCell>{profile.sector || '-'}</TableCell>
                                        <TableCell>
                                            {profile.segmentation && (
                                                <Badge variant="outline">{profile.segmentation}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    profile.status === 'verified' ? 'default' :
                                                        profile.status === 'rejected' ? 'destructive' : 'secondary'
                                                }
                                            >
                                                {profile.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

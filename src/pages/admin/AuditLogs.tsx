import { useState, useEffect } from 'react';
import { auditService, AuditLog, AuditLogFilters } from '@/services/auditService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const { toast } = useToast();

    const [filters, setFilters] = useState<AuditLogFilters>({
        page: 1,
        limit: 50,
        action: '',
        resource: '',
        search: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await auditService.getAllLogs({ ...filters, page });
            setLogs(response.data);
            setTotalPages(response.meta?.totalPages || 1);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load audit logs',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        setPage(1);
        fetchLogs();
    };

    const handleClearFilters = () => {
        setFilters({
            page: 1,
            limit: 50,
            action: '',
            resource: '',
            search: '',
            startDate: '',
            endDate: '',
        });
        setPage(1);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await auditService.exportLogs(filters);
            toast({
                title: 'Success',
                description: 'Audit logs exported successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to export logs',
                variant: 'destructive',
            });
        } finally {
            setExporting(false);
        }
    };

    const getActionBadgeVariant = (action: string) => {
        if (action.includes('create')) return 'default';
        if (action.includes('update')) return 'secondary';
        if (action.includes('delete')) return 'destructive';
        if (action.includes('login')) return 'outline';
        return 'secondary';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">View all system activity and changes</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                    <Button onClick={handleExport} disabled={exporting}>
                        {exporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter audit logs by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Search</Label>
                                <Input
                                    placeholder="Search..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Action</Label>
                                <Select
                                    value={filters.action}
                                    onValueChange={(value) => setFilters({ ...filters, action: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All actions</SelectItem>
                                        <SelectItem value="user.create">User Create</SelectItem>
                                        <SelectItem value="user.update">User Update</SelectItem>
                                        <SelectItem value="user.delete">User Delete</SelectItem>
                                        <SelectItem value="role.create">Role Create</SelectItem>
                                        <SelectItem value="role.update">Role Update</SelectItem>
                                        <SelectItem value="auth.login">Login</SelectItem>
                                        <SelectItem value="auth.logout">Logout</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Resource</Label>
                                <Select
                                    value={filters.resource}
                                    onValueChange={(value) => setFilters({ ...filters, resource: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All resources" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All resources</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="role">Role</SelectItem>
                                        <SelectItem value="permission">Permission</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleApplyFilters}>
                                <Search className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleClearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Logs</CardTitle>
                    <CardDescription>
                        Showing {logs.length} logs (Page {page} of {totalPages})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Resource</TableHead>
                                        <TableHead>IP Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-sm">
                                                {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                {log.user ? (
                                                    <div>
                                                        <p className="font-medium">{log.user.fullName}</p>
                                                        <p className="text-sm text-muted-foreground">{log.user.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">System</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getActionBadgeVariant(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{log.resource}</p>
                                                    {log.resourceId && (
                                                        <p className="text-sm text-muted-foreground font-mono">
                                                            {log.resourceId.substring(0, 8)}...
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {log.ipAddress || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

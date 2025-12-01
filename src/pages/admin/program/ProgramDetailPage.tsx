import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, Plus, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '../../../services/api';
import { Program, ProgramBatch, ProgramParticipant } from '../../../types/program';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { formatDate } from '../../../lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';

export const ProgramDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [program, setProgram] = useState<Program | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<ProgramParticipant[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    useEffect(() => {
        if (id) fetchProgram(id);
    }, [id]);

    useEffect(() => {
        if (selectedBatchId) fetchParticipants(selectedBatchId);
    }, [selectedBatchId]);

    const fetchProgram = async (programId: string) => {
        try {
            const data = await api.get<Program>(`/programs/${programId}`) as unknown as Program;
            setProgram(data);
            if (data.batches && data.batches.length > 0) {
                setSelectedBatchId(data.batches[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch program:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async (batchId: string) => {
        setLoadingParticipants(true);
        try {
            const data = await api.get(`/programs/batches/${batchId}/participants`) as unknown as ProgramParticipant[];
            setParticipants(data);
        } catch (error) {
            console.error('Failed to fetch participants:', error);
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleStatusUpdate = async (participantId: string, newStatus: string) => {
        try {
            await api.patch(`/programs/participants/${participantId}/status`, { status: newStatus });
            // Refresh participants
            if (selectedBatchId) fetchParticipants(selectedBatchId);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!program) return <div>Program not found</div>;

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate('/admin/programs')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Programs
            </Button>

            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
                        <Badge
                            variant={program.status === 'active' ? 'default' : 'secondary'}
                            className={`capitalize ${program.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                        >
                            {program.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                            {program.type}
                        </Badge>
                    </div>
                    <p className="text-gray-500 max-w-2xl">{program.description}</p>
                </div>
                <Button>Edit Program</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Batches & Participants</CardTitle>
                            <Button size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                New Batch
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {program.batches && program.batches.length > 0 ? (
                            <Tabs defaultValue={program.batches[0].id} onValueChange={setSelectedBatchId}>
                                <TabsList className="mb-4">
                                    {program.batches.map((batch) => (
                                        <TabsTrigger key={batch.id} value={batch.id}>
                                            {batch.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {program.batches.map((batch) => (
                                    <TabsContent key={batch.id} value={batch.id}>
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500 block">Start Date</span>
                                                    <span className="font-medium">{formatDate(batch.startDate)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">End Date</span>
                                                    <span className="font-medium">{formatDate(batch.endDate)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">Capacity</span>
                                                    <span className="font-medium">{batch._count?.participants || 0} / {batch.maxParticipants}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">Status</span>
                                                    <Badge variant="outline">Active</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold mb-4">Participants</h3>
                                        {loadingParticipants ? (
                                            <LoadingSpinner />
                                        ) : participants.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 text-gray-700 uppercase">
                                                        <tr>
                                                            <th className="px-4 py-3">Name</th>
                                                            <th className="px-4 py-3">Business</th>
                                                            <th className="px-4 py-3">Joined</th>
                                                            <th className="px-4 py-3">Status</th>
                                                            <th className="px-4 py-3">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {participants.map((p) => (
                                                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                                                <td className="px-4 py-3 font-medium">{p.user?.fullName}</td>
                                                                <td className="px-4 py-3">
                                                                    {p.user?.umkmProfile?.businessName || p.user?.businessName || '-'}
                                                                </td>
                                                                <td className="px-4 py-3">{formatDate(p.joinedAt)}</td>
                                                                <td className="px-4 py-3">
                                                                    <Badge
                                                                        variant={
                                                                            p.status === 'accepted' || p.status === 'graduated'
                                                                                ? 'default'
                                                                                : p.status === 'rejected' || p.status === 'dropped'
                                                                                    ? 'destructive'
                                                                                    : 'secondary'
                                                                        }
                                                                        className={`capitalize ${p.status === 'accepted' || p.status === 'graduated' ? 'bg-green-500 hover:bg-green-600' : ''
                                                                            }`}
                                                                    >
                                                                        {p.status}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex gap-2">
                                                                        {p.status === 'applied' && (
                                                                            <>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 h-auto"
                                                                                    onClick={() => handleStatusUpdate(p.id, 'accepted')}
                                                                                    title="Accept"
                                                                                >
                                                                                    <CheckCircle className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                                                                    onClick={() => handleStatusUpdate(p.id, 'rejected')}
                                                                                    title="Reject"
                                                                                >
                                                                                    <XCircle className="w-4 h-4" />
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">No participants yet.</div>
                                        )}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">No batches created yet.</p>
                                <Button variant="outline">Create First Batch</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organizer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                    {program.organizer?.fullName?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <p className="font-medium">{program.organizer?.fullName}</p>
                                    <p className="text-sm text-gray-500">{program.organizer?.businessName || 'Admin'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

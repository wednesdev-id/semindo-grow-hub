import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { ProgramParticipant } from '../../types/program';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { formatDate } from '../../lib/utils';

export const MyProgramsPage = () => {
    const [participations, setParticipations] = useState<ProgramParticipant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyPrograms();
    }, []);

    const fetchMyPrograms = async () => {
        try {
            // We need a new endpoint for this: GET /programs/my-programs or similar.
            // For now, let's assume we can filter participants by current user ID on the backend or add a specific endpoint.
            // Since I didn't create a specific "my-programs" endpoint in the controller, I should probably add it or use the existing one if possible.
            // Wait, I didn't add a "get my participations" endpoint.
            // I should add `GET /programs/me/participations` to the backend.
            // For now, I will mock it or quickly add it.
            // Let's add it to the backend first to be correct.
            const data = await api.get('/programs/me/participations');
            setParticipations(data as ProgramParticipant[]);
        } catch (error) {
            console.error('Failed to fetch my programs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Programs</h1>

            <div className="grid grid-cols-1 gap-6">
                {participations.length > 0 ? (
                    participations.map((p) => (
                        <Card key={p.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={p.batch?.program?.type === 'incubator' ? 'default' : 'secondary'} className="capitalize">
                                                {p.batch?.program?.type}
                                            </Badge>
                                            <Badge
                                                variant={
                                                    p.status === 'accepted' || p.status === 'graduated'
                                                        ? 'default' // success
                                                        : p.status === 'rejected' || p.status === 'dropped'
                                                            ? 'destructive'
                                                            : 'secondary' // warning
                                                }
                                                className={`capitalize ${p.status === 'accepted' || p.status === 'graduated' ? 'bg-green-500 hover:bg-green-600' :
                                                        p.status === 'applied' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''
                                                    }`}
                                            >
                                                {p.status}
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{p.batch?.program?.title}</h3>
                                        <p className="text-gray-500 mb-2">{p.batch?.name}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {formatDate(p.batch?.startDate || '')} - {formatDate(p.batch?.endDate || '')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>Applied on {formatDate(p.joinedAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button variant="outline" asChild>
                                        <Link to={`/programs/${p.batch?.programId}`}>
                                            View Details <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Yet</h3>
                        <p className="text-gray-500 mb-6">You haven't joined any programs yet. Browse our catalog to find one that fits you.</p>
                        <Button asChild>
                            <Link to="/programs">Browse Programs</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

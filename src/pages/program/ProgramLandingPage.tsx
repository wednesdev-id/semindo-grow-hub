import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Program } from '../../types/program';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const ProgramLandingPage = () => {
    const { user } = useAuth();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const data = await api.get('/programs?status=active');
            setPrograms(data as Program[]);
        } catch (error) {
            console.error('Failed to fetch programs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (programId: string, batchId: string) => {
        if (!user) {
            toast.error('Please login to apply');
            return;
        }
        setApplying(batchId);
        try {
            await api.post(`/programs/batches/${batchId}/apply`, {});
            toast.success('Application submitted successfully!');
            // Ideally refresh or update local state to show applied status
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to apply');
        } finally {
            setApplying(null);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Grow Your Business with Our Programs</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Join our incubators, accelerators, and training programs designed to help UMKM scale up.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((program) => (
                    <Card key={program.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-gray-100 relative">
                            {program.bannerUrl ? (
                                <img
                                    src={program.bannerUrl}
                                    alt={program.title}
                                    className="w-full h-full object-cover rounded-t-lg"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-200">
                                    <Calendar className="w-16 h-16" />
                                </div>
                            )}
                            <Badge className="absolute top-4 right-4 capitalize" variant="default">
                                {program.type}
                            </Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl mb-2">{program.title}</CardTitle>
                            <div className="flex items-center text-sm text-gray-500 gap-4">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(program.startDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{program.batches?.[0]?._count?.participants || 0} Joined</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-gray-600 line-clamp-3">{program.description}</p>

                            {program.batches && program.batches.length > 0 && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                                    <p className="font-semibold text-gray-900 mb-1">Next Batch: {program.batches[0].name}</p>
                                    <p className="text-gray-500">
                                        Registration closes: {formatDate(program.batches[0].endDate)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            {program.batches && program.batches.length > 0 ? (
                                <Button
                                    className="w-full"
                                    onClick={() => handleApply(program.id, program.batches![0].id)}
                                    disabled={!!applying}
                                >
                                    {applying === program.batches![0].id ? (
                                        <LoadingSpinner size="sm" className="mr-2" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Apply Now
                                </Button>
                            ) : (
                                <Button className="w-full" variant="outline" disabled>
                                    No Active Batches
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {programs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No active programs available at the moment. Check back later!
                </div>
            )}
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Users, MoreVertical } from 'lucide-react';
import { api } from '../../../services/api';
import { Program } from '../../../types/program';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { formatDate } from '../../../lib/utils';

export const ProgramListPage = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const data = await api.get('/programs');
            setPrograms(data as Program[]);
        } catch (error) {
            console.error('Failed to fetch programs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPrograms = programs.filter(program => {
        const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || program.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
                    <p className="text-gray-500">Manage incubators, accelerators, and training programs.</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Program
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search programs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="incubator">Incubator</option>
                        <option value="accelerator">Accelerator</option>
                        <option value="training">Training</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map((program) => (
                    <Link key={program.id} to={`/admin/programs/${program.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <div className="h-32 bg-gray-100 relative">
                                {program.bannerUrl ? (
                                    <img
                                        src={program.bannerUrl}
                                        alt={program.title}
                                        className="w-full h-full object-cover rounded-t-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                )}
                                <Badge
                                    className={`absolute top-2 right-2 capitalize ${program.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                    variant={program.status === 'active' ? 'default' : 'secondary'}
                                >
                                    {program.status}
                                </Badge>
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="mb-2 capitalize">
                                            {program.type}
                                        </Badge>
                                        <CardTitle className="text-lg line-clamp-2">{program.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {formatDate(program.startDate)} - {formatDate(program.endDate)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>
                                            {program.batches?.[0]
                                                ? `${program.batches[0].name} (${program.batches[0]._count?.participants || 0} participants)`
                                                : 'No active batches'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

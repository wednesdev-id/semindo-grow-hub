import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';

interface MentoringSession {
    id: string;
    date: string;
    topic: string;
    notes: string;
    status: string;
    mentor: {
        user: {
            fullName: string;
        };
    };
}

interface MentoringHistoryProps {
    umkmId: string;
    sessions: MentoringSession[];
}

export default function MentoringHistory({ umkmId, sessions = [] }: MentoringHistoryProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Mentoring History</CardTitle>
                <CardDescription>Track mentoring sessions and progress.</CardDescription>
            </CardHeader>
            <CardContent>
                {sessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No mentoring sessions recorded yet.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sessions.map((session) => (
                            <div key={session.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="h-full w-px bg-border" />
                                    <div className="my-1 h-2 w-2 rounded-full bg-primary" />
                                    <div className="h-full w-px bg-border" />
                                </div>
                                <div className="flex-1 space-y-2 pb-8">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold">{session.topic}</h4>
                                        <Badge variant="outline">{session.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(session.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {session.mentor.user.fullName}
                                        </div>
                                    </div>
                                    {session.notes && (
                                        <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                                            <div className="flex gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                                <p>{session.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

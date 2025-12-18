import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { lmsService } from '@/services/lmsService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { FileText, ExternalLink } from 'lucide-react';

interface GradingInterfaceProps {
    assignmentId: string;
}

export function GradingInterface({ assignmentId }: GradingInterfaceProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [grading, setGrading] = useState(false);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const data = await lmsService.getAssignmentSubmissions(assignmentId);
                setSubmissions(data);
            } catch (error) {
                console.error('Failed to fetch submissions:', error);
                toast({ title: 'Error', description: 'Failed to load submissions', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [assignmentId]);

    const handleOpenGrade = (submission: any) => {
        setSelectedSubmission(submission);
        setGrade(submission.grade?.toString() || '');
        setFeedback(submission.feedback || '');
    };

    const handleGradeSubmit = async () => {
        if (!grade) {
            toast({ title: 'Error', description: 'Grade is required', variant: 'destructive' });
            return;
        }

        setGrading(true);
        try {
            await lmsService.gradeAssignment(selectedSubmission.id, {
                grade: Number(grade),
                feedback
            });

            // Update local state
            setSubmissions(submissions.map(s =>
                s.id === selectedSubmission.id
                    ? { ...s, grade: Number(grade), feedback, status: 'graded', gradedAt: new Date() }
                    : s
            ));

            toast({ title: 'Success', description: 'Grade submitted successfully' });
            setSelectedSubmission(null);
        } catch (error) {
            console.error('Failed to submit grade:', error);
            toast({ title: 'Error', description: 'Failed to submit grade', variant: 'destructive' });
        } finally {
            setGrading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                    <CardDescription>{submissions.length} submissions received</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell>
                                        <div className="font-medium">{submission.user.fullName}</div>
                                        <div className="text-xs text-muted-foreground">{submission.user.email}</div>
                                    </TableCell>
                                    <TableCell>{format(new Date(submission.submittedAt), 'MMM d, yyyy HH:mm')}</TableCell>
                                    <TableCell>
                                        <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                                            {submission.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{submission.grade !== null ? submission.grade : '-'}</TableCell>
                                    <TableCell>
                                        <Button size="sm" onClick={() => handleOpenGrade(submission)}>
                                            {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {submissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No submissions yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Grade Submission</DialogTitle>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label>Student</Label>
                                <div className="font-medium">{selectedSubmission.user.fullName}</div>
                            </div>

                            <div className="space-y-2">
                                <Label>Content</Label>
                                <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                                    {selectedSubmission.content || 'No text content.'}
                                </div>
                            </div>

                            {selectedSubmission.fileUrl && (
                                <div className="space-y-2">
                                    <Label>Attachment</Label>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <a
                                            href={selectedSubmission.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            View File <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-1 space-y-2">
                                    <Label>Grade (0-100)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label>Feedback</Label>
                                    <Textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Enter feedback for the student..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
                        <Button onClick={handleGradeSubmit} disabled={grading}>
                            {grading ? <LoadingSpinner className="mr-2" /> : 'Submit Grade'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

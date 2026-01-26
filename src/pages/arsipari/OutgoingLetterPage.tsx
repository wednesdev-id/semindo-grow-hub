import { useNavigate } from 'react-router-dom';
import { OutgoingLetterList } from '@/components/arsipari/outgoing-letter/OutgoingLetterList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function OutgoingLetterPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Surat Keluar</h1>
                    <p className="text-muted-foreground">
                        Kelola surat keluar, draft, dan persetujuan.
                    </p>
                </div>
                <Button onClick={() => navigate('/arsipari/outgoing/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Surat Baru
                </Button>
            </div>

            <OutgoingLetterList
                onDetail={(letter) => navigate(`/arsipari/outgoing/${letter.id}`)}
                onEdit={(letter) => navigate(`/arsipari/outgoing/${letter.id}/edit`)}
                onDelete={() => { }}
            />
        </div>
    );
}

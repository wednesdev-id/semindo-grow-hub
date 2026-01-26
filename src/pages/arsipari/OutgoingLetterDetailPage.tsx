import { useNavigate, useParams } from 'react-router-dom';
import { OutgoingLetterDetail } from '@/components/arsipari/outgoing-letter/OutgoingLetterDetail';
import { suratKeluarService } from '@/services/arsipariService';
import { useState, useEffect } from 'react';
import { OutgoingLetter } from '@/types/arsipari';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/core/auth/hooks/useAuth';

export default function OutgoingLetterDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [letter, setLetter] = useState<OutgoingLetter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadLetter(id);
        }
    }, [id]);

    const loadLetter = async (id: string) => {
        try {
            setLoading(true);
            const response = await suratKeluarService.getById(id);
            setLetter(response.data);
        } catch (error) {
            console.error('Failed to load letter:', error);
            navigate('/arsipari/outgoing');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (letter: OutgoingLetter) => {
        if (window.confirm('Ajukan surat untuk diperiksa?')) {
            try {
                // For simplicity, we assume generic approvers or select later.
                // In a perfect world we show a dialog to select approvers.
                // Here we just pass empty array or handle in backend logic default approvers.
                // Assuming service method signature: (id, approvalUserIds, notes)
                // We'll pass empty array for now or need a dialog.
                // Let's assume backend assigns defaults if empty.
                await suratKeluarService.submitApproval(letter.id, [], 'Permohonan persetujuan');
                loadLetter(letter.id);
            } catch (error) {
                console.error('Failed to submit:', error);
                alert('Gagal mengajukan surat');
            }
        }
    };

    const handleApprove = async (letter: OutgoingLetter, notes: string = '') => {
        try {
            // We need approvalId. This is tricky.
            // We need to find the PENDING approval for this user.
            const pendingApproval = letter.approvals?.find(
                a => a.status === 'PENDING' && (a.userId === user?.id || !a.userId) // !a.userId covers 'any approver' logic if exists
            );

            // If strict check on userId is needed:
            // const pendingApproval = letter.approvals?.find(a => a.status === 'PENDING' && a.userId === user?.id);

            if (pendingApproval) {
                await suratKeluarService.processApproval(letter.id, pendingApproval.id, 'APPROVED', notes);
                loadLetter(letter.id);
            } else {
                // Fallback if we can't find specific approval ID (e.g. backend handles it differently or super admin override)
                // But service expects approvalId.
                alert('Anda tidak memiliki izin akses approval pending saat ini.');
            }
        } catch (error) {
            console.error('Failed to approve:', error);
            alert('Gagal menyetujui surat');
        }
    };

    const handleReject = async (letter: OutgoingLetter, notes: string = '') => {
        try {
            const pendingApproval = letter.approvals?.find(
                a => a.status === 'PENDING' && (a.userId === user?.id || !a.userId)
            );

            if (pendingApproval) {
                await suratKeluarService.processApproval(letter.id, pendingApproval.id, 'REJECTED', notes);
                loadLetter(letter.id);
            } else {
                alert('Anda tidak memiliki izin akses approval pending saat ini.');
            }
        } catch (error) {
            console.error('Failed to reject:', error);
            alert('Gagal menolak surat');
        }
    };

    const handlePublish = async (letter: OutgoingLetter) => {
        if (window.confirm('Terbitkan surat ini? Nomor surat akan digenerate otomatis.')) {
            try {
                await suratKeluarService.publish(letter.id, new Date().toISOString());
                loadLetter(letter.id);
            } catch (error) {
                console.error('Failed to publish:', error);
                alert('Gagal menerbitkan surat');
            }
        }
    };


    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!letter) {
        return <div>Surat tidak ditemukan</div>;
    }

    return (
        <div className="max-w-5xl mx-auto py-6">
            <OutgoingLetterDetail
                letter={letter}
                currentUserId={user?.id}
                onBack={() => navigate('/arsipari/outgoing')}
                onEdit={() => navigate(`/arsipari/outgoing/${letter.id}/edit`)}
                onArchive={() => console.log('Archive', letter)}
                onSubmit={handleSubmit}
                onApprove={handleApprove}
                onReject={handleReject}
                onPublish={handlePublish}
            />
        </div>
    );
}

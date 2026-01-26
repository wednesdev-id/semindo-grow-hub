import { useNavigate, useParams } from 'react-router-dom';
import { OutgoingLetterForm } from '@/components/arsipari/outgoing-letter/OutgoingLetterForm';
import { suratKeluarService } from '@/services/arsipariService';
import { useState, useEffect } from 'react';
import { OutgoingLetter } from '@/types/arsipari';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function OutgoingLetterFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [letter, setLetter] = useState<OutgoingLetter | undefined>(undefined);
    const [loading, setLoading] = useState(!!id);

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

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6">
            <OutgoingLetterForm
                letter={letter}
                onSuccess={() => navigate('/arsipari/outgoing')}
                onCancel={() => navigate('/arsipari/outgoing')}
            />
        </div>
    );
}

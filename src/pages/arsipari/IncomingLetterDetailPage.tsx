import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IncomingLetterDetail } from "@/components/arsipari";
import { IncomingLetter } from "@/types/arsipari";
import { suratMasukService } from "@/services/arsipariService";
import { toast } from "sonner";

export default function IncomingLetterDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [letter, setLetter] = useState<IncomingLetter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadLetter(id);
        }
    }, [id]);

    const loadLetter = async (id: string) => {
        try {
            setLoading(true);
            const response = await suratMasukService.getById(id);
            setLetter(response.data);
        } catch (error) {
            console.error("Error loading letter:", error);
            toast.error("Gagal memuat surat");
            navigate("/arsipari/incoming");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/arsipari/incoming");
    };

    const handleEdit = (letter: IncomingLetter) => {
        navigate(`/arsipari/incoming/${letter.id}/edit`);
    };

    const handleArchive = async (letter: IncomingLetter) => {
        // Navigate to archive/close capability or trigger inline archive
        // For now just show toast info
        toast.info("Fitur pengarsipan akan segera hadir");
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Memuat surat...</div>;
    }

    if (!letter) {
        return <div className="p-8 text-center text-muted-foreground">Surat tidak ditemukan</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <IncomingLetterDetail
                letter={letter}
                onBack={handleBack}
                onEdit={handleEdit}
                onArchive={handleArchive}
            />
        </div>
    );
}

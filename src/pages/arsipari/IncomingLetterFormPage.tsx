import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IncomingLetterForm } from "@/components/arsipari";
import { IncomingLetter } from "@/types/arsipari";
import { suratMasukService } from "@/services/arsipariService";
import { toast } from "sonner";

export default function IncomingLetterFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [letter, setLetter] = useState<IncomingLetter | undefined>(undefined);
    const [loading, setLoading] = useState(!!id);

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
            toast.error("Gagal memuat data surat");
            navigate("/arsipari/incoming");
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (savedLetter: IncomingLetter) => {
        toast.success(id ? "Surat berhasil diperbarui" : "Surat berhasil dibuat");
        navigate(`/arsipari/incoming/${savedLetter.id}`);
    };

    const handleCancel = () => {
        navigate("/arsipari/incoming");
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Memuat data...</div>;
    }

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <IncomingLetterForm
                letter={letter}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}

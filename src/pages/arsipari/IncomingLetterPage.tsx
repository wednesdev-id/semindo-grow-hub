import { useNavigate } from "react-router-dom";
import { IncomingLetterList } from "@/components/arsipari";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { IncomingLetter } from "@/types/arsipari";

export default function IncomingLetterPage() {
    const navigate = useNavigate();

    const handleCreate = () => {
        navigate("/arsipari/incoming/new");
    };

    const handleDetail = (letter: IncomingLetter) => {
        navigate(`/arsipari/incoming/${letter.id}`);
    };

    const handleEdit = (letter: IncomingLetter) => {
        navigate(`/arsipari/incoming/${letter.id}/edit`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Surat Masuk</h2>
                    <p className="text-muted-foreground">
                        Kelola surat masuk dan disposisi
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrasi Surat
                </Button>
            </div>

            <IncomingLetterList
                onDetail={handleDetail}
                onEdit={handleEdit}
            />
        </div>
    );
}

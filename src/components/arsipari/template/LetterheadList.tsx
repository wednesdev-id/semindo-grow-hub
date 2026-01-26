
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import { templateService } from "@/services/arsipariService";
import { Letterhead } from "@/types/arsipari";
import { Badge } from "@/components/ui/badge";
import LetterheadForm from "./LetterheadForm";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LetterheadList() {
    const [letterheads, setLetterheads] = useState<Letterhead[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedLetterhead, setSelectedLetterhead] = useState<Letterhead | undefined>(undefined);

    const fetchLetterheads = async () => {
        try {
            setLoading(true);
            const response = await templateService.listLetterheads(true); // Fetch active by default
            setLetterheads(response.data || []);
        } catch (error) {
            console.error("Error fetching letterheads:", error);
            toast.error("Gagal memuat data kop surat");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLetterheads();
    }, []);

    const handleEdit = (letterhead: Letterhead) => {
        setSelectedLetterhead(letterhead);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedLetterhead(undefined);
        setFormOpen(true);
    };

    const getLogoUrl = (url?: string) => {
        if (!url) return undefined;
        return url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL || ''}${url}`;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Daftar Kop Surat</CardTitle>
                    <CardDescription>Kelola header dan logo kop surat instansi.</CardDescription>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kop Surat
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : letterheads.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        Belum ada data kop surat.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {letterheads.map((lh) => (
                            <div key={lh.id} className="group relative flex flex-col items-center justify-between rounded-lg border p-6 text-center shadow-sm transition-all hover:bg-muted/50 hover:shadow-md">
                                {lh.isDefault && (
                                    <Badge variant="default" className="absolute top-2 right-2">
                                        Default
                                    </Badge>
                                )}

                                <div className="mb-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={getLogoUrl(lh.logoUrl)} />
                                        <AvatarFallback>
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="space-y-1 mb-4">
                                    <h4 className="font-semibold">{lh.name}</h4>
                                    {lh.unit && <p className="text-sm text-muted-foreground">{lh.unit}</p>}
                                    <p className="text-xs text-muted-foreground line-clamp-2">{lh.address}</p>
                                </div>

                                <div className="flex items-center gap-2 mt-auto">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(lh)}>
                                        <Pencil className="mr-2 h-3 w-3" />
                                        Edit
                                    </Button>
                                    {/* Additional buttons like Delete or Set Default could go here */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <LetterheadForm
                open={formOpen}
                onOpenChange={setFormOpen}
                letterhead={selectedLetterhead}
                onSuccess={fetchLetterheads}
            />
        </Card>
    );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TemplateList() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Daftar Template Surat</CardTitle>
                    <CardDescription>Kelola template surat untuk surat keluar.</CardDescription>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Template
                </Button>
            </CardHeader>
            <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                    Belum ada template surat.
                </div>
            </CardContent>
        </Card>
    );
}

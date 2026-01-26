import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Image as ImageIcon, Tag, BookOpen } from "lucide-react";
import TemplateList from "../../components/arsipari/template/TemplateList";
import LetterheadList from "../../components/arsipari/template/LetterheadList";
import CategoryList from "../../components/arsipari/template/CategoryList";
import SubjectList from "../../components/arsipari/template/SubjectList";

export default function TemplatePage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Template & Arsip</h2>
            </div>

            <Tabs defaultValue="templates" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Template Surat
                    </TabsTrigger>
                    <TabsTrigger value="letterheads" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Kop Surat
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Kategori
                    </TabsTrigger>
                    <TabsTrigger value="subjects" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Perihal & Klasifikasi
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                    <TemplateList />
                </TabsContent>

                <TabsContent value="letterheads" className="space-y-4">
                    <LetterheadList />
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    <CategoryList />
                </TabsContent>

                <TabsContent value="subjects" className="space-y-4">
                    <SubjectList />
                </TabsContent>
            </Tabs>
        </div>
    );
}

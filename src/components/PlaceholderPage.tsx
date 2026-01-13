import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlaceholderPageProps {
    title: string;
    description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
            <Card className="w-full max-w-md border-dashed border-2 shadow-none bg-transparent">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Construction className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        {description || "This feature is currently under development and will be available soon."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        We are working hard to bring you the best experience. Stay tuned for updates!
                    </p>
                    <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

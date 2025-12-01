import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ArrowLeft, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ComingSoonPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            toast.success("Thanks for your interest! We'll notify you when this feature is ready.");
            setEmail("");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-in fade-in zoom-in duration-500">
            <Card className="w-full max-w-lg border-none shadow-xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Rocket className="w-10 h-10 text-primary animate-bounce" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Coming Soon</CardTitle>
                    <CardDescription className="text-lg">
                        We're working hard to bring you this amazing feature.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-muted-foreground">
                        Get notified when we launch this feature. No spam, we promise!
                    </p>

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1"
                        />
                        <Button type="submit">Notify Me</Button>
                    </form>

                    <div className="pt-4 flex justify-center">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

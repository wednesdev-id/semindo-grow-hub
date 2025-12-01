import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { programService, Program } from "@/services/programService";
import { useNavigate } from "react-router-dom";

export default function ProgramCreate() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Program>>({
        title: "",
        description: "",
        type: "training",
        status: "draft",
        startDate: "",
        endDate: "",
        quota: 0,
        registrationDeadline: "",
        location: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: keyof Program, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await programService.createProgram(formData);
            toast({
                title: "Program Created",
                description: "The program has been successfully created.",
            });
            navigate("/programs/list");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create program.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <DashboardPageHeader
                title="Create New Program"
                description="Launch a new training program or event."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Programs", href: "/programs/list" },
                    { label: "Create" },
                ]}
            />

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Program Name</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. UMKM Go Digital 2024"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the program goals and curriculum..."
                                className="min-h-[150px]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Program Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => handleSelectChange("type", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="incubator">Incubator</SelectItem>
                                        <SelectItem value="accelerator">Accelerator</SelectItem>
                                        <SelectItem value="training">Training</SelectItem>
                                        <SelectItem value="coaching">Coaching</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Initial Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => handleSelectChange("status", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                                <Input
                                    id="registrationDeadline"
                                    type="date"
                                    value={formData.registrationDeadline}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quota">Max Participants</Label>
                                <Input
                                    id="quota"
                                    type="number"
                                    value={formData.quota}
                                    onChange={handleChange}
                                    placeholder="0 for unlimited"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Online, Jakarta, etc."
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button variant="outline" type="button" onClick={() => navigate("/programs/list")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Program"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

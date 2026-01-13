import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BookOpen, Users, GraduationCap, DollarSign } from "lucide-react";
import { lmsService } from "@/services/lmsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LMSStats() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await lmsService.getAdminStats();
                setStats([
                    {
                        title: "Total Students",
                        value: data.totalStudents.toLocaleString(),
                        icon: Users,
                        trend: data.studentTrend,
                    },
                    {
                        title: "Active Courses",
                        value: data.activeCourses.toString(),
                        icon: BookOpen,
                        trend: data.courseTrend,
                    },
                    {
                        title: "Completion Rate",
                        value: `${data.completionRate}%`,
                        icon: GraduationCap,
                        trend: data.completionTrend,
                    },
                    {
                        title: "Total Revenue",
                        value: `Rp ${data.totalRevenue.toLocaleString('id-ID')}`,
                        icon: DollarSign,
                        trend: data.revenueTrend,
                    },
                ]);
            } catch (error) {
                console.error("Failed to fetch LMS stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-6">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6">
            <DashboardPageHeader
                title="LMS Statistics"
                description="Overview of your learning platform performance."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "LMS", href: "/lms/stats" },
                    { label: "Statistics" },
                ]}
            />
            <StatsCards stats={stats} />

            {/* Placeholder for charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
                <div className="col-span-4 border rounded-lg p-6 h-[400px] flex items-center justify-center bg-muted/10">
                    <p className="text-muted-foreground">Course Enrollment Trend (Chart)</p>
                </div>
                <div className="col-span-3 border rounded-lg p-6 h-[400px] flex items-center justify-center bg-muted/10">
                    <p className="text-muted-foreground">Top Categories (Chart)</p>
                </div>
            </div>
        </div>
    );
}

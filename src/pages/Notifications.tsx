import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";

export default function Notifications() {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <DashboardPageHeader
                title="Notifikasi"
                description="Pantau terus update terbaru dari pesanan dan aktivitasmu."
            />

            <div className="py-12">
                <EmptyState
                    title="Belum ada notifikasi"
                    description="Semua pemberitahuan penting akan muncul di sini."
                    icon={Bell}
                    className="bg-card border-2 border-dashed rounded-xl"
                />
            </div>
        </div>
    );
}

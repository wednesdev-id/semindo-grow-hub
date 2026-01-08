import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Heart } from "lucide-react";

export default function Wishlist() {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <DashboardPageHeader
                title="Produk Favorit"
                description="Simpan produk yang kamu sukai untuk memudahkannya saat ingin berbelanja nanti."
            />

            <div className="py-12">
                <EmptyState
                    title="Belum ada produk favorit"
                    description="Yuk, jelajahi marketplace dan simpan produk yang kamu sukai di sini."
                    icon={Heart}
                    action={{
                        label: "Mulai Belanja",
                        to: "/marketplace"
                    }}
                    className="bg-card border-2 border-dashed rounded-xl"
                />
            </div>
        </div>
    );
}

import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import SEOHead from '@/components/ui/seo-head';
import { EmptyState } from '@/components/ui/empty-state';

export default function Wishlist() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title="Produk Favorit - Marketplace UMKM"
                description="Simpan produk yang kamu sukai"
            />
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/marketplace')}
                        className="group pl-0 hover:pl-2 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Marketplace
                    </Button>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Produk Favorit</h1>
                    <p className="text-muted-foreground">Simpan produk yang kamu sukai untuk memudahkannya saat ingin berbelanja nanti.</p>
                </div>

                {/* Content */}
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

            <Footer />
        </div>
    );
}

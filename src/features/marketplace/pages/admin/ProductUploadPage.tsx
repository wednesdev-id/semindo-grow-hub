import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { marketplaceService } from '@/services/marketplaceService';
import { toast } from 'sonner';
import { ProductImage } from '@/services/marketplaceService';
import { Check, Loader2, Plus, Star, Trash } from 'lucide-react';

const formSchema = z.object({
    title: z.string().min(3, 'Nama produk minimal 3 karakter'),
    description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
    price: z.string().min(1, 'Harga harus diisi'),
    stock: z.string().min(1, 'Stok harus diisi'),
    category: z.string().min(1, 'Kategori harus dipilih'),
    images: z.array(z.any()).min(1, 'Minimal 1 gambar'),
    shopeeLink: z.string().url('Link Shopee tidak valid').optional().or(z.literal('')),
    tokopediaLink: z.string().url('Link Tokopedia tidak valid').optional().or(z.literal('')),
});

export default function ProductUploadPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<ProductImage[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            images: [],
            shopeeLink: '',
            tokopediaLink: '',
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsLoading(true);
            try {
                const files = Array.from(e.target.files);
                const uploadedImages = await marketplaceService.uploadMultipleImages(files);

                // If this is the first upload, set the first image as main
                const currentImages = form.getValues('images') || [];
                const updatedImages = [...currentImages, ...uploadedImages];

                if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
                    updatedImages[0].isMain = true;
                }

                form.setValue('images', updatedImages);
                setImages(updatedImages);
                toast.success(`${uploadedImages.length} gambar berhasil diupload`);
            } catch (error) {
                console.error(error);
                toast.error('Gagal mengupload gambar');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...images];
        const removedWasMain = newImages[index].isMain;
        newImages.splice(index, 1);

        // If we removed the main image, make the first remaining one main
        if (removedWasMain && newImages.length > 0) {
            newImages[0].isMain = true;
        }

        setImages(newImages);
        form.setValue('images', newImages);
    };

    const handleSetMainImage = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isMain: i === index
        }));
        setImages(newImages);
        form.setValue('images', newImages);
        toast.info("Gambar utama diperbarui");
    };


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const productData = {
                ...values,
                price: Number(values.price),
                stock: Number(values.stock),
                externalLinks: {
                    shopee: values.shopeeLink,
                    tokopedia: values.tokopediaLink,
                },
                images: values.images,
            };

            await marketplaceService.createProduct(productData);
            toast.success('Produk berhasil diupload');
            navigate('/dashboard/marketplace/products');
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengupload produk');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container py-10">
            <Card className="max-w-2xl mx-auto shadow-lg border-primary/10">
                <CardHeader className="bg-primary/5 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Upload Produk Baru
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Produk</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: Kopi Gayo Premium" className="focus-visible:ring-primary" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kategori</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="focus:ring-primary">
                                                    <SelectValue placeholder="Pilih kategori" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Kuliner">Kuliner & F&B</SelectItem>
                                                <SelectItem value="Fashion">Fashion & Tekstil</SelectItem>
                                                <SelectItem value="Kerajinan">Kerajinan Tangan</SelectItem>
                                                <SelectItem value="Teknologi">Teknologi & Digital</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Harga (Rp)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" className="focus-visible:ring-primary" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stok</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" className="focus-visible:ring-primary" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Deskripsi</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Jelaskan detail produk anda..."
                                                className="min-h-[100px] focus-visible:ring-primary"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-base">Foto Produk</FormLabel>
                                    <span className="text-xs text-muted-foreground">{images.length} / 10 Gambar</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    {images.map((img, index) => (
                                        <div key={index} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${img.isMain ? 'border-primary ring-2 ring-primary/20' : 'border-muted hover:border-primary/50'}`}>
                                            <img src={img.url} alt={`Product ${index + 1}`} className="object-cover w-full h-full" />

                                            {/* Badge Main */}
                                            {img.isMain && (
                                                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                    <Check className="h-3 w-3" /> Utama
                                                </div>
                                            )}

                                            {/* Actions Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {!img.isMain && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={() => handleSetMainImage(index)}
                                                        title="Set sebagai utama"
                                                    >
                                                        <Star className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => handleRemoveImage(index)}
                                                    title="Hapus gambar"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Size Badge */}
                                            {img.metadata && (
                                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded">
                                                    {(img.metadata.size / 1024).toFixed(0)} KB
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {images.length < 10 && (
                                        <div className="flex items-center justify-center border-2 border-dashed rounded-lg aspect-square cursor-pointer hover:bg-accent/50 hover:border-primary transition-all relative group">
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={handleFileChange}
                                                disabled={isLoading}
                                            />
                                            <div className="text-center group-hover:scale-110 transition-transform">
                                                <Plus className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-primary" />
                                                <span className="text-xs text-muted-foreground mt-2 block font-medium group-hover:text-primary">Tambah Foto</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <FormDescription className="bg-muted/50 p-3 rounded-md text-xs italic">
                                    💡 <b>Tips:</b> Klik ikon ⭐ pada gambar untuk menjadikannya sebagai foto profil utama produk. Semua gambar otomatis dikompresi untuk performa optimal.
                                </FormDescription>
                            </div>


                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-medium">Integrasi Marketplace Eksternal</h3>
                                <FormField
                                    control={form.control}
                                    name="shopeeLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link Shopee</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://shopee.co.id/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tokopediaLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link Tokopedia</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://tokopedia.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Upload Produk
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

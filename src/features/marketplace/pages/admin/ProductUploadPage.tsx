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
import { Loader2, Plus, Trash } from 'lucide-react';

const formSchema = z.object({
    title: z.string().min(3, 'Nama produk minimal 3 karakter'),
    description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
    price: z.string().min(1, 'Harga harus diisi'),
    stock: z.string().min(1, 'Stok harus diisi'),
    category: z.string().min(1, 'Kategori harus dipilih'),
    images: z.array(z.string().url('URL gambar tidak valid')).min(1, 'Minimal 1 gambar'),
    shopeeLink: z.string().url('Link Shopee tidak valid').optional().or(z.literal('')),
    tokopediaLink: z.string().url('Link Tokopedia tidak valid').optional().or(z.literal('')),
});

export default function ProductUploadPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>(['']);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            images: [''],
            shopeeLink: '',
            tokopediaLink: '',
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsLoading(true);
            try {
                const files = Array.from(e.target.files);
                const urls = await marketplaceService.uploadMultipleImages(files);

                // Filter out empty strings from initial state if any
                const currentUrls = form.getValues('images').filter(url => url !== '');
                const newUrls = [...currentUrls, ...urls];

                form.setValue('images', newUrls);
                setImageUrls(newUrls);
                toast.success(`${urls.length} gambar berhasil diupload`);
            } catch (error) {
                console.error(error);
                toast.error('Gagal mengupload gambar');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(newUrls);
        form.setValue('images', newUrls);
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
                // For MVP, we pass images array directly. 
                // The service might need adjustment if it expects File objects, 
                // but we updated it to handle JSON data primarily.
                images: values.images.filter(url => url !== ''),
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
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Upload Produk Baru</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Produk</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: Kopi Gayo Premium" {...field} />
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
                                                <SelectTrigger>
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
                                                <Input type="number" placeholder="0" {...field} />
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
                                                <Input type="number" placeholder="0" {...field} />
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
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <FormLabel>Foto Produk</FormLabel>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {imageUrls.filter(url => url).map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                                            <img src={url} alt={`Product ${index + 1}`} className="object-cover w-full h-full" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <Trash className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-center border-2 border-dashed rounded-md aspect-square cursor-pointer hover:bg-accent/50 transition-colors relative">
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                            disabled={isLoading}
                                        />
                                        <div className="text-center">
                                            <Plus className="h-8 w-8 mx-auto text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground mt-2 block">Upload Foto</span>
                                        </div>
                                    </div>
                                </div>
                                <FormDescription>
                                    Format: JPG, PNG. Maks 5MB per file. Minimal 1 gambar.
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

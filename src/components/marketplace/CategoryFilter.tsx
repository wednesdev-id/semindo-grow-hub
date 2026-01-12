import { useEffect, useState } from 'react';
import { marketplaceService, Category } from '@/services/marketplaceService';
import { ChevronDown } from 'lucide-react';

interface CategoryFilterProps {
    value: string;
    onChange: (category: string) => void;
    showCount?: boolean;
}

export function CategoryFilter({ value, onChange, showCount = true }: CategoryFilterProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await marketplaceService.getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="relative">
                <select disabled className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-200 text-sm bg-gray-50 cursor-not-allowed">
                    <option>Loading categories...</option>
                </select>
            </div>
        );
    }

    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
                <option value="">All Categories</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                        {category.name}
                        {showCount && category.count > 0 && ` (${category.count})`}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
    );
}

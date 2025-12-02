import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: React.ReactNode;
}

interface CategorySelectorProps {
    categories: Category[];
    selectedCategoryId: string | null;
    onSelect: (categoryId: string) => void;
    className?: string;
}

export default function CategorySelector({
    categories,
    selectedCategoryId,
    onSelect,
    className
}: CategorySelectorProps) {
    return (
        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
            {categories.map((category) => {
                const isSelected = selectedCategoryId === category.id;
                return (
                    <button
                        key={category.id}
                        onClick={() => onSelect(category.id)}
                        className={cn(
                            "relative flex flex-col items-start rounded-xl border p-4 text-left transition-all hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                                : "border-border bg-card"
                        )}
                    >
                        <div className="flex w-full items-center justify-between">
                            <span className="font-semibold text-foreground">{category.name}</span>
                            {isSelected && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                        {category.description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {category.description}
                            </p>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

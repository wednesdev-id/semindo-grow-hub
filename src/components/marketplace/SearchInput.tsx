import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
}

export function SearchInput({
    value,
    onChange,
    placeholder = "Search products...",
    debounceMs = 300
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            onChange(localValue);
            setIsLoading(false);
        }, debounceMs);

        return () => {
            clearTimeout(timer);
            setIsLoading(false);
        };
    }, [localValue, debounceMs, onChange]);

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 h-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {localValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            {isLoading && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}

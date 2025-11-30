import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, User } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl?: string;
    level: string;
    category: string;
    price: number;
    author: {
        fullName: string;
    };
    moduleCount?: number;
    duration?: number; // in minutes
}

export default function CourseCard({
    title,
    slug,
    description,
    thumbnailUrl,
    level,
    category,
    price,
    author,
    moduleCount = 0,
    duration = 0,
}: CourseCardProps) {
    const formatPrice = (price: number) => {
        if (price === 0) return "Gratis";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);
    };

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case "beginner":
                return "bg-green-100 text-green-800 hover:bg-green-200";
            case "intermediate":
                return "bg-blue-100 text-blue-800 hover:bg-blue-200";
            case "advanced":
                return "bg-purple-100 text-purple-800 hover:bg-purple-200";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <div className="relative aspect-video bg-muted">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full bg-primary/5 text-primary">
                        <BookOpen className="w-12 h-12 opacity-20" />
                    </div>
                )}
                <Badge
                    className={`absolute top-2 right-2 ${getLevelColor(level)} border-0`}
                >
                    {level}
                </Badge>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="text-sm text-muted-foreground mb-1">{category}</div>
                <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {description}
                </p>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="truncate max-w-[100px]">{author.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{duration}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{moduleCount} Modul</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 border-t flex items-center justify-between bg-muted/5">
                <div className="font-bold text-lg text-primary">
                    {formatPrice(price)}
                </div>
                <Button asChild size="sm">
                    <Link to={`/lms/courses/${slug}`}>Lihat Detail</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

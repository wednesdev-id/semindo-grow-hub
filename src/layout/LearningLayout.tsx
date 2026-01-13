import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { lmsService } from '@/services/lmsService';
import CourseSidebar from '@/features/lms/components/CourseSidebar';

export default function LearningLayout() {
    const { slug } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { data: course } = useQuery({
        queryKey: ['course', slug],
        queryFn: () => lmsService.getCourseBySlug(slug || ''),
        enabled: !!slug
    });

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <CourseSidebar
                course={course}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-14 border-b flex items-center px-4 justify-between bg-card">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                    {/* Additional header items like User Menu could go here */}
                </header>

                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

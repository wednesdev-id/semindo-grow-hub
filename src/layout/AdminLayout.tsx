import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const menuItems = [
        {
            title: 'Overview',
            icon: LayoutDashboard,
            path: '/admin/dashboard'
        },
        {
            title: 'User Verification',
            icon: Users,
            path: '/admin/umkm',
            match: '/admin/umkm'
        },
        {
            title: 'Products',
            icon: ShoppingBag,
            path: '/admin/products',
            match: '/admin/products'
        },
        {
            title: 'Consultations',
            icon: FileText,
            path: '/admin/consultation/pending', // Default to pending setup
            match: '/admin/consultation'
        },
        // { 
        //     title: 'Settings', 
        //     icon: Settings, 
        //     path: '/admin/settings' 
        // },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                            <Shield className="h-6 w-6" />
                            <span>AdminPanel</span>
                        </Link>
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-bold">
                                    {user?.fullName?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{user?.fullName || 'Administrator'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.match && location.pathname.startsWith(item.match));
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t dark:border-gray-700">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm lg:hidden">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="ml-4 font-bold text-lg">Semindo Admin</span>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

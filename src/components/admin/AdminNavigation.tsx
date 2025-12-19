import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
    CreditCard,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    UserCircle
} from "lucide-react";

export default function AdminNavigation() {
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        { title: "Dashboard", href: "/admin/consultation", icon: LayoutDashboard },
        { title: "Chat Monitoring", href: "/admin/consultation/chats", icon: MessageSquare },
    ];

    return (
        <div className="w-64 border-r min-h-screen bg-white shadow-sm flex flex-col">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Admin Panel
                </h2>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link key={item.href} to={item.href}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3",
                                location.pathname === item.href
                                    ? "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                    : "text-gray-600 hover:text-purple-600"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t space-y-2">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={logout}
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}

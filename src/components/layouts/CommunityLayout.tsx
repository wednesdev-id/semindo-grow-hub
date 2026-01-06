import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { MessageSquare, Calendar, User, Star } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';

export const CommunityLayout: React.FC = () => {
    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gray-50 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Community</h2>
                                <nav className="space-y-2">
                                    <NavLink
                                        to="/community/forum"
                                        end
                                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        <span className="font-medium">Forum Diskusi</span>
                                    </NavLink>
                                    <NavLink
                                        to="/community/events"
                                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Calendar className="w-5 h-5" />
                                        <span className="font-medium">Event & Webinar</span>
                                    </NavLink>
                                </nav>

                                <div className="mt-8">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Personal</h3>
                                    <nav className="space-y-2">
                                        <NavLink
                                            to="/community/my-threads"
                                            className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <User className="w-5 h-5" />
                                            <span className="font-medium">Diskusi Saya</span>
                                        </NavLink>
                                        <NavLink
                                            to="/community/my-events"
                                            className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <Star className="w-5 h-5" />
                                            <span className="font-medium">Event Saya</span>
                                        </NavLink>
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

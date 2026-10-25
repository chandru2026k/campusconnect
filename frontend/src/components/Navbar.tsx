import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', label: 'Feed' },
        { path: '/leaderboard', label: 'Top Scholars' },
        { path: '/profile', label: 'Profile' },
    ];

    return (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand */}
                    <div 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2.5 cursor-pointer group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform duration-200">
                            <span className="text-white font-black text-xl">C</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600">
                                CampusConnect
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1.5 bg-gray-50/80 p-1 rounded-xl border border-gray-200/60">
                        {navLinks.map((link) => (
                            <button
                                key={link.path}
                                onClick={() => navigate(link.path)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                                    isActive(link.path)
                                        ? 'bg-white text-indigo-700 shadow-sm shadow-gray-200'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                                }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* User Profile Pill & Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <div 
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-gray-50 transition cursor-pointer border border-transparent hover:border-gray-200"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-semibold text-gray-800 leading-tight">
                                    {user?.name || user?.email?.split('@')[0]}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                    {user?.role?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            title="Sign out"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{user?.name || user?.email}</p>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {user?.role?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.path}
                                onClick={() => {
                                    navigate(link.path);
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                    isActive(link.path)
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                logout();
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}

import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import {
    Home, Users, Calendar, BookOpen,
    Activity, Clock, LogOut, UserPlus, Bell
} from 'lucide-react';
import icon from '../../assets/icon.png';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <Home size={20} />, roles: ['all'] },
        { name: 'My Profile', path: '/profile', icon: <Users size={20} />, roles: ['student'] },
        // 'Clubs' removed for coordinator, replaced by 'My Club Details' below
        { name: 'Clubs', path: '/clubs', icon: <Users size={20} />, roles: ['student', 'admin'] },
        { name: 'My Enrollments', path: '/my-enrollments', icon: <Activity size={20} />, roles: ['student'] },
        { name: 'Attendance', path: '/attendance', icon: <Clock size={20} />, roles: ['student', 'coordinator'] },
        { name: 'Events', path: '/events', icon: <Calendar size={20} />, roles: ['all'] },
        { name: 'Notice Board', path: '/notices', icon: <Bell size={20} />, roles: ['all'] },
        { name: 'Materials', path: '/materials', icon: <BookOpen size={20} />, roles: ['all'] },

        // Coordinator Only
        { name: 'My Club Details', path: user && user.assignedClub ? `/clubs/${user.assignedClub}` : '#', icon: <Home size={20} />, roles: ['coordinator'] },
        { name: 'Manage Requests', path: '/manage-club', icon: <UserPlus size={20} />, roles: ['coordinator'] },

        // Coordinator/Admin specific
        { name: 'Manage Students', path: '/students', icon: <Users size={20} />, roles: ['admin', 'coordinator'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes('all') || (user && item.roles.includes(user.role))
    );

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            <div className={`fixed inset-y-0 left-0 z-50 flex flex-col h-screen w-64 bg-dark text-white shadow-xl transition-transform duration-300 transform lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center transition-all duration-300">
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-800 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                            <img src={icon} alt="CCMS Logo" className="w-full h-full object-contain rounded-[10px]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">CCMS</h1>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">Management</p>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <LogOut size={24} className="rotate-180" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive(item.path)
                                    ? 'bg-primary text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-sm font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3 text-ellipsis overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                    >
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

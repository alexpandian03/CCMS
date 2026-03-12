import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Users, Calendar, Activity, ArrowRight, Bell, Shield, Info } from 'lucide-react';
import api from '../utils/api';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-primary flex items-center justify-between">
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
            {icon}
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        clubs: 0,
        events: 0,
        members: 0,
        pending: 0,
        attendance: 0,
        clubName: null,
        membershipStatus: null
    });
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await api.get('/dashboard/stats');
                setStats(statsRes.data);

                const noticesRes = await api.get('/notices');
                setNotices(noticesRes.data.slice(0, 3)); // Latest 3
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name}!
                    </h1>
                    {user?.role === 'student' && stats.clubName && (
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                            <Shield size={16} className="text-primary" />
                            <span className="font-semibold text-gray-700">{stats.clubName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stats.membershipStatus === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {stats.membershipStatus}
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {user?.role === 'coordinator' ? (
                    <StatCard
                        title="Pending Requests"
                        value={stats.pending || 0}
                        icon={<Users size={24} color="#EF4444" />}
                        color="red"
                    />
                ) : user?.role === 'admin' ? (
                    <StatCard
                        title="Total Students"
                        value={stats.members}
                        icon={<Users size={24} color="#4F46E5" />}
                        color="indigo"
                    />
                ) : (
                    <StatCard
                        title="Club Status"
                        value={stats.membershipStatus || 'None'}
                        icon={<Shield size={24} color="#4F46E5" />}
                        color="indigo"
                        subtitle={stats.clubName}
                    />
                )}

                <StatCard
                    title="Upcoming Events"
                    value={stats.events}
                    icon={<Calendar size={24} color="#10B981" />}
                    color="emerald"
                />

                {(user?.role === 'coordinator' || user?.role === 'admin') && (
                    <StatCard
                        title="Club Members"
                        value={stats.members}
                        icon={<Activity size={24} color="#F59E0B" />}
                        color="amber"
                    />
                )}

                {user?.role === 'student' && (
                    <StatCard
                        title="Attendance"
                        value={`${stats.attendance}%`}
                        icon={<Activity size={24} color="#F59E0B" />}
                        color="amber"
                    />
                )}

                <StatCard
                    title="Active Clubs"
                    value={stats.clubs}
                    icon={<Info size={24} color="#6366F1" />}
                    color="indigo"
                />
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        {user?.role === 'admin' && (
                            <>
                                <Link to="/clubs" className="flex items-center justify-between p-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition">
                                    <span className="font-medium">Manage Clubs</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/admin-reports" className="flex items-center justify-between p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition">
                                    <span className="font-medium">View Club Activity Reports</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </>
                        )}
                        {user?.role === 'student' && !stats.clubName && (
                            <Link to="/clubs" className="flex items-center justify-between p-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition">
                                <span className="font-medium">Browse & Join Clubs</span>
                                <ArrowRight size={16} />
                            </Link>
                        )}
                        <Link to="/events" className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition">
                            <span className="font-medium">View Calendar</span>
                            <ArrowRight size={16} />
                        </Link>
                        <Link to="/notices" className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition">
                            <span className="font-medium">Check Notice Board</span>
                            <ArrowRight size={16} />
                        </Link>
                        {user?.role === 'coordinator' && (
                            <>
                                <Link to="/manage-club" className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition">
                                    <span className="font-medium">Approve Join Requests ({stats.pending})</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/students" className="flex items-center justify-between p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition">
                                    <span className="font-medium">Manage Club Members</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Bell size={20} className="text-secondary" /> Latest Notices
                        </h2>
                        <Link to="/notices" className="text-sm text-primary hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {notices.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No recent notices.</p>
                        ) : (
                            notices.map((notice) => (
                                <div key={notice._id} className={`border-l-4 ${notice.type === 'college' ? 'border-red-500' : 'border-indigo-500'} pl-4 py-1`}>
                                    <p className="text-sm font-bold text-gray-900">{notice.title}</p>
                                    <p className="text-xs text-gray-500 line-clamp-1">{notice.content}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(notice.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import { useContext, useState } from 'react';
import AuthContext from './context/AuthContext';
import { Menu, X } from 'lucide-react';
import icon from './assets/icon.png';

import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import CoordinatorLogin from './pages/CoordinatorLogin';
import Register from './pages/Register';

// Pages - Placeholders for now, will create next
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import Events from './pages/Events';
import Materials from './pages/Materials';
import Attendance from './pages/Attendance';
import MyEnrollments from './pages/MyEnrollments';
import ManageStudents from './pages/ManageStudents';
import ManageClub from './pages/ManageClub';
import Profile from './pages/Profile';
import ClubDetails from './pages/ClubDetails';
import NoticeBoard from './pages/NoticeBoard';
import AdminReports from './pages/AdminReports';

// Layout Wrapper
const Layout = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-dark text-white p-4 flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-2">
                        <img src={icon} alt="Icon" className="w-8 h-8 object-contain" />
                        <h1 className="text-xl font-bold text-primary">CCMS</h1>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <main className="flex-1 overflow-auto relative">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

// Public Route Wrapper
const PublicRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (user) {
        return <Navigate to="/" />;
    }

    return children;
};

// Role-Based Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
                    <Route path="/coordinator-login" element={<PublicRoute><CoordinatorLogin /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                    {/* Common Routes (All Authenticated Users) */}
                    <Route path="/" element={<Layout><Dashboard /></Layout>} />
                    <Route path="/clubs" element={<Layout><Clubs /></Layout>} />
                    <Route path="/clubs/:id" element={<Layout><ClubDetails /></Layout>} />
                    <Route path="/events" element={<Layout><Events /></Layout>} />
                    <Route path="/materials" element={<Layout><Materials /></Layout>} />
                    <Route path="/notices" element={<Layout><NoticeBoard /></Layout>} />

                    {/* Student & Coordinator Routes */}
                    <Route path="/attendance" element={
                        <Layout>
                            <ProtectedRoute allowedRoles={['student', 'coordinator']}>
                                <Attendance />
                            </ProtectedRoute>
                        </Layout>
                    } />

                    {/* Student Only Routes */}
                    <Route path="/my-enrollments" element={
                        <Layout>
                            <ProtectedRoute allowedRoles={['student']}>
                                <MyEnrollments />
                            </ProtectedRoute>
                        </Layout>
                    } />
                    <Route path="/profile" element={
                        <Layout>
                            <ProtectedRoute allowedRoles={['student']}>
                                <Profile />
                            </ProtectedRoute>
                        </Layout>
                    } />

                    {/* Coordinator Only Routes */}
                    <Route path="/manage-club" element={
                        <Layout>
                            <ProtectedRoute allowedRoles={['coordinator']}>
                                <ManageClub />
                            </ProtectedRoute>
                        </Layout>
                    } />

                    {/* Admin & Coordinator Routes */}
                    <Route path="/students" element={
                        <Layout>
                            <ProtectedRoute allowedRoles={['admin', 'coordinator']}>
                                <ManageStudents />
                            </ProtectedRoute>
                        </Layout>
                    } />

                    <Route path="/admin-reports" element={
                        <Layout>
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminReports />
                            </ProtectedRoute>
                        </Layout>
                    } />

                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

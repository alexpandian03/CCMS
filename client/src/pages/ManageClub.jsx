import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { Check, X, User } from 'lucide-react';

const ManageClub = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user?.assignedClub) {
            fetchEnrollments();
        } else {
            setLoading(false); // No club assigned or not a coordinator
        }
    }, [user]);

    const fetchEnrollments = async () => {
        try {
            const { data } = await api.get(`/enrollments/club/${user.assignedClub}`);
            setEnrollments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (enrollmentId, status) => {
        try {
            await api.put(`/enrollments/${enrollmentId}`, { status });
            // Optimistic update
            setEnrollments(enrollments.map(e =>
                e._id === enrollmentId ? { ...e, status } : e
            ));
            alert(`Request ${status}!`);
        } catch (error) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div>Loading requests...</div>;

    if (!user?.assignedClub) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-700">No Club Assigned</h2>
                <p className="text-gray-500">You have not been assigned as a coordinator for any club yet.</p>
            </div>
        );
    }

    const pendingRequests = enrollments.filter(e => e.status === 'pending');
    const history = enrollments.filter(e => e.status !== 'pending');

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Manage Enrollment Requests</h1>

            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-orange-600 flex items-center">
                    <User className="mr-2" size={20} />
                    Pending Requests ({pendingRequests.length})
                </h2>

                {pendingRequests.length === 0 ? (
                    <p className="text-gray-500 italic">No pending requests.</p>
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map(enrollment => (
                            <div key={enrollment._id} className="border border-gray-200 rounded-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-900">{enrollment.student?.name}</p>
                                    <p className="text-sm text-gray-600">{enrollment.student?.rollNumber} • {enrollment.student?.department}</p>
                                    <p className="text-sm text-gray-500 mt-1">Has applied to join.</p>
                                    <p className="text-xs text-gray-400 mt-1">Reason: "{enrollment.reason}"</p>
                                </div>
                                <div className="flex space-x-2 mt-3 md:mt-0">
                                    <button
                                        onClick={() => handleStatusUpdate(enrollment._id, 'approved')}
                                        className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                    >
                                        <Check size={16} className="mr-1" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(enrollment._id, 'rejected')}
                                        className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                    >
                                        <X size={16} className="mr-1" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* History */}
            <div className="bg-white rounded-lg shadow-md p-6 opacity-75">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">History</h2>
                {history.length === 0 ? (
                    <p className="text-gray-500 italic">No past records.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history.map(enrollment => (
                                    <tr key={enrollment._id}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{enrollment.student?.name}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${enrollment.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {enrollment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageClub;

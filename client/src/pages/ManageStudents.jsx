import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { User, Search, Mail, Phone, BookOpen } from 'lucide-react';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            fetchStudents();
        }
    }, [user]);

    const fetchStudents = async () => {
        try {
            let data;
            if (user.role === 'admin') {
                // Admin sees all students
                const response = await api.get('/students');
                data = response.data;
            } else if (user.role === 'coordinator' && user.assignedClub) {
                // Coordinator sees only their club's approved students
                // We use the enrollments endpoint which maps students
                const response = await api.get(`/enrollments/club/${user.assignedClub}`);
                // Extract student objects from enrollment records
                data = response.data
                    .filter(enrollment => enrollment.status === 'approved')
                    .map(enrollment => enrollment.student);
            } else {
                data = [];
            }
            setStudents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading students...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search by name, roll number, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Student List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredStudents.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">No students found matching your search.</li>
                    ) : (
                        filteredStudents.map((student) => (
                            <li key={student._id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center truncate">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="ml-4 truncate">
                                                <div className="flex items-center text-sm font-medium text-indigo-600 truncate">
                                                    {student.name}
                                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {student.rollNumber}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:space-x-4 mt-1">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        {student.email}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <BookOpen className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        {student.department} - {student.year}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex flex-col items-end text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Phone className="mr-1 h-3 w-3" /> {student.phoneNumber || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Links Section (Only if documents exist) */}
                                    {student.documents && Object.keys(student.documents).length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Uploaded Documents:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(student.documents).map(([key, path]) => {
                                                    const docLabels = {
                                                        aadhar: 'Aadhar Card',
                                                        bankPassbook: 'Bank Passbook',
                                                        markSheet10: '10th Marksheet',
                                                        markSheet12: '12th Marksheet',
                                                        photo: 'Passport Photo',
                                                        bioData: 'Bio Data'
                                                    };
                                                    return (
                                                        <a
                                                            key={key}
                                                            href={`http://localhost:5000${path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                        >
                                                            {docLabels[key] || key}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ManageStudents;

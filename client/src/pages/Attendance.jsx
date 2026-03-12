import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { Calendar, Save, BarChart2, CheckCircle, XCircle, Search } from 'lucide-react';

const Attendance = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'stats'
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'present' | 'absent' }
    const [stats, setStats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.assignedClub) {
            fetchStudents();
            if (activeTab === 'mark') {
                fetchExistingAttendance(selectedDate);
            } else {
                calculateStats();
            }
        }
    }, [user, activeTab, selectedDate]);

    // Fetch ONLY approved students
    const fetchStudents = async () => {
        try {
            const { data } = await api.get(`/enrollments/club/${user.assignedClub}`);
            const approved = data
                .filter(e => e.status === 'approved')
                .map(e => e.student);
            setStudents(approved);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchExistingAttendance = async (date) => {
        try {
            const { data } = await api.get(`/attendance?clubId=${user.assignedClub}&date=${date}`);

            if (data.length > 0) {
                // Determine status for each student from existing record
                const recordMap = {};
                data[0].records.forEach(r => {
                    recordMap[r.student._id] = r.status;
                });
                setAttendanceRecords(recordMap);
            } else {
                // Default to 'present' for all if no record exists
                setAttendanceRecords({});
            }
        } catch (error) {
            console.error(error);
        }
    };

    const calculateStats = async () => {
        try {
            const { data } = await api.get(`/attendance?clubId=${user.assignedClub}`);
            // data is Array of Attendance objects (Days)

            const totalDays = data.length;
            const studentStats = {};

            // Initialize stats for current students
            students.forEach(s => {
                studentStats[s._id] = {
                    name: s.name,
                    rollNumber: s.rollNumber,
                    present: 0,
                    total: totalDays,
                    history: []
                };
            });

            // Iterate through every attendance day
            data.forEach(day => {
                day.records.forEach(record => {
                    if (studentStats[record.student._id]) {
                        if (record.status === 'present') {
                            studentStats[record.student._id].present++;
                        }
                        studentStats[record.student._id].history.push({
                            date: day.date,
                            status: record.status
                        });
                    }
                });
            });

            setStats(Object.values(studentStats));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkChange = (studentId, status) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmit = async () => {
        try {
            // Construct payload: map all students to their status (default present if untouched)
            const records = students.map(s => ({
                student: s._id,
                status: attendanceRecords[s._id] || 'present'
            }));

            await api.post('/attendance', {
                clubId: user.assignedClub,
                date: selectedDate,
                records
            });
            alert('Attendance saved successfully!');

            // Should refresh stats if we switch tabs
        } catch (error) {
            alert('Failed to save attendance');
        }
    };

    if (!user?.assignedClub && user?.role === 'coordinator') {
        return <div className="p-8 text-center text-gray-500">No club assigned. Contact Admin.</div>;
    }

    if (user?.role === 'student') {
        const [studentStats, setStudentStats] = useState({ present: 0, total: 0, history: [] });

        useEffect(() => {
            fetchMyAttendance();
        }, []);

        const fetchMyAttendance = async () => {
            try {
                const { data } = await api.get('/attendance/my');
                // Backend returns array of Attendance documents where student consists in records

                let presentCount = 0;
                const history = [];

                data.forEach(day => {
                    const myRecord = day.records.find(r => r.student === user._id);
                    if (myRecord) {
                        if (myRecord.status === 'present') presentCount++;
                        history.push({
                            date: day.date,
                            status: myRecord.status,
                            clubName: day.club.name
                        });
                    }
                });

                // Sort history newest first
                history.sort((a, b) => new Date(b.date) - new Date(a.date));

                setStudentStats({
                    present: presentCount,
                    total: data.length, // Assuming data contains only relevant club days, or we might need total conducted days per club
                    history
                });
            } catch (error) {
                console.error(error);
            }
        };

        const percentage = studentStats.total > 0
            ? Math.round((studentStats.present / studentStats.total) * 100)
            : 0;

        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>

                {/* Stats Card */}
                <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium">Overall Attendance</p>
                        <h2 className={`text-4xl font-bold mt-2 ${percentage >= 75 ? 'text-green-600' :
                                percentage >= 50 ? 'text-orange-500' : 'text-red-600'
                            }`}>
                            {percentage}%
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {studentStats.present} Present / {studentStats.total} Total Working Days
                        </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <BarChart2 size={32} className="text-indigo-600" />
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">Attendance History</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {studentStats.history.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                studentStats.history.map((record, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {record.clubName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'present'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const filteredStats = stats.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
                <button
                    onClick={() => setActiveTab('mark')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'mark'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Calendar size={18} className="inline mr-2" />
                    Mark Daily
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'stats'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <BarChart2 size={18} className="inline mr-2" />
                    View History & Stats
                </button>
            </div>

            {/* Mark Attendance View */}
            {activeTab === 'mark' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <label className="font-medium text-gray-700">Select Date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border rounded-md px-3 py-2"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map(student => {
                                    const status = attendanceRecords[student._id] || 'present';
                                    return (
                                        <tr key={student._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">{student.rollNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleMarkChange(student._id, 'present')}
                                                        className={`flex items-center px-3 py-1.5 rounded-md text-sm transition ${status === 'present'
                                                            ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <CheckCircle size={16} className="mr-1" /> Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkChange(student._id, 'absent')}
                                                        className={`flex items-center px-3 py-1.5 rounded-md text-sm transition ${status === 'absent'
                                                            ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <XCircle size={16} className="mr-1" /> Absent
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            className="flex items-center px-6 py-2 bg-primary text-white rounded-md hover:bg-indigo-700"
                        >
                            <Save size={20} className="mr-2" />
                            Save Attendance
                        </button>
                    </div>
                </div>
            )}

            {/* Stats View */}
            {activeTab === 'stats' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="mb-6 max-w-md">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                placeholder="Search student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStats.map(stat => {
                                    const percentage = stat.total > 0
                                        ? Math.round((stat.present / stat.total) * 100)
                                        : 0;

                                    let colorClass = 'text-green-600';
                                    if (percentage < 75) colorClass = 'text-orange-600';
                                    if (percentage < 50) colorClass = 'text-red-600';

                                    return (
                                        <tr key={stat.rollNumber}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{stat.name}</div>
                                                <div className="text-sm text-gray-500">{stat.rollNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {stat.total}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {stat.present}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full bg-gray-100 ${colorClass}`}>
                                                    {percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;

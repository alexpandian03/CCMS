import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Download, TrendingUp, Users } from 'lucide-react';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const { data } = await api.get('/admin/reports/clubs');
                setReports(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching reports', error);
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleDownload = () => {
        // Implementation for CSV export could go here
        alert('Report export functionality coming soon!');
    };

    if (loading) return <div>Loading reports...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="text-primary" /> Admin Reports
                </h1>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition shadow-sm"
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-indigo-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">Top Club Attendance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {reports.length > 0 ? Math.max(...reports.map(r => r.avgAttendance)) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-emerald-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">Total Club Members</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {reports.reduce((acc, curr) => acc + curr.memberCount, 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-amber-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-medium">Activity Pulse</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {reports.reduce((acc, curr) => acc + curr.eventCount, 0)} Events Held
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinator</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Attendance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{report.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.coordinator}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{report.memberCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{report.eventCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium mr-2">{report.avgAttendance}%</span>
                                            <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full ${report.avgAttendance > 75 ? 'bg-emerald-500' : report.avgAttendance > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{ width: `${report.avgAttendance}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.eventCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {report.eventCount > 0 ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;

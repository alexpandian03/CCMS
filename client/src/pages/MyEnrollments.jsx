import { Activity } from 'lucide-react';

const MyEnrollments = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Enrollments</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-40 text-gray-500">
                    <div className="text-center">
                        <Activity size={40} className="mx-auto mb-2 text-gray-300" />
                        <p>Your club memberships will be listed here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MyEnrollments;

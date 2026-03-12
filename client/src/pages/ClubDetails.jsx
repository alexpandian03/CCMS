import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Users, Calendar, ArrowLeft, Mail, BookOpen } from 'lucide-react';

const ClubDetails = () => {
    const { id } = useParams();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClub = async () => {
            try {
                const { data } = await api.get(`/clubs/${id}`);
                setClub(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load club details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClub();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return (
        <div className="p-4 text-center">
            <h2 className="text-red-500 text-xl font-bold">Error</h2>
            <p className="text-red-700">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Attempted ID: {id}</p>
        </div>
    );
    if (!club) return <div>Club not found</div>;

    return (
        <div className="space-y-6">
            <Link to="/" className="flex items-center text-indigo-600 hover:text-indigo-800 transition">
                <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-64 bg-gray-200 w-full object-cover flex items-center justify-center">
                    {club.image ? (
                        <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                    ) : (
                        <Users size={64} className="text-gray-400" />
                    )}
                </div>

                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{club.name}</h1>

                    <div className="flex flex-wrap gap-4 mb-6">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Users size={16} className="mr-2" />
                            {club.capacity} Capacity
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Users size={16} className="mr-2" />
                            Coordinator: {club.coordinator?.name || 'TBA'}
                        </span>
                        {club.coordinator?.email && (
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                <Mail size={16} className="mr-2" />
                                {club.coordinator.email}
                            </span>
                        )}
                    </div>

                    <div className="prose max-w-none text-gray-600">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">About Us</h3>
                        <p>{club.description}</p>
                    </div>

                    {/* Quick Links Section */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link to="/events" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center transition">
                                <Calendar className="text-indigo-500 mr-3" size={24} />
                                <div>
                                    <p className="font-medium text-gray-900">Events</p>
                                    <p className="text-sm text-gray-500">View upcoming activities</p>
                                </div>
                            </Link>
                            <Link to="/materials" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center transition">
                                <BookOpen className="text-emerald-500 mr-3" size={24} />
                                <div>
                                    <p className="font-medium text-gray-900">Resources</p>
                                    <p className="text-sm text-gray-500">Study materials & docs</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubDetails;

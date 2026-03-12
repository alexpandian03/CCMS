import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { Calendar, MapPin, Clock, Users, CheckCircle, List } from 'lucide-react';

const Events = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get('/events');
            setEvents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            await api.post(`/events/${eventId}/register`);
            alert('Registered successfully!');
            fetchEvents(); // Refresh to update capacity/buttons if needed
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to register');
        }
    };

    const fetchRegistrations = async (event) => {
        try {
            const { data } = await api.get(`/events/${event._id}/registrations`);
            setRegistrations(data);
            setSelectedEvent(event);
        } catch (error) {
            alert('Error fetching registrations');
        }
    };

    if (loading) return <div>Loading events...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{event.name}</h3>
                                <span className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded mt-1 inline-block font-medium">
                                    {event.club?.name || 'Club Event'}
                                </span>
                            </div>
                            <div className="text-center bg-gray-100 p-2 rounded min-w-[50px]">
                                <p className="text-xs font-bold text-gray-500 uppercase">
                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                                </p>
                                <p className="text-xl font-bold text-gray-900">
                                    {new Date(event.date).getDate()}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-4 text-sm flex-1">{event.description}</p>

                        <div className="space-y-2 text-sm text-gray-500 mb-6">
                            <div className="flex items-center">
                                <Clock size={16} className="mr-2" />
                                {event.time}
                            </div>
                            <div className="flex items-center">
                                <MapPin size={16} className="mr-2" />
                                {event.venue}
                            </div>
                            <div className="flex items-center text-indigo-600 font-medium">
                                <Users size={16} className="mr-2" />
                                Capacity: {event.capacity || 50}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-2">
                            {user?.role === 'student' && (
                                <button
                                    onClick={() => handleRegister(event._id)}
                                    className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} /> Register
                                </button>
                            )}
                            {(user?.role === 'coordinator' || user?.role === 'admin') && (
                                <button
                                    onClick={() => fetchRegistrations(event)}
                                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                >
                                    <List size={18} /> Registrations
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No upcoming events found.
                </div>
            )}

            {/* Registrations Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Registrations: {selectedEvent.name}</h2>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-gray-700">Close</button>
                        </div>

                        {registrations.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No students registered yet.</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {registrations.map((reg) => (
                                        <tr key={reg._id}>
                                            <td className="px-4 py-3">{reg.student?.name}</td>
                                            <td className="px-4 py-3">{reg.student?.rollNumber}</td>
                                            <td className="px-4 py_3">{reg.student?.department}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;

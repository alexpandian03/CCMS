import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { Plus, Users, X, Info } from 'lucide-react';

const Clubs = () => {
    const [clubs, setClubs] = useState([]);
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        capacity: 100,
        coordinator: ''
    });

    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchClubs();
        if (user?.role === 'admin') {
            fetchCoordinators();
        }
    }, [user]);

    const fetchClubs = async () => {
        try {
            const { data } = await api.get('/clubs');
            setClubs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoordinators = async () => {
        try {
            const { data } = await api.get('/students?role=coordinator');
            setCoordinators(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateClub = async (e) => {
        e.preventDefault();
        try {
            // Use selected coordinator or default to current admin if none selected
            const coordinatorId = formData.coordinator || user._id;

            await api.post('/clubs', {
                ...formData,
                coordinator: coordinatorId
            });
            setShowModal(false);
            setFormData({ name: '', description: '', image: '', capacity: 100, coordinator: '' });
            fetchClubs(); // Refresh list
            alert('Club created successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create club');
        }
    };

    const handleJoin = async (clubId) => {
        try {
            // Simple prompt for now, could be a modal
            const reason = prompt("Why do you want to join this club?");
            if (!reason) return;

            await api.post('/enrollments', {
                clubId,
                reason,
                experience: 'None' // simplified
            });
            alert('Enrollment request sent!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to join');
        }
    };

    if (loading) return <div>Loading clubs...</div>;

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Clubs</h1>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700"
                    >
                        <Plus size={20} className="mr-2" />
                        Create Club
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map((club) => (
                    <div key={club._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                        <div className="h-48 bg-gray-200 w-full object-cover flex items-center justify-center">
                            {club.image ? (
                                <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                            ) : (
                                <Users size={48} className="text-gray-400" />
                            )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{club.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                {club.description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    Coordinator: {club.coordinator?.name || 'TBA'}
                                </span>

                                {user?.role === 'student' && (
                                    <button
                                        onClick={() => handleJoin(club._id)}
                                        className="px-3 py-1 bg-secondary text-white text-sm rounded hover:bg-emerald-600 transition"
                                    >
                                        Join Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {clubs.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No clubs found. Login as Admin to create one.
                </div>
            )}

            {/* Create Club Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Create New Club</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateClub} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Club Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field mt-1"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    required
                                    className="input-field mt-1"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Assign Coordinator</label>
                                <select
                                    className="input-field mt-1"
                                    value={formData.coordinator}
                                    onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                                >
                                    <option value="">-- Select Coordinator (Default: You) --</option>
                                    {coordinators.map(coord => (
                                        <option key={coord._id} value={coord._id}>
                                            {coord.name} ({coord.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                                <input
                                    type="text"
                                    className="input-field mt-1"
                                    placeholder="https://example.com/logo.png"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-md mr-2 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700"
                                >
                                    Create Club
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clubs;

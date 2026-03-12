import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FileText, Download, Upload, Trash2, Plus, X } from 'lucide-react';

const Materials = () => {
    const { user } = useContext(AuthContext);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // For Coordinators
    const [selectedClub, setSelectedClub] = useState(null); // ID of the club being managed

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file: null,
        type: 'Document'
    });

    useEffect(() => {
        if (user) {
            fetchMaterials();
        }
    }, [user]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            let clubIdToFetch;

            if (user.role === 'coordinator' && user.assignedClub) {
                clubIdToFetch = user.assignedClub;
                setSelectedClub(clubIdToFetch);
            } else if (user.role === 'student') {
                // Ideally, fetch for all enrolled clubs. 
                // For simplified MVP, let's fetch for the first enrolled club or all.
                // Or we can let student select which club to view.

                // Let's first get enrollments to find a valid club ID
                const { data: enrollments } = await api.get('/enrollments/my');
                if (enrollments.length > 0) {
                    // Default to first enrolled club for now
                    clubIdToFetch = enrollments[0].club._id;
                    setSelectedClub(clubIdToFetch);
                }
            } else if (user.role === 'admin') {
                // Admin logic if needed, maybe select a club
            }

            if (clubIdToFetch) {
                const { data } = await api.get(`/materials/club/${clubIdToFetch}`);
                setMaterials(data);
            } else {
                setMaterials([]);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file) return alert('Please select a file');

        try {
            setUploading(true);

            // 1. Upload the file first
            const uploadData = new FormData();
            uploadData.append('document', formData.file);

            const uploadRes = await api.post('/upload/material', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const filePath = uploadRes.data.filePath;

            // 2. Create material entry
            await api.post('/materials', {
                title: formData.title,
                description: formData.description,
                clubId: selectedClub,
                type: 'Document', // Could infer from extension
                fileUrl: filePath
            });

            alert('Material uploaded successfully!');
            setShowModal(false);
            setFormData({ title: '', description: '', file: null, type: 'Document' });
            fetchMaterials(); // Refresh

        } catch (error) {
            alert(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const getFileName = (path) => {
        if (!path) return 'Download';
        return path.split('/').pop();
    };

    if (loading) return <div className="p-8">Loading materials...</div>;

    if (!selectedClub && user.role === 'student') {
        return (
            <div className="p-8 text-center bg-white rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-700">No Enrolled Clubs Found</h2>
                <p className="text-gray-500 mt-2">Join a club to view study materials.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
                    <p className="text-sm text-gray-500">Resources for your club members</p>
                </div>

                {user.role === 'coordinator' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow-sm"
                    >
                        <Plus size={18} className="mr-2" /> Upload Material
                    </button>
                )}
            </div>

            {materials.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-dashed border-gray-300">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No study materials yet</h3>
                    <p className="text-gray-500 mt-1">
                        {user.role === 'coordinator'
                            ? 'Upload documents, notes, or slides for your students.'
                            : 'Check back later for resources from your coordinator.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map((item) => (
                        <div key={item._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <FileText className="text-indigo-600" size={24} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description || 'No description provided.'}</p>
                            </div>

                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                                <a
                                    href={`http://localhost:5000${item.fileUrl}`}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                                >
                                    <Download size={16} className="mr-2" /> Download
                                </a>

                                {/* Future: Delete button for coordinator */}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center mb-6 border-b pb-2">
                            <h2 className="text-xl font-bold text-gray-800">Upload New Material</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="e.g., Chapter 1 Notes"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    rows="3"
                                    placeholder="Brief description of the content..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF, Doc, Image)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer relative">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>
                                        {formData.file && (
                                            <p className="text-sm text-green-600 font-semibold mt-2">{formData.file.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className={`px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Material'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Materials;

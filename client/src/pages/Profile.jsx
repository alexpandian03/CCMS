import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { Upload, Trash2, FileText, CheckCircle, Eye, Download } from 'lucide-react';

const Profile = () => {
    const { user, login } = useContext(AuthContext); // login used to update user context if needed
    const [uploading, setUploading] = useState({});
    const [message, setMessage] = useState(null);
    // Local state to reflect instant updates without page reload if context lags
    const [documents, setDocuments] = useState(user?.documents || {});

    useEffect(() => {
        if (user?.documents) {
            setDocuments(user.documents);
        }
    }, [user]);

    const docTypes = [
        { key: 'photo', label: 'Passport Size Photo', accept: 'image/*' },
        { key: 'aadhar', label: 'Aadhar Card', accept: 'image/*,application/pdf' },
        { key: 'bankPassbook', label: 'Bank Passbook', accept: 'image/*,application/pdf' },
        { key: 'markSheet10', label: '10th Marksheet', accept: 'image/*,application/pdf' },
        { key: 'markSheet12', label: '12th Marksheet', accept: 'image/*,application/pdf' },
        { key: 'bioData', label: 'Bio Data / Resume', accept: 'application/pdf' },
    ];

    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        setUploading(prev => ({ ...prev, [type]: true }));
        setMessage(null);

        try {
            const { data } = await api.post(`/upload/${type}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setDocuments(prev => ({ ...prev, [type]: data.filePath }));
            // Optionally update global user context here if possible, 
            // or just rely on local state until next login/refresh
            setMessage({ type: 'success', text: `${type} uploaded successfully!` });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Upload failed'
            });
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleDelete = async (type) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            await api.delete(`/upload/${type}`);
            setDocuments(prev => ({ ...prev, [type]: undefined }));
            setMessage({ type: 'success', text: 'Document deleted successfully' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Delete failed'
            });
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    if (!user) return <div className="p-8">Loading...</div>;

    const getFileName = (path) => {
        if (!path) return '';
        return path.split('/').pop(); // Extract filename
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile & Documents</h1>
                <p className="text-gray-500 mb-6">Manage your personal documents. Valid formats: JPG, PNG, PDF.</p>

                {message && (
                    <div className={`p-4 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Details Card */}
                    <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase">Name</label>
                                <div className="font-medium">{user.name}</div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase">Email</label>
                                <div className="font-medium">{user.email}</div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase">Roll Number</label>
                                <div className="font-medium">{user.rollNumber}</div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase">Department</label>
                                <div className="font-medium">{user.department}</div>
                            </div>
                        </div>
                    </div>

                    {/* Document Upload Cards */}
                    {docTypes.map((doc) => {
                        const hasDoc = documents[doc.key];
                        const isUploading = uploading[doc.key];

                        return (
                            <div key={doc.key} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between bg-white hover:shadow-sm transition">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-full mr-3 ${hasDoc ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {hasDoc ? <CheckCircle size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{doc.label}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {hasDoc ? 'Uploaded' : 'Not uploaded'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {hasDoc && (
                                        <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded truncate">
                                            {getFileName(hasDoc)}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    {hasDoc ? (
                                        <div className="flex space-x-2 w-full">
                                            <a
                                                href={`http://localhost:5000${hasDoc}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center px-3 py-1.5 border border-indigo-200 text-indigo-600 rounded hover:bg-indigo-50 text-sm"
                                            >
                                                <Eye size={14} className="mr-1" /> View
                                            </a>
                                            <button
                                                onClick={() => handleDelete(doc.key)}
                                                disabled={isUploading}
                                                className="flex items-center justify-center px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm"
                                            >
                                                {isUploading ? '...' : <Trash2 size={14} />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <input
                                                type="file"
                                                id={`file-${doc.key}`}
                                                className="hidden"
                                                accept={doc.accept}
                                                onChange={(e) => handleFileChange(e, doc.key)}
                                                disabled={isUploading}
                                            />
                                            <label
                                                htmlFor={`file-${doc.key}`}
                                                className={`w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                <Upload size={16} className="mr-2 text-gray-500" />
                                                {isUploading ? 'Uploading...' : 'Upload File'}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Profile;

import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { Bell, Filter, Plus } from 'lucide-react';

const NoticeBoard = () => {
    const { user } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: '', content: '', type: 'club' });

    const fetchNotices = async () => {
        try {
            const { data } = await api.get('/notices');
            setNotices(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notices', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const noticeData = {
                ...newNotice,
                clubId: user.assignedClub
            };
            if (user.role === 'admin') noticeData.type = 'college';

            await api.post('/notices', noticeData);
            setShowModal(false);
            setNewNotice({ title: '', content: '', type: 'club' });
            fetchNotices();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating notice');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="text-primary" /> Notice Board
                </h1>
                {(user.role === 'admin' || user.role === 'coordinator') && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark flex items-center gap-2 transition"
                    >
                        <Plus size={18} /> Post Notice
                    </button>
                )}
            </div>

            <div className="grid gap-4">
                {notices.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
                        No notices yet.
                    </div>
                ) : (
                    notices.map((notice) => (
                        <div key={notice._id} className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${notice.type === 'college' ? 'border-red-500' : 'border-indigo-500'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{notice.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${notice.type === 'college' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {notice.type === 'college' ? 'COLLEGE-WIDE' : notice.club?.name || 'Club'}
                                </span>
                            </div>
                            <p className="text-gray-600 whitespace-pre-wrap mb-4">{notice.content}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
                                <span>Posted by: {notice.author?.name} ({notice.author?.role})</span>
                                <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Post Notice Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Post New Notice</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={newNotice.title}
                                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={newNotice.content}
                                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
                                >
                                    Post Notice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;

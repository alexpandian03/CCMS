import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { loginAdmin } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await loginAdmin(email, password, pin);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div className="flex flex-col items-center">
                    <div className="bg-red-100 p-3 rounded-full mb-4">
                        <ShieldCheck size={40} className="text-red-600" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Restricted Access. Authorization Required.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="bg-red-50 text-red-500 p-3 rounded border border-red-200 text-sm text-center">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                            <input
                                type="email"
                                required
                                className="input-field mb-4"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field mb-4"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Security PIN</label>
                            <input
                                type="password"
                                required
                                className="input-field border-red-300 focus:border-red-500 focus:ring-red-500"
                                placeholder="Enter secure PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            Verify & Login
                        </button>
                    </div>
                    <div className="text-center mt-4">
                        <Link to="/login" className="font-medium text-gray-500 hover:text-gray-900 text-sm">
                            ← Return to Student/Coord Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;

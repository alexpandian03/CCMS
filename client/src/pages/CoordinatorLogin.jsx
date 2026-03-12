import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const CoordinatorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { loginCoordinator } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await loginCoordinator(email, password, pin);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl border-t-4 border-emerald-600">
                <div className="text-center">
                    <div className="flex justify-center">
                        <ShieldAlert className="h-12 w-12 text-emerald-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Coordinator Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Restricted Access. Multi-factor authentication required.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="grid gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="input-field mt-1"
                                placeholder="coordinator@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="input-field mt-1"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Security PIN</label>
                            <input
                                name="pin"
                                type="password"
                                required
                                className="input-field mt-1 border-emerald-200"
                                placeholder="Security PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg"
                    >
                        Secure Access
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 underline">
                            Back to Student Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CoordinatorLogin;

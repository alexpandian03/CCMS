import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ShieldAlert, UserCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        Student Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Join your college community today
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="input-field mt-1"
                                placeholder="student@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Password</label>
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
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
                    >
                        Sign In
                    </button>

                    <div className="text-center">
                        <Link to="/register" className="text-sm font-medium text-primary hover:text-indigo-500 transition-colors">
                            Don't have an account? Create one
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

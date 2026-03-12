import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rollNumber: '',
        department: '',
        year: '',
        role: 'student' // Default
    });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, rollNumber, department, year, role } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (role === 'student' && (!rollNumber || !department)) {
            setError('Please fill in all student details');
            return;
        }

        const result = await register(formData);
        if (result.success) {
            if (result.requireSecureLogin) {
                alert(result.message);
                navigate('/coordinator-login');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 card p-6 sm:p-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create an account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-indigo-500">
                            Sign in
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select name="role" value={role} onChange={onChange} className="input-field mt-1">
                            <option value="student">Student</option>
                            <option value="coordinator">Club Coordinator</option>
                        </select>
                    </div>

                    <div className="rounded-md shadow-sm space-y-3">
                        <input
                            name="name"
                            type="text"
                            required
                            className="input-field"
                            placeholder="Full Name"
                            value={name}
                            onChange={onChange}
                        />
                        <input
                            name="email"
                            type="email"
                            required
                            className="input-field"
                            placeholder="Email address"
                            value={email}
                            onChange={onChange}
                        />
                        <input
                            name="password"
                            type="password"
                            required
                            className="input-field"
                            placeholder="Password"
                            value={password}
                            onChange={onChange}
                        />

                        {role === 'student' && (
                            <>
                                <input
                                    name="rollNumber"
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="Roll Number"
                                    value={rollNumber}
                                    onChange={onChange}
                                />
                                <input
                                    name="department"
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="Department"
                                    value={department}
                                    onChange={onChange}
                                />
                                <input
                                    name="year"
                                    type="text"
                                    className="input-field"
                                    placeholder="Year/Semester"
                                    value={year}
                                    onChange={onChange}
                                />
                            </>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;

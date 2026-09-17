import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function CompleteProfile() {
    const { user, login, token } = useAuth();
    const navigate = useNavigate();
    
    const [role, setRole] = useState('DAY_SCHOLAR');
    const [hostelId, setHostelId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (role === 'HOSTEL_STUDENT' && !hostelId) {
            setError('Hostel ID is required for Hostel Students');
            return;
        }

        try {
            const res = await api.post('/auth/complete-signup', { role, hostelId: role === 'HOSTEL_STUDENT' ? hostelId : null });
            
            // Re-authenticate with updated role
            if (user && token) {
                login({ ...user, role: res.data.role }, res.data.token);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error completing profile.');
        }
    };

    if (user?.role !== 'UNASSIGNED') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Your profile is already complete.</p>
                    <button onClick={() => navigate('/dashboard')} className="text-blue-600 underline">Go to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-center mb-2">Welcome!</h1>
                <p className="text-sm text-gray-500 text-center mb-6">Let's finish setting up your account.</p>
                
                {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">I am a...</label>
                        <select value={role} onChange={e => setRole(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="DAY_SCHOLAR">Day Scholar</option>
                            <option value="HOSTEL_STUDENT">Hostel Student</option>
                        </select>
                    </div>

                    {role === 'HOSTEL_STUDENT' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Hostel ID</label>
                            <input type="text" required value={hostelId} onChange={e => setHostelId(e.target.value)} placeholder="e.g. H-A-101"
                                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <p className="text-xs text-gray-400 mt-1">Hostel ID linkages are subject to admin verification.</p>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold">
                        Complete Setup
                    </button>
                </form>
            </div>
        </div>
    );
}

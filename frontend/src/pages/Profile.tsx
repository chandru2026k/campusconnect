import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [hostelId, setHostelId] = useState('');
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setName(user.name || '');
        setHostelId(user.hostelId || '');
        
        api.get('/users/me/connections')
            .then(res => {
                setConnections(res.data);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.patch('/users/me', { name, hostelId });
            // Update auth context user
            localStorage.setItem('user', JSON.stringify(res.data));
            window.location.reload(); // Quick way to sync state for prototype
        } catch (e) {
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-blue-600 font-semibold">&larr; Back to Dashboard</button>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                {/* Profile Edit */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-2xl font-bold mb-6">My Profile</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="text" value={user?.email} disabled className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input type="text" value={user?.role} disabled className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500" />
                        </div>
                        {user?.role === 'HOSTEL_STUDENT' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Room / Block</label>
                                <input type="text" value={hostelId} onChange={e => setHostelId(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                        )}
                        <div className="pt-2">
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Save Changes</button>
                        </div>
                    </form>
                </div>

                {/* Connections */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold mb-2">My Connections</h2>
                    <p className="text-sm text-gray-500 mb-6">People you've successfully completed deliveries with.</p>
                    
                    {connections.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            <p>No connections yet.</p>
                            <p className="text-xs mt-1">Complete a request to connect!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {connections.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{c.name}</p>
                                            <p className="text-xs text-gray-500">{c.role === 'DAY_SCHOLAR' ? 'Day Scholar' : 'Hosteller'} • ? {c.reputationScore}</p>
                                        </div>
                                    </div>
                                    <a href={`mailto:${c.email}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 bg-blue-50 rounded-full">Message</a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



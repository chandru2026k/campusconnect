import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Profile() {
    const { user } = useAuth();
    
    const [name, setName] = useState('');
    const [hostelId, setHostelId] = useState('');
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
            setSaving(true);
            const res = await api.post('/users/me/update', { name, hostelId });
            localStorage.setItem('user', JSON.stringify(res.data));
            toast.success('Profile updated successfully!');
            setTimeout(() => {
                window.location.reload(); 
            }, 600);
        } catch (e: any) {
            console.error(e);
            let errMsg = e.response?.data?.message || e.response?.data || e.message || 'Unknown error';
            if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
            toast.error('Failed to update profile: ' + errMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 pb-12">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your Account</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your campus details and view delivery connections.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* PROFILE SETTINGS CARD */}
                    <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-slate-200/80 h-fit">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-100">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Student'}</h2>
                                <span className="inline-block mt-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                    {user?.role?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600" 
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">College Email</label>
                                <input 
                                    type="text" 
                                    value={user?.email} 
                                    disabled 
                                    className="w-full px-3.5 py-2.5 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Campus Role</label>
                                <input 
                                    type="text" 
                                    value={user?.role?.replace('_', ' ')} 
                                    disabled 
                                    className="w-full px-3.5 py-2.5 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed uppercase" 
                                />
                            </div>

                            {user?.role === 'HOSTEL_STUDENT' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Hostel Room / Block</label>
                                    <input 
                                        type="text" 
                                        value={hostelId} 
                                        onChange={e => setHostelId(e.target.value)} 
                                        placeholder="e.g. Block B, Room 304"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600" 
                                        required 
                                    />
                                </div>
                            )}

                            <div className="pt-3">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md shadow-indigo-100 transition disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Profile Details'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* CONNECTIONS CARD */}
                    <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-slate-200/80">
                        <div className="mb-5 pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Delivery Network</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Peers you have successfully matched and completed deliveries with.</p>
                        </div>
                        
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : connections.length === 0 ? (
                            <div className="text-center py-12 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3 shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-slate-700 font-semibold text-sm">No connections yet</p>
                                <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                                    Complete delivery requests with fellow students to build your trusted campus network.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {connections.map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                                {c.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    {c.role === 'DAY_SCHOLAR' ? 'Day Scholar' : 'Hosteller'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                            <span className="text-xs">⭐</span>
                                            <span className="text-xs font-bold text-amber-800">
                                                {c.reputationScore ? Number(c.reputationScore).toFixed(1) : '5.0'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface RequestModel {
    id: number;
    category: string;
    title: string;
    description: string;
    isEmergency: boolean;
    status: string;
    locationHint: string;
    requester: { id: number; name: string; role: string };
}

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState<RequestModel[]>([]);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [emergencyFilter, setEmergencyFilter] = useState(false);

    // New Request Form State
    const [showForm, setShowForm] = useState(false);
    const [newReq, setNewReq] = useState({ category: 'FOOD', title: '', description: '', locationHint: 'MAIN_GATE', isEmergency: false });
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (e) {
            console.error('Failed to fetch requests', e);
        }
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            alert("You must agree to the disclaimers.");
            return;
        }
        try {
            // Backend requires a deadlineAt field. Set it to 2 hours from now.
            const deadlineDate = new Date();
            deadlineDate.setHours(deadlineDate.getHours() + 2);
            const payload = { ...newReq, deadlineAt: deadlineDate.toISOString() };

            await api.post('/requests', payload);
            setShowForm(false);
            setNewReq({ category: 'FOOD', title: '', description: '', locationHint: 'MAIN_GATE', isEmergency: false });
            setAgreed(false);
            fetchRequests();
        } catch (e) {
            console.error('Failed to create request', e);
            alert('Failed to post request. Please try again.');
        }
    };

    const filteredRequests = requests.filter(r => {
        if (statusFilter && r.status !== statusFilter) return false;
        if (categoryFilter && r.category !== categoryFilter) return false;
        if (locationFilter && r.locationHint !== locationFilter) return false;
        if (emergencyFilter && !r.isEmergency) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
            {/* STICKY NAVBAR */}
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-600">
                                CampusConnect
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-semibold text-gray-700">{user?.email}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5">
                                    {user?.role.replace('_', ' ')}
                                </span>
                            </div>
                            <button onClick={logout} className="ml-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* LEFT SIDEBAR (Actions & Filters) */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* NEW REQUEST PANEL */}
                        {user?.role === 'HOSTEL_STUDENT' && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-900/5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                                
                                {showForm ? (
                                    <form onSubmit={handleCreateRequest} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <h3 className="font-bold text-gray-800 text-lg">New Request</h3>
                                        <div>
                                            <input type="text" required value={newReq.title} onChange={e => setNewReq({...newReq, title: e.target.value})} placeholder="What do you need?" 
                                                className="w-full px-3 py-2 bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 rounded-lg focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                                        </div>
                                        <div>
                                            <textarea required value={newReq.description} onChange={e => setNewReq({...newReq, description: e.target.value})} placeholder="Details..." rows={2}
                                                className="w-full px-3 py-2 bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 rounded-lg focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select value={newReq.category} onChange={e => setNewReq({...newReq, category: e.target.value})} className="w-full px-2 py-2 bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600">
                                                <option value="FOOD">Food</option>
                                                <option value="MEDICINE">Medicine</option>
                                                <option value="DOCUMENT">Document</option>
                                                <option value="STATIONERY">Stationery</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                            <select value={newReq.locationHint} onChange={e => setNewReq({...newReq, locationHint: e.target.value})} className="w-full px-2 py-2 bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600">
                                                <option value="MAIN_GATE">Main Gate</option>
                                                <option value="HOSTEL_BLOCK_A">Block A</option>
                                                <option value="HOSTEL_BLOCK_B">Block B</option>
                                                <option value="LIBRARY">Library</option>
                                                <option value="ACADEMIC_BLOCK">Academic</option>
                                                <option value="TOWN_BUS_STAND">Bus Stand</option>
                                            </select>
                                        </div>
                                        
                                        <label className="flex items-center space-x-2 text-sm text-red-600 font-semibold bg-red-50/50 p-2 rounded-lg border border-red-100 cursor-pointer">
                                            <input type="checkbox" checked={newReq.isEmergency} onChange={e => setNewReq({...newReq, isEmergency: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                                            <span>Mark as Emergency</span>
                                        </label>

                                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-xs text-amber-800 space-y-1">
                                            <strong className="block mb-1">⚠️ Disclaimers</strong>
                                            <ul className="list-disc pl-4 space-y-0.5">
                                                <li>No payment handling on platform.</li>
                                                <li>No live GPS tracking provided.</li>
                                                <li>No liability guarantee for lost items.</li>
                                            </ul>
                                        </div>
                                        <label className="flex items-start space-x-2 text-xs text-gray-600 cursor-pointer">
                                            <input type="checkbox" required checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500" />
                                            <span>I acknowledge and agree to the terms.</span>
                                        </label>
                                        
                                        <div className="flex gap-2 pt-2">
                                            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                                            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition">Post Request</button>
                                        </div>
                                    </form>
                                ) : (
                                    <button onClick={() => setShowForm(true)} className="w-full group relative flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-200 overflow-hidden">
                                        <span className="text-xl leading-none font-light group-hover:scale-125 transition-transform">+</span> 
                                        <span>Create Request</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* FILTERS PANEL */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-900/5">
                            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                                <h3 className="font-bold text-gray-800">Filters</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 cursor-pointer">
                                        <option value="">All Statuses</option>
                                        <option value="OPEN">Open</option>
                                        <option value="ACCEPTED">Accepted</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DELIVERED">Delivered</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 cursor-pointer">
                                        <option value="">All Categories</option>
                                        <option value="FOOD">Food</option>
                                        <option value="MEDICINE">Medicine</option>
                                        <option value="STATIONERY">Stationery</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
                                    <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 cursor-pointer">
                                        <option value="">All Locations</option>
                                        <option value="MAIN_GATE">Main Gate</option>
                                        <option value="HOSTEL_BLOCK_A">Block A</option>
                                        <option value="LIBRARY">Library</option>
                                    </select>
                                </div>
                                <div className="pt-2">
                                    <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <input type="checkbox" checked={emergencyFilter} onChange={e => setEmergencyFilter(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                                        <span className="font-medium">Emergency Only</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FEED (Requests) */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Request Feed</h2>
                            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm ring-1 ring-gray-900/5">{filteredRequests.length} results</span>
                        </div>

                        {filteredRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">It's quiet here</h3>
                                <p className="text-gray-500 max-w-sm">There are currently no active requests matching your selected filters.</p>
                                {user?.role === 'HOSTEL_STUDENT' && (
                                    <button onClick={() => setShowForm(true)} className="mt-6 text-indigo-600 font-medium hover:text-indigo-700 hover:underline">
                                        Post the first request
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
                                {filteredRequests.map(req => (
                                    <div key={req.id} onClick={() => navigate(`/request/${req.id}`)} 
                                         className="group bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col relative">
                                        
                                        {/* Status Accent Bar */}
                                        <div className={`h-1.5 w-full ${req.status === 'OPEN' ? 'bg-emerald-400' : 'bg-gray-300'}`}></div>
                                        
                                        <div className="p-5 flex flex-col flex-grow">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md ${req.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10'}`}>
                                                    {req.status === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                                                    {req.status}
                                                </span>
                                                {req.isEmergency && (
                                                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ring-1 ring-red-600/20">
                                                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                                        URGENT
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <h3 className="font-bold text-gray-900 text-lg mb-1.5 truncate group-hover:text-indigo-600 transition-colors" title={req.title}>{req.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow leading-relaxed">{req.description}</p>
                                            
                                            <div className="flex justify-between items-center text-xs font-medium text-gray-500 pt-4 mt-auto border-t border-gray-100">
                                                <span className="inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-md text-gray-600 ring-1 ring-gray-900/5">
                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                                    {req.category}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-gray-600 truncate max-w-[50%]">
                                                    <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                    <span className="truncate">{req.locationHint.replace(/_/g, ' ')}</span>
                                                </span>
                                            </div>
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

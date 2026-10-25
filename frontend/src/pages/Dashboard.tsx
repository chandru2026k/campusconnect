import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

interface RequestModel {
    id: number;
    category: string;
    title: string;
    description: string;
    isEmergency: boolean;
    status: string;
    locationHint: string;
    requester: { id: number; name: string; role: string; hostelId?: string };
}

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState<RequestModel[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [emergencyFilter, setEmergencyFilter] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New Request Form State
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newReq, setNewReq] = useState({ category: 'FOOD', title: '', description: '', locationHint: 'MAIN_GATE', isEmergency: false });
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (e) {
            console.error('Failed to fetch requests', e);
            toast.error('Could not load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            toast.error("Please agree to the campus safety disclaimers.");
            return;
        }
        try {
            setSubmitting(true);
            await api.post('/requests', newReq);
            setShowForm(false);
            setNewReq({ category: 'FOOD', title: '', description: '', locationHint: 'MAIN_GATE', isEmergency: false });
            setAgreed(false);
            toast.success('Request posted successfully!');
            fetchRequests();
        } catch (e: any) {
            console.error('Failed to create request', e);
            toast.error('Failed to post request: ' + (e.response?.data?.message || e.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRequest = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this request?')) return;
        try {
            await api.delete(`/requests/${id}`);
            toast.success('Request removed');
            fetchRequests();
        } catch (e) {
            toast.error('Error deleting request');
        }
    };

    const filteredRequests = requests.filter(r => {
        if (statusFilter && r.status !== statusFilter) return false;
        if (categoryFilter && r.category !== categoryFilter) return false;
        if (locationFilter && r.locationHint !== locationFilter) return false;
        if (emergencyFilter && !r.isEmergency) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!r.title.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const activeCount = requests.filter(r => r.status === 'OPEN').length;

    return (
        <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 pb-12">
            <Navbar />

            {/* HERO BANNER SECTION */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 mb-2">
                                🚀 Peer-to-Peer Campus Logistics
                            </span>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                                Campus Delivery Feed
                            </h1>
                            <p className="text-indigo-200 text-sm md:text-base mt-1 max-w-xl">
                                Connect with Day Scholars for quick deliveries from outside campus straight to your hostel.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                                <span className="block text-2xl font-black text-white">{activeCount}</span>
                                <span className="text-[11px] font-medium text-indigo-200 uppercase tracking-wider">Open Requests</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
                                <span className="block text-2xl font-black text-white">{requests.length}</span>
                                <span className="text-[11px] font-medium text-indigo-200 uppercase tracking-wider">Total Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* LEFT SIDEBAR (Actions & Filters) */}
                    <div className="lg:col-span-1 space-y-5">
                        
                        {/* SEARCH */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Search Feed</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search items, titles..." 
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)} 
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 transition" 
                                />
                                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* NEW REQUEST PANEL (Hostellers only) */}
                        {user?.role === 'HOSTEL_STUDENT' && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                                
                                {showForm ? (
                                    <form onSubmit={handleCreateRequest} className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bold text-slate-800 text-base">New Request</h3>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowForm(false)} 
                                                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                                            >
                                                ✕ Close
                                            </button>
                                        </div>

                                        <div>
                                            <input 
                                                type="text" 
                                                required 
                                                value={newReq.title} 
                                                onChange={e => setNewReq({...newReq, title: e.target.value})} 
                                                placeholder="What do you need delivered?" 
                                                className="w-full px-3 py-2 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600" 
                                            />
                                        </div>

                                        <div>
                                            <textarea 
                                                required 
                                                value={newReq.description} 
                                                onChange={e => setNewReq({...newReq, description: e.target.value})} 
                                                placeholder="Specific item details, shop name, or notes..." 
                                                rows={2}
                                                className="w-full px-3 py-2 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600" 
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                                                <select 
                                                    value={newReq.category} 
                                                    onChange={e => setNewReq({...newReq, category: e.target.value})} 
                                                    className="w-full px-2.5 py-2 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600"
                                                >
                                                    <option value="FOOD">🍔 Food</option>
                                                    <option value="MEDICINE">💊 Medicine</option>
                                                    <option value="DOCUMENT">📄 Document</option>
                                                    <option value="STATIONERY">✏️ Stationery</option>
                                                    <option value="OTHER">📦 Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Drop Location</label>
                                                <select 
                                                    value={newReq.locationHint} 
                                                    onChange={e => setNewReq({...newReq, locationHint: e.target.value})} 
                                                    className="w-full px-2.5 py-2 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600"
                                                >
                                                    <option value="MAIN_GATE">Main Gate</option>
                                                    <option value="HOSTEL_BLOCK_A">Block A</option>
                                                    <option value="HOSTEL_BLOCK_B">Block B</option>
                                                    <option value="LIBRARY">Library</option>
                                                    <option value="ACADEMIC_BLOCK">Academic</option>
                                                    <option value="TOWN_BUS_STAND">Bus Stand</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <label className="flex items-center space-x-2 text-xs text-rose-700 font-semibold bg-rose-50 p-2 rounded-xl border border-rose-100 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={newReq.isEmergency} 
                                                onChange={e => setNewReq({...newReq, isEmergency: e.target.checked})} 
                                                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4" 
                                            />
                                            <span>Mark as Emergency / Urgent</span>
                                        </label>

                                        <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-[11px] text-amber-800 space-y-1">
                                            <strong className="block font-bold">⚠️ Community Guidelines</strong>
                                            <p className="leading-tight">Payment is handled directly between peers. Delivery is confirmed using a unique 4-digit PIN.</p>
                                        </div>

                                        <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                required 
                                                checked={agreed} 
                                                onChange={e => setAgreed(e.target.checked)} 
                                                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500" 
                                            />
                                            <span>I acknowledge & agree to the guidelines.</span>
                                        </label>
                                        
                                        <div className="flex gap-2 pt-1">
                                            <button 
                                                type="button" 
                                                onClick={() => setShowForm(false)} 
                                                className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={submitting}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                                            >
                                                {submitting ? 'Posting...' : 'Post Request'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button 
                                        onClick={() => setShowForm(true)} 
                                        className="w-full group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200"
                                    >
                                        <span className="text-lg leading-none font-light group-hover:scale-125 transition-transform">+</span> 
                                        <span>Create Delivery Request</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* FILTERS PANEL */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <h3 className="font-bold text-slate-800 text-sm">Filter Requests</h3>
                                </div>
                                {(statusFilter || categoryFilter || locationFilter || emergencyFilter) && (
                                    <button 
                                        onClick={() => {
                                            setStatusFilter('');
                                            setCategoryFilter('');
                                            setLocationFilter('');
                                            setEmergencyFilter(false);
                                        }}
                                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                                    <select 
                                        value={statusFilter} 
                                        onChange={e => setStatusFilter(e.target.value)} 
                                        className="w-full px-3 py-2 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="OPEN">Open (Waiting for Volunteer)</option>
                                        <option value="ACCEPTED">Accepted</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CONFIRMED">Confirmed / Closed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                                    <select 
                                        value={categoryFilter} 
                                        onChange={e => setCategoryFilter(e.target.value)} 
                                        className="w-full px-3 py-2 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="FOOD">Food</option>
                                        <option value="MEDICINE">Medicine</option>
                                        <option value="STATIONERY">Stationery</option>
                                        <option value="DOCUMENT">Document</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                                    <select 
                                        value={locationFilter} 
                                        onChange={e => setLocationFilter(e.target.value)} 
                                        className="w-full px-3 py-2 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                                    >
                                        <option value="">All Locations</option>
                                        <option value="MAIN_GATE">Main Gate</option>
                                        <option value="HOSTEL_BLOCK_A">Block A</option>
                                        <option value="HOSTEL_BLOCK_B">Block B</option>
                                        <option value="LIBRARY">Library</option>
                                        <option value="ACADEMIC_BLOCK">Academic</option>
                                        <option value="TOWN_BUS_STAND">Bus Stand</option>
                                    </select>
                                </div>

                                <div className="pt-1">
                                    <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-200">
                                        <input 
                                            type="checkbox" 
                                            checked={emergencyFilter} 
                                            onChange={e => setEmergencyFilter(e.target.checked)} 
                                            className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4" 
                                        />
                                        <span className="font-semibold text-rose-700">🚨 Urgent Requests Only</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FEED (Requests Grid) */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-4 bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-200/80">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">Live Deliveries</h2>
                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                                    {filteredRequests.length} available
                                </span>
                            </div>
                            <button 
                                onClick={fetchRequests} 
                                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition"
                            >
                                <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-3">
                                        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                                        <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                                        <div className="h-12 bg-slate-100 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">No requests found</h3>
                                <p className="text-slate-500 text-sm max-w-sm">
                                    There are currently no active requests matching your search or filters.
                                </p>
                                {user?.role === 'HOSTEL_STUDENT' && (
                                    <button 
                                        onClick={() => setShowForm(true)} 
                                        className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
                                    >
                                        Post the first delivery request
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {filteredRequests.map(req => (
                                    <div 
                                        key={req.id} 
                                        onClick={() => navigate(`/request/${req.id}`)} 
                                        className="group bg-white rounded-2xl shadow-sm border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col relative"
                                    >
                                        {/* Status indicator bar */}
                                        <div className={`h-1.5 w-full ${req.status === 'OPEN' ? 'bg-emerald-500' : req.status === 'IN_PROGRESS' ? 'bg-purple-500' : req.status === 'ACCEPTED' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                        
                                        <div className="p-5 flex flex-col flex-grow">
                                            {/* Header with badges */}
                                            <div className="flex justify-between items-start mb-2.5">
                                                <StatusBadge status={req.status} isEmergency={req.isEmergency} />

                                                {user?.id === req.requester.id && req.status === 'OPEN' && (
                                                    <button 
                                                        onClick={(e) => handleDeleteRequest(e, req.id)}
                                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors"
                                                        title="Delete Request"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Title & Description */}
                                            <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                {req.title}
                                            </h3>
                                            <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed flex-grow">
                                                {req.description}
                                            </p>
                                            
                                            {/* Requester details */}
                                            <div className="mb-3.5 text-xs text-slate-500 flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                                                    {req.requester?.name?.charAt(0) || 'S'}
                                                </div>
                                                <span className="font-medium text-slate-700 truncate">
                                                    {req.requester?.name || "Student"}
                                                </span>
                                                {req.requester?.hostelId && (
                                                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                        Room {req.requester.hostelId}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Footer metadata */}
                                            <div className="flex justify-between items-center text-xs font-semibold pt-3 border-t border-slate-100">
                                                <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                    <span>📦</span> {req.category}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-slate-600 truncate max-w-[55%]">
                                                    <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
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

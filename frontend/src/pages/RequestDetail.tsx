import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

interface UserSummary {
    id: number;
    name: string;
    role: string;
    hostelId?: string;
    reputationScore?: number;
}

interface RequestDetail {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    locationHint: string;
    isEmergency: boolean;
    createdAt?: string;
    deadlineAt?: string;
    estimatedCost?: number;
    tipAmount?: number;
    requester: UserSummary;
    volunteer?: UserSummary | null;
    acceptedAt?: string | null;
}

interface ChatMessage {
    id: number;
    sender: { id: number; name: string };
    body: string;
    sentAt: string;
}

// Preset Quick Replies
const QUICK_REPLIES = [
    "I'm at the shop now! 🛍️",
    "Item bought, heading back to campus! 🛵",
    "I've arrived at your hostel entrance. 📍",
    "Could you please share the Delivery PIN? 🔐",
];

export default function RequestDetailView() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [req, setReq] = useState<RequestDetail | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [rating, setRating] = useState({ stars: 5, comment: '' });
    const [deliveryPin, setDeliveryPin] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    
    const stompClientRef = useRef<Client | null>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll chat to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (req && user?.id === req.requester?.id && req.status !== 'OPEN') {
            api.get(`/requests/${id}/pin`)
                .then(res => setDeliveryPin(res.data.pin))
                .catch(e => console.error(e));
        }
    }, [req?.status, req?.requester?.id, user?.id, id]);

    useEffect(() => {
        fetchDetails();
        
        // Connect STOMP WebSocket
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
                stompClient.subscribe(`/topic/request/${id}`, (msg) => {
                    const newMsg = JSON.parse(msg.body);
                    setMessages(prev => [...prev, newMsg]);
                });
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: (err) => console.error('STOMP Error:', err),
            onWebSocketError: (err) => console.error('WS Error:', err),
            onWebSocketClose: () => setIsConnected(false),
        });
        
        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
        };
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/requests/${id}`);
            setReq(res.data);
            
            // Fetch chat history
            try {
                const msgsRes = await api.get(`/requests/${id}/messages`);
                setMessages(msgsRes.data);
            } catch (msgErr) {
                console.error('Failed to fetch chat history', msgErr);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load request details');
        }
    };

    const handleStatus = async (status: string) => {
        try {
            setActionLoading(true);
            if (status === 'ACCEPTED') {
                await api.post(`/requests/${id}/accept`);
                toast.success('You have accepted this delivery!');
            } else if (status === 'DELIVERED') {
                const pin = window.prompt("Enter the 4-digit Delivery PIN provided by the Hosteller:");
                if (!pin) {
                    setActionLoading(false);
                    return;
                }
                await api.patch(`/requests/${id}/status`, { status, pin });
                toast.success('PIN verified! Delivery completed and confirmed.');
            } else {
                await api.patch(`/requests/${id}/status`, { status });
                toast.success(`Status updated to ${status.replace('_', ' ')}`);
            }
            fetchDetails();
        } catch (e: any) {
            toast.error('Error updating status: ' + (e.response?.data?.message || e.response?.data || e.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this request?')) return;
        try {
            await api.delete(`/requests/${id}`);
            toast.success('Request deleted');
            navigate('/dashboard');
        } catch (e) {
            toast.error('Error deleting request');
        }
    };

    const handleRate = async () => {
        try {
            const rateeId = user?.id === req?.requester?.id ? req?.volunteer?.id : req?.requester?.id;
            if (!rateeId) {
                toast.error('Cannot determine user to rate.');
                return;
            }
            await api.post('/ratings', { requestId: Number(id), rateeId, stars: rating.stars, comment: rating.comment });
            toast.success('Rating submitted. Thank you!');
            fetchDetails();
        } catch (e) {
            toast.error('Error submitting rating');
        }
    };

    const sendMsg = (bodyToSend?: string) => {
        const text = bodyToSend || chatInput;
        if (!text.trim() || !stompClientRef.current?.connected) return;
        
        const payload = { senderId: user?.id, body: text.trim() };
        stompClientRef.current.publish({ destination: `/app/chat/${id}`, body: JSON.stringify(payload) });
        if (!bodyToSend) setChatInput('');
    };

    if (!req) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-8 text-slate-500 font-semibold">
                    <svg className="w-6 h-6 animate-spin text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Loading request...
                </div>
            </div>
        );
    }

    const isRequester = user?.id === req.requester?.id;
    const isVolunteer = (req.volunteer ? user?.id === req.volunteer.id : user?.role === 'DAY_SCHOLAR') && !isRequester; 

    return (
        <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 pb-12">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 mb-6 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Feed
                </button>
                
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* LEFT 2 COLUMNS: REQUEST DETAILS & ACTIONS */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    {req.title}
                                </h1>
                                <StatusBadge status={req.status} isEmergency={req.isEmergency} />
                            </div>

                            {/* Financial / Reimbursement highlight card if present */}
                            {(req.estimatedCost || req.tipAmount) && (
                                <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                                            💵
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Payment / Reimbursement</p>
                                            <p className="text-xs text-emerald-700">Reimburse in cash or UPI upon delivery</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-right">
                                        {req.estimatedCost && (
                                            <div>
                                                <span className="block text-[10px] uppercase font-bold text-slate-400">Est. Cost</span>
                                                <span className="font-extrabold text-slate-800 text-sm">₹{req.estimatedCost}</span>
                                            </div>
                                        )}
                                        {req.tipAmount && (
                                            <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                                                <span className="block text-[9px] uppercase font-bold text-emerald-100">Volunteer Tip</span>
                                                <span className="font-black text-sm">+₹{req.tipAmount}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Requester & Volunteer Cards Grid */}
                            <div className="grid sm:grid-cols-2 gap-3 mb-6">
                                {/* Requester Card */}
                                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm">
                                        {req.requester?.name?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 text-sm">{req.requester?.name || "Student"}</span>
                                            {isRequester && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Hostel: {req.requester?.hostelId || 'Campus Hosteller'}
                                        </p>
                                    </div>
                                </div>

                                {/* Volunteer Card */}
                                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                                    {req.volunteer ? (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-sm">
                                                {req.volunteer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-sm">{req.volunteer.name}</span>
                                                    {user?.id === req.volunteer.id && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <span>Day Scholar</span>
                                                    <span>•</span>
                                                    <span className="text-amber-700 font-semibold">⭐ {req.volunteer.reputationScore ? Number(req.volunteer.reputationScore).toFixed(1) : '5.0'}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm">
                                                ⏳
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-600 text-sm">No Volunteer Yet</p>
                                                <p className="text-xs text-slate-400">Open for Day Scholars</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chips */}
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-6">
                                <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                    📦 {req.category}
                                </span>
                                <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                    📍 Drop Location: {req.locationHint ? req.locationHint.replace(/_/g, ' ') : 'Campus'}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description & Instructions</h3>
                                <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    {req.description}
                                </p>
                            </div>

                            {/* Delivery PIN (Hosteller View) */}
                            {deliveryPin && (
                                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-900 p-4 sm:p-5 rounded-2xl mb-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">🔐</span>
                                        <h4 className="font-bold text-sm">Secure Delivery PIN</h4>
                                    </div>
                                    <div className="flex items-center gap-3 my-2">
                                        <span className="font-mono text-2xl font-black tracking-widest bg-white px-4 py-1.5 rounded-xl border border-amber-300 shadow-inner">
                                            {deliveryPin}
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-700 leading-normal">
                                        Keep this safe! Only share this 4-digit PIN with the Day Scholar once you receive your item to verify delivery.
                                    </p>
                                </div>
                            )}

                            {/* ACTIONS BAR */}
                            <div className="border-t border-slate-100 pt-5">
                                <h3 className="font-bold text-slate-800 text-sm mb-3">Available Actions</h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {req.status === 'OPEN' && isRequester && (
                                        <button 
                                            onClick={handleDelete} 
                                            className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs border border-rose-200 transition"
                                        >
                                            Delete Request
                                        </button>
                                    )}

                                    {req.status === 'OPEN' && isVolunteer && (
                                        <button 
                                            onClick={() => handleStatus('ACCEPTED')} 
                                            disabled={actionLoading}
                                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-100 transition disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Accepting...' : '🤝 Accept Delivery'}
                                        </button>
                                    )}

                                    {req.status === 'ACCEPTED' && isVolunteer && (
                                        <button 
                                            onClick={() => handleStatus('IN_PROGRESS')} 
                                            disabled={actionLoading}
                                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Updating...' : '🚴 Mark In-Progress (Purchased)'}
                                        </button>
                                    )}

                                    {req.status === 'IN_PROGRESS' && isVolunteer && (
                                        <button 
                                            onClick={() => handleStatus('DELIVERED')} 
                                            disabled={actionLoading}
                                            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-100 transition disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Verifying...' : '✅ Complete Delivery (Enter PIN)'}
                                        </button>
                                    )}

                                    {(req.status === 'CONFIRMED' || req.status === 'RATED') && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                                            ✓ Delivery verified and completed
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RATING PANEL (After confirmation) */}
                        {req.status === 'CONFIRMED' && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                                <h3 className="font-bold text-slate-900 text-base mb-1">Rate Delivery Experience</h3>
                                <p className="text-xs text-slate-500 mb-4">Help maintain high trust & safety on campus.</p>
                                
                                <div className="flex gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => setRating({ ...rating, stars: s })} 
                                            className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition-all ${
                                                rating.stars >= s 
                                                    ? 'bg-amber-100 border-amber-300 scale-105' 
                                                    : 'bg-slate-50 border-slate-200 opacity-60'
                                            }`}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    value={rating.comment} 
                                    onChange={e => setRating({ ...rating, comment: e.target.value })} 
                                    className="w-full bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-600 mb-3" 
                                    placeholder="Leave a short review or feedback..."
                                    rows={2}
                                />
                                <button 
                                    onClick={handleRate} 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: LIVE CHAT */}
                    <div className="lg:col-span-1 h-[580px] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-sm">Direct Chat</h3>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                {isConnected ? 'Live' : 'Connecting...'}
                            </span>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                            {req.status === 'OPEN' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm mb-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-600 font-semibold text-xs">Waiting for a Day Scholar</p>
                                    <p className="text-slate-400 text-[11px] mt-1">Live messaging will activate as soon as someone accepts this delivery.</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 text-xs">No messages yet.</p>
                                    <p className="text-slate-400 text-[10px] mt-0.5">Coordinate drop details with your peer below!</p>
                                </div>
                            ) : (
                                messages.map((m, i) => {
                                    const isMe = m.sender?.id === user?.id;
                                    return (
                                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[9px] text-slate-400 mb-0.5 px-1 font-medium">
                                                {isMe ? 'You' : m.sender?.name || 'Peer'}
                                            </span>
                                            <div className={`px-3.5 py-2 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${
                                                isMe 
                                                    ? 'bg-indigo-600 text-white rounded-br-xs' 
                                                    : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-xs'
                                            }`}>
                                                {m.body}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Preset Replies */}
                        {!['OPEN', 'CONFIRMED', 'RATED'].includes(req.status) && isConnected && (
                            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 flex gap-1.5 overflow-x-auto no-scrollbar">
                                {QUICK_REPLIES.map((reply, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => sendMsg(reply)}
                                        className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-[10px] font-semibold transition shrink-0"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input bar */}
                        <form onSubmit={(e) => { e.preventDefault(); sendMsg(); }} className="p-2.5 border-t border-slate-100 bg-white flex gap-1.5">
                            <input 
                                type="text" 
                                value={chatInput} 
                                onChange={e => setChatInput(e.target.value)} 
                                disabled={!isConnected || ['OPEN', 'CONFIRMED', 'RATED'].includes(req.status)} 
                                placeholder={!isConnected ? "Reconnecting..." : req.status === 'OPEN' ? "Waiting for volunteer..." : "Type message..."} 
                                className="flex-1 px-3 py-2 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 disabled:bg-slate-100 disabled:cursor-not-allowed" 
                            />
                            <button 
                                type="submit" 
                                disabled={!isConnected || !chatInput.trim() || ['OPEN', 'CONFIRMED', 'RATED'].includes(req.status)} 
                                className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

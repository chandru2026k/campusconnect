import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface RequestDetail {
    id: number;
    title: string;
    description: string;
    status: string;
    isEmergency: boolean;
    requester: { id: number; name: string };
    volunteer?: { id: number; name: string };
}

interface ChatMessage {
    id: number;
    sender: { id: number; name: string };
    body: string;
    sentAt: string;
}

export default function RequestDetailView() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [req, setReq] = useState<RequestDetail | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [rating, setRating] = useState({ stars: 5, comment: '' });
    const [deliveryPin, setDeliveryPin] = useState<string | null>(null);

    useEffect(() => {
        if (req && user?.id === req.requester.id && req.status !== 'OPEN') {
            api.get(`/requests/${id}/pin`).then(res => setDeliveryPin(res.data.pin)).catch(e => console.error(e));
        }
    }, [req?.status, req?.requester.id, user?.id]);
    
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        fetchDetails();
        
        // Connect STOMP
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
        const stompClient = new Client({
            // VERY IMPORTANT: Must return a NEW instance every time it connects/reconnects
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            debug: (str) => console.log('STOMP: ', str),
            onConnect: () => {
                console.log('STOMP connected!');
                setIsConnected(true);
                stompClient.subscribe(`/topic/request/${id}`, (msg) => {
                    const newMsg = JSON.parse(msg.body);
                    setMessages(prev => [...prev, newMsg]);
                });
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: (err) => console.error('STOMP Error:', err),
            onWebSocketError: (err) => console.error('WS Error:', err),
            onWebSocketClose: () => {
                console.log('WS closed');
                setIsConnected(false);
            }
        });
        
        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
        };
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await api.get('/requests');
            const match = res.data.find((r: any) => r.id === Number(id));
            setReq(match);
            
            // Fetch chat history
            try {
                const msgsRes = await api.get(`/requests/${id}/messages`);
                setMessages(msgsRes.data);
            } catch (msgErr) {
                console.error('Failed to fetch chat history', msgErr);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatus = async (status: string) => {
        try {
            if (status === 'ACCEPTED') {
                await api.post(`/requests/${id}/accept`);
            } else if (status === 'DELIVERED') {
                const pin = window.prompt("Please enter the 4-digit Delivery PIN provided by the Hosteller:");
                if (!pin) return; // cancelled
                await api.patch(`/requests/${id}/status`, { status, pin });
            } else {
                await api.patch(`/requests/${id}/status`, { status });
            }
            fetchDetails();
        } catch (e: any) {
            toast.error('Error updating status: ' + (e.response?.data || e.message));
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this request?')) return;
        try {
            await api.delete(`/requests/${id}`);
            navigate('/');
        } catch (e) {
            toast.error('Error deleting request');
        }
    };

    const handleRate = async () => {
        try {
            // Rater is current user. Ratee is the other party.
            const rateeId = user?.id === req?.requester.id ? req?.volunteer?.id : req?.requester.id;
            await api.post('/ratings', { requestId: Number(id), rateeId, stars: rating.stars, comment: rating.comment });
            fetchDetails();
        } catch (e) {
            toast.error('Error submitting rating');
        }
    };

    const sendMsg = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !stompClientRef.current?.connected) return;
        
        const payload = { senderId: user?.id, body: chatInput };
        stompClientRef.current.publish({ destination: `/app/chat/${id}`, body: JSON.stringify(payload) });
        setChatInput('');
    };

    if (!req) return <div className="p-8 text-center">Loading...</div>;

    const isRequester = user?.id === req.requester.id;
    // For prototype, volunteer ID isn't directly populated on Request via Match easily without an endpoint.
    // Assuming Day Scholar is allowed to take action if they are DAY_SCHOLAR.
    const isVolunteer = user?.role === 'DAY_SCHOLAR' && !isRequester; 
    
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 font-semibold">&larr; Back to Dashboard</button>
            
            <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-2xl font-bold">{req.title}</h1>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-full text-sm">{req.status}</span>
                        </div>
                        <p className="text-gray-700 mb-6">{req.description}</p>
                        {deliveryPin && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6">
                                <p className="font-bold">Delivery PIN: {deliveryPin}</p>
                                <p className="text-sm">Share this PIN with the volunteer when they deliver your item.</p>
                            </div>
                        )}
                        
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Actions</h3>
                            <div className="flex flex-wrap gap-2">
                                {req.status === 'OPEN' && isRequester && (
                                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete Request</button>
                                )}
                                {req.status === 'OPEN' && isVolunteer && (
                                    <button onClick={() => handleStatus('ACCEPTED')} className="bg-green-600 text-white px-4 py-2 rounded">Accept Request</button>
                                )}
                                {req.status === 'ACCEPTED' && isVolunteer && (
                                    <button onClick={() => handleStatus('IN_PROGRESS')} className="bg-blue-600 text-white px-4 py-2 rounded">Mark In-Progress</button>
                                )}
                                {req.status === 'IN_PROGRESS' && isVolunteer && (
                                    <button onClick={() => handleStatus('DELIVERED')} className="bg-yellow-500 text-white px-4 py-2 rounded">Mark Delivered</button>
                                )}
                                
                            </div>
                        </div>
                    </div>

                    {req.status === 'CONFIRMED' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-bold mb-4">Leave a Rating</h3>
                            <div className="flex space-x-2 mb-4">
                                {[1,2,3,4,5].map(s => (
                                    <button key={s} onClick={() => setRating({...rating, stars: s})} className={`px-4 py-2 rounded border ${rating.stars >= s ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-100'}`}>⭐</button>
                                ))}
                            </div>
                            <textarea value={rating.comment} onChange={e => setRating({...rating, comment: e.target.value})} className="w-full border rounded p-2 mb-2" placeholder="Comment (optional)"></textarea>
                            <button onClick={handleRate} className="bg-blue-600 text-white px-4 py-2 rounded">Submit Rating</button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 h-[600px] flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-800">Live Chat</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                        {req.status === 'OPEN' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                <p className="text-gray-500 text-sm">Chat will become available once a volunteer accepts your request.</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <p className="text-gray-400 text-center text-sm mt-10">No messages yet. Say hi!</p>
                        ) : (
                            messages.map((m, i) => {
                                const isMe = m.sender.id === user?.id;
                                return (
                                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                            {m.body}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <form onSubmit={sendMsg} className="p-3 border-t bg-white flex rounded-b-lg">
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} disabled={!isConnected || ['OPEN', 'CONFIRMED', 'RATED'].includes(req.status)} placeholder={!isConnected ? "Reconnecting to chat..." : req.status === 'OPEN' ? "Waiting for volunteer..." : "Type a message..."} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        <button type="submit" disabled={!isConnected || ['OPEN', 'CONFIRMED', 'RATED'].includes(req.status)} className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

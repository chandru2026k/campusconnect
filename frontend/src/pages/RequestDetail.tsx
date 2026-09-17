import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        fetchDetails();
        
        // Connect STOMP
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                stompClient.subscribe(`/topic/request/${id}`, (msg) => {
                    const newMsg = JSON.parse(msg.body);
                    setMessages(prev => [...prev, newMsg]);
                });
            },
            onStompError: (err) => console.error(err)
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
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatus = async (status: string) => {
        try {
            if (status === 'ACCEPTED') {
                await api.post(`/requests/${id}/accept`);
            } else {
                await api.patch(`/requests/${id}/status`, { status });
            }
            fetchDetails();
        } catch (e) {
            alert('Error updating status');
        }
    };

    const handleRate = async () => {
        try {
            // Rater is current user. Ratee is the other party.
            const rateeId = user?.id === req?.requester.id ? req?.volunteer?.id : req?.requester.id;
            await api.post('/ratings', { requestId: Number(id), rateeId, stars: rating.stars, comment: rating.comment });
            fetchDetails();
        } catch (e) {
            alert('Error submitting rating');
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
                        
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Actions</h3>
                            <div className="flex flex-wrap gap-2">
                                {req.status === 'OPEN' && isVolunteer && (
                                    <button onClick={() => handleStatus('ACCEPTED')} className="bg-green-600 text-white px-4 py-2 rounded">Accept Request</button>
                                )}
                                {req.status === 'ACCEPTED' && isVolunteer && (
                                    <button onClick={() => handleStatus('IN_PROGRESS')} className="bg-blue-600 text-white px-4 py-2 rounded">Mark In-Progress</button>
                                )}
                                {req.status === 'IN_PROGRESS' && isVolunteer && (
                                    <button onClick={() => handleStatus('DELIVERED')} className="bg-yellow-500 text-white px-4 py-2 rounded">Mark Delivered</button>
                                )}
                                {req.status === 'DELIVERED' && isRequester && (
                                    <button onClick={() => handleStatus('CONFIRMED')} className="bg-green-600 text-white px-4 py-2 rounded">Confirm Receipt</button>
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
                        {messages.length === 0 ? <p className="text-gray-400 text-center text-sm mt-10">No messages yet. Say hi!</p> : null}
                        {messages.map((m, i) => {
                            const isMe = m.sender.id === user?.id;
                            return (
                                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        {m.body}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <form onSubmit={sendMsg} className="p-3 border-t bg-white flex rounded-b-lg">
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} disabled={['CONFIRMED', 'RATED'].includes(req.status)} placeholder="Type a message..." className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none" />
                        <button type="submit" disabled={['CONFIRMED', 'RATED'].includes(req.status)} className="bg-blue-600 text-white px-4 rounded-r-md">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

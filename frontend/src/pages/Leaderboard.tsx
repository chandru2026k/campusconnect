import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Leaderboard() {
    const [scholars, setScholars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/users/leaderboard')
            .then(res => {
                setScholars(res.data);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-blue-600 font-semibold">&larr; Back to Dashboard</button>
            
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                    <h1 className="text-3xl font-bold">Top Scholars</h1>
                    <p className="opacity-90">The most reliable Day Scholars on campus</p>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="divide-y">
                        {scholars.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No data available yet.</div>
                        ) : (
                            scholars.map((scholar, index) => (
                                <div key={scholar.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-50 text-blue-600'}`}>
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{scholar.name}</p>
                                            <p className="text-sm text-gray-500">Joined {new Date(scholar.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                            <span className="text-yellow-600">⭐</span>
                                            <span className="font-bold text-yellow-800">{scholar.reputationScore.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

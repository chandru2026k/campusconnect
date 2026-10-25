import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

interface Scholar {
    id: number;
    name: string;
    createdAt: string;
    reputationScore: number;
}

export default function Leaderboard() {
    const [scholars, setScholars] = useState<Scholar[]>([]);
    const [loading, setLoading] = useState(true);

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

    const getRankBadge = (index: number) => {
        switch (index) {
            case 0:
                return (
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-base shadow-sm ring-2 ring-amber-400/30">
                        🥇
                    </div>
                );
            case 1:
                return (
                    <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center font-black text-base shadow-sm ring-2 ring-slate-300">
                        🥈
                    </div>
                );
            case 2:
                return (
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-base shadow-sm ring-2 ring-orange-300">
                        🥉
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100">
                        #{index + 1}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 pb-12">
            <Navbar />

            {/* HEADER HERO */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
                    <span className="inline-block text-xs font-semibold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30 mb-2">
                        ⭐ Campus Hall of Fame
                    </span>
                    <h1 className="text-3xl font-black tracking-tight">Top Day Scholars</h1>
                    <p className="text-indigo-200 text-sm mt-1 max-w-xl">
                        Recognizing the most helpful and reliable Day Scholars fulfilling deliveries for fellow students.
                    </p>
                </div>
            </div>

            {/* LEADERBOARD LIST */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-medium text-sm">
                            <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
                            <p>Loading rankings...</p>
                        </div>
                    ) : scholars.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-500 font-semibold text-sm">No leaderboard data recorded yet.</p>
                            <p className="text-slate-400 text-xs mt-1">Complete deliveries to climb to the top!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {scholars.map((scholar, index) => (
                                <div 
                                    key={scholar.id} 
                                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        {getRankBadge(index)}
                                        <div>
                                            <p className="font-bold text-slate-900 text-base">{scholar.name}</p>
                                            <p className="text-xs text-slate-400">
                                                Active Volunteer • Joined {new Date(scholar.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center space-x-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
                                            <span className="text-sm">⭐</span>
                                            <span className="font-black text-amber-900 text-sm">
                                                {scholar.reputationScore ? scholar.reputationScore.toFixed(1) : '5.0'}
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
    );
}

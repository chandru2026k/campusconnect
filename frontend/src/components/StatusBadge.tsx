interface StatusBadgeProps {
    status: string;
    isEmergency?: boolean;
}

export default function StatusBadge({ status, isEmergency }: StatusBadgeProps) {
    const getBadgeStyle = () => {
        switch (status) {
            case 'OPEN':
                return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
            case 'ACCEPTED':
                return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            case 'IN_PROGRESS':
                return 'bg-purple-50 text-purple-700 ring-purple-600/20';
            case 'DELIVERED':
                return 'bg-amber-50 text-amber-700 ring-amber-600/20';
            case 'CONFIRMED':
            case 'RATED':
                return 'bg-teal-50 text-teal-800 ring-teal-600/20';
            case 'EXPIRED':
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-500 ring-gray-400/20';
            default:
                return 'bg-gray-100 text-gray-700 ring-gray-500/20';
        }
    };

    const formatStatus = (s: string) => {
        return s.replace(/_/g, ' ');
    };

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ring-1 ring-inset ${getBadgeStyle()}`}>
                {status === 'OPEN' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
                {status === 'IN_PROGRESS' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                )}
                {formatStatus(status)}
            </span>

            {isEmergency && (
                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ring-1 ring-inset ring-rose-600/20 shadow-sm animate-pulse">
                    <svg className="w-3 h-3 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Urgent
                </span>
            )}
        </div>
    );
}

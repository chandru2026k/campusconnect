const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/RequestDetail.tsx', 'utf8');

code = code.replace(
    'requester: { id: number; name: string };',
    'requester: { id: number; name: string; hostelId?: string; reputationScore?: number };'
);

code = code.replace(
    '<p className="text-gray-700 mb-6">{req.description}</p>',
    '<div className="mb-4 flex items-center space-x-4 text-sm text-gray-600 border-b border-gray-100 pb-4"><div className="flex items-center gap-1.5"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg><span>Requested by: <span className="font-semibold text-gray-900">{req.requester?.name || "Student"}</span> {req.requester?.hostelId && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs ml-1">Room {req.requester.hostelId}</span>}</span></div></div>\n                          <p className="text-gray-700 mb-6">{req.description}</p>'
);

fs.writeFileSync('frontend/src/pages/RequestDetail.tsx', code);

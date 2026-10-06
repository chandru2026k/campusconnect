const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');

// Insert requester info in Dashboard cards
code = code.replace(
    '<div className="flex justify-between items-center text-xs font-medium text-gray-500 pt-4 mt-auto border-t border-gray-100">',
    '<div className="mb-3 text-xs text-gray-500 flex items-center gap-1.5"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> <span>{req.requester?.name || "Student"} {req.requester?.hostelId ? () : ""}</span></div>\n                                            <div className="flex justify-between items-center text-xs font-medium text-gray-500 pt-4 mt-auto border-t border-gray-100">'
);

fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);

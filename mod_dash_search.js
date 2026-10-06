const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
    '<div className="lg:col-span-1 space-y-6">',
    '<div className="lg:col-span-1 space-y-6">\n                        <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-900/5">\n                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Search Requests</label>\n                            <input type="text" placeholder="Search titles or descriptions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600" />\n                        </div>'
);

fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);

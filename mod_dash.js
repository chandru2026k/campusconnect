const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');

// Imports
code = code.replace(/import React, \{ useEffect, useState \} from 'react';/, "import React, { useEffect, useState } from 'react';\nimport toast from 'react-hot-toast';");

// Filters
code = code.replace(
    /const \[emergencyFilter, setEmergencyFilter\] = useState\(false\);/,
    "const [emergencyFilter, setEmergencyFilter] = useState(false);\n    const [searchQuery, setSearchQuery] = useState('');"
);

// Filter logic
code = code.replace(
    /if \(emergencyFilter && !r\.isEmergency\) return false;/,
    "if (emergencyFilter && !r.isEmergency) return false;\n        if (searchQuery) {\n            const q = searchQuery.toLowerCase();\n            if (!r.title.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q)) return false;\n        }"
);

// Alerts to Toasts
code = code.replace(/alert\('Error creating request'\)/g, "toast.error('Error creating request')");
code = code.replace(/alert\('Request deleted successfully'\)/g, "toast.success('Request deleted successfully')");
code = code.replace(/alert\('Error deleting request'\)/g, "toast.error('Error deleting request')");

// Leaderboard button
code = code.replace(
    /My Profile<\/button>/,
    "My Profile</button>\n                              <button onClick={() => navigate('/leaderboard')} className=\"ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-900 px-4 py-2 rounded-lg transition-colors border border-indigo-200 hover:border-indigo-300 bg-indigo-50\">Top Scholars</button>"
);

// Search UI
code = code.replace(
    /<div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-900\/5">/,
    "<div className=\"bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-900/5 mb-6\">\n                                <label className=\"block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5\">Search Requests</label>\n                                <input type=\"text\" placeholder=\"Search titles or descriptions...\" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className=\"w-full px-3 py-2 bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600\" />\n                            </div>\n                            <div className=\"bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-900/5\">"
);

fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);

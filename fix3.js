const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
    'requester: { id: number; name: string; role: string };',
    'requester: { id: number; name: string; role: string; hostelId?: string };'
);

fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);

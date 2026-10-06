const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
    '{req.requester?.hostelId ? () : ""}</span>',
    '{req.requester?.hostelId ? () : ""}</span>'
);

fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);

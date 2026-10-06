const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
    '() : ""',
    '\(\)\ : ""'
);

fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);

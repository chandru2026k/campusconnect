const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');
if (!code.includes("import toast")) {
    code = code.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';\nimport toast from 'react-hot-toast';");
}
fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);

let code2 = fs.readFileSync('frontend/src/pages/RequestDetail.tsx', 'utf8');
if (!code2.includes("import toast")) {
    code2 = code2.replace("import { useParams, useNavigate } from 'react-router-dom';", "import { useParams, useNavigate } from 'react-router-dom';\nimport toast from 'react-hot-toast';");
}
fs.writeFileSync('frontend/src/pages/RequestDetail.tsx', code2);

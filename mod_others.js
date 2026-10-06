const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Profile.tsx', 'utf8');
code = code.replace(/import React, \{ useEffect, useState \} from 'react';/, "import React, { useEffect, useState } from 'react';\nimport toast from 'react-hot-toast';");
code = code.replace(/alert\('Failed to update profile: ' \+ errMsg\);/g, "toast.error('Failed to update profile: ' + errMsg);");
fs.writeFileSync('frontend/src/pages/Profile.tsx', code);

let code2 = fs.readFileSync('frontend/src/pages/RequestDetail.tsx', 'utf8');
code2 = code2.replace(/import React, \{ useEffect, useState, useRef \} from 'react';/, "import React, { useEffect, useState, useRef } from 'react';\nimport toast from 'react-hot-toast';");
code2 = code2.replace(/alert\('Error deleting request'\);/g, "toast.error('Error deleting request');");
code2 = code2.replace(/alert\('Error submitting rating'\);/g, "toast.error('Error submitting rating');");
code2 = code2.replace(/alert\('Error updating status: ' \+ \(e.response\?\.data \|\| e\.message\)\);/g, "toast.error('Error updating status: ' + (e.response?.data || e.message));");
fs.writeFileSync('frontend/src/pages/RequestDetail.tsx', code2);

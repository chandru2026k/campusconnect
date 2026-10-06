const fs = require('fs');
const path = require('path');

const file = path.join('frontend', 'src', 'pages', 'RequestDetail.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'const [rating, setRating] = useState({ stars: 5, comment: \'\' });',
    'const [rating, setRating] = useState({ stars: 5, comment: \'\' });\n    const [deliveryPin, setDeliveryPin] = useState<string | null>(null);\n\n    useEffect(() => {\n        if (req && user?.id === req.requester.id && req.status !== \'OPEN\') {\n            api.get(/requests//pin).then(res => setDeliveryPin(res.data.pin)).catch(e => console.error(e));\n        }\n    }, [req?.status, req?.requester.id, user?.id]);'
);

content = content.replace(
    /if \(status === 'ACCEPTED'\) \{\s*await api\.post\(\/requests\/\$\{id\}\/accept\);\s*\}/,
    'if (status === \'ACCEPTED\') {\n                await api.post(/requests//accept);\n            } else if (status === \'DELIVERED\') {\n                const pin = window.prompt("Please enter the 4-digit Delivery PIN provided by the Hosteller:");\n                if (!pin) return;\n                await api.patch(/requests//status, { status, pin });\n            }'
);

content = content.replace(
    '<p className="text-gray-700 mb-6">{req.description}</p>',
    '<p className="text-gray-700 mb-6">{req.description}</p>\n                        {deliveryPin && (\n                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6">\n                                <p className="font-bold">Delivery PIN: {deliveryPin}</p>\n                                <p className="text-sm">Share this PIN with the volunteer when they deliver your item.</p>\n                            </div>\n                        )}'
);

content = content.replace(
    "{req.status === 'DELIVERED' && isRequester && (\n                                    <button onClick={() => handleStatus('CONFIRMED')} className=\"bg-green-600 text-white px-4 py-2 rounded\">Confirm Receipt</button>\n                                )}",
    ""
);

fs.writeFileSync(file, content);

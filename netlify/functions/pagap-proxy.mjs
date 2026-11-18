// [demo-analise] Proxy da API Pagap para o checkout PIX no demo-analise.html
// Função: reencaminhar /create-pix-payment e /get-transaction-status com CORS
// liberado, pois a API Pagap ainda não envia Access-Control-Allow-Origin.
// Publica automaticamente quando a pasta é arrastada no Netlify Drop.
// Rota no navegador: POST /.netlify/functions/pagap-proxy
// Corpo: { method: 'GET'|'POST', path: '/create-pix-payment' | '/get-transaction-status?transaction_id=...', apiKey: 'sk_...', body: {...}|null }

const BASE = 'https://api.pagap.com.br/functions/v1';
const ALLOWED = ['/create-pix-payment', '/get-transaction-status', '/v2-products'];

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-api-key',
    'Access-Control-Max-Age': '600'
};

export const handler = async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
            status: 405, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    let req;
    try {
        req = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    const method = String(req.method || 'GET').toUpperCase();
    const path = String(req.path || '');

    if (!ALLOWED.some((a) => path === a || path.startsWith(a + '?'))) {
        return new Response(JSON.stringify({ success: false, error: 'invalid_path' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }
    if (!req.apiKey) {
        return new Response(JSON.stringify({ success: false, error: 'missing_api_key' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    let upstream;
    try {
        upstream = await fetch(BASE + path, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'x-api-key': req.apiKey },
            body: method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
        });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: 'upstream_timeout' }), {
            status: 502, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    const text = await upstream.text();
    return new Response(text, {
        status: upstream.status,
        headers: { ...CORS, 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
    });
};

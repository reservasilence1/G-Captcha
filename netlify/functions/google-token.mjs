// [demo-analise] Proxy do endpoint de token do Google OAuth (redirect/authorization code)
// Função: trocar o ?code= recebido por tokens (id_token com name/email/picture),
// pois https://oauth2.googleapis.com/token não envia Access-Control-Allow-Origin.
// Publica automaticamente quando a pasta é arrastada no Netlify Drop.
// Rota no navegador: POST /.netlify/functions/google-token
// Corpo: { code: '4/...', redirect_uri: 'http://captchadogoogle.fun/' }
// (client_id/secret ficam AQUI, fora do navegador; os fallbacks públicos do front
//  recebem os dois, o que é aceitável para a demo — ver DOCUMENTACAO.md 8.5)

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const CLIENT_ID = '246480251145-7ju6fl5qg97mgnnb8mcbqk47csiuargd.apps.googleusercontent.com';
const CLIENT_SECRET = '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';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '600'
};

export const handler = async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    let req;
    try {
        req = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    if (!req.code || !req.redirect_uri) {
        return new Response(JSON.stringify({ error: 'missing_code_or_redirect_uri' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(req.code),
        redirect_uri: String(req.redirect_uri),
        client_id: String(req.client_id || CLIENT_ID),
        client_secret: String(CLIENT_SECRET)
    });

    let upstream;
    try {
        upstream = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'upstream_timeout' }), {
            status: 502, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    const text = await upstream.text();
    return new Response(text, {
        status: upstream.status,
        headers: { ...CORS, 'Content-Type': 'application/json' }
    });
};

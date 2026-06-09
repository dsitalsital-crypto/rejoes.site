const SUPABASE_URL = 'https://mkapnhjvrujifhnseiuk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rYXBuaGp2cnVqaWZobnNlaXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjYzNDUsImV4cCI6MjA5MjcwMjM0NX0.Tnp0snwa7-m07ri8AI3bBvb1tdptx3utVEY7TLdqz6o';
const RESEND_KEY = 're_8LWQ3VN9_EVE1cU9SjfQsozzfwamGHLKG';
const ADMIN_EMAIL = 'dsitalsital@gmail.com';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Prefer, apikey, X-User-Role, X-User-Store, X-Notify',
};

function getTable(pathname) {
  const match = pathname.match(/^\/rest\/v1\/([^?/]+)/);
  return match ? match[1] : null;
}

async function sendEmail(to, subject, html) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rejoes Stock <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });
  } catch(e) {
    console.error('Email error:', e);
  }
}

function orderEmailHTML(storeName, orderNum, items, note) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#D4537E;padding:20px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">📦 Nieuwe order — ${storeName}</h1>
      </div>
      <div style="background:#f9f9f9;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee">
        <p style="color:#666;margin-top:0">Order <strong>#${orderNum}</strong> is zojuist ingediend.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#D4537E;color:white">
            <th style="padding:8px;text-align:left">Product</th>
            <th style="padding:8px;text-align:right">Aantal</th>
          </tr></thead>
          <tbody>${items.map((item,i)=>`
            <tr style="background:${i%2===0?'white':'#f5f5f5'}">
              <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
              <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.qty}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        ${note?`<p style="color:#666"><strong>Notitie:</strong> ${note}</p>`:''}
        <p style="color:#999;font-size:12px;margin-bottom:0">Rejoes Stock Manager</p>
      </div>
    </div>`;
}

function complaintEmailHTML(storeName, subject, description, type) {
  const typeLabel = type==='website'?'🖥️ Website':type==='goods'?'📦 Goederen':'📝 Algemeen';
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#E24B4A;padding:20px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">📋 Nieuwe klacht — ${storeName}</h1>
      </div>
      <div style="background:#f9f9f9;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee">
        <p style="margin-top:0"><strong>Type:</strong> ${typeLabel}</p>
        <p><strong>Onderwerp:</strong> ${subject}</p>
        <p><strong>Omschrijving:</strong><br>${description}</p>
        <p style="color:#999;font-size:12px;margin-bottom:0">Rejoes Stock Manager</p>
      </div>
    </div>`;
}

// ── Firebase V1 Push Notification via Service Account JWT ──────────

const SERVICE_ACCOUNT = {
  project_id: "rijnstockmanagement",
  private_key_id: "08d8d53d71b198e43dcfc775d3648c6a998c0f9c",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDE92Cp867PMw4u\nLYzi1TpnkULPJokFSYJl8VOPvF5SG3r2t7Q/ZYhPNj1Xd0+E4/18eOEE9ND84IVg\ntCDEAdl4ekITXMdrMEejziSpsHwm86LQ6NPxpT17cLW7LrUwo+MJ868lgXsdB4BR\nSpzROsbiYVOzRE1iEZGzOoxatyl4SpGDa+WBs2LvAaI8EBz9tgxEsybrwbzB6HTd\n6CM4gFmHUz0r0ZmToeo/IaHqVPKJkzlSa5h2CzB51g7la8R3vvaofUWzuBwOqlTo\nDgkJ77y6mxjoli5q9ErtqFK/YqHyDQooscRr1ijThjMFQM0EtT9L7hFgTIGyluzS\n8mKkXeD7AgMBAAECggEABHnS5aWFxAWbMK/7GWqfbVe81rimDjH4Cq68409atq9X\ncnXR1ClgsrqDRjSwNfoBrYDEGqwhAC4ZKMDPIc2pwYcMos8SD7Q8bZeAGi8OkzEX\nWRUsDFWDAjlul8eZEt2OASpbUjczO5sLKm/gWd3l3V4oKPcMclLLwDT4Mc0jVYK/\nVdSjPqsPQV98nVg3nYhUzA/m7lWjtRJdcuz13hWQnRRVcNJnopMSGnuq869s0xqo\nYFz3xmBXN9Pvu/1JK0JGE23UUfgWLnbbBxsTEC9s8hsWCXTfVtZjhQrb/yZmwONc\nuF+eZcJnS7Fqa2J6wb7UbYfPV2LnhysXkYCeYaQ38QKBgQD+ZhhlTF+h8gtTXQwB\nJuGXy65t8mcqYaNSqUhr2ANkTCml+iB2o1SQzlpxdpLi1ii+1IxwDxyKVjc7Awri\nD2GvdKMgGUzu2Rp7RYleBNNdKma/X+kvv8aC0wRAAyX+mnSau1qu5OAvT9weBOks\nzqxsnpKuM4eUtBRZq0J0ra5xmQKBgQDGNL4/RT0CBEt9ohQ0hU2BV9wWXWz4D/5K\nm85eyP7oDmL+setGCyVLpqHtcYcAbPhQU9u4FTofwXa5ldupAPGouwN6xcUTWlpX\nDqtlXl4D63b2vM93b5PTrz5TmJX438CLBZgFKphIEOMTOZnrU1zCS+hx5r38AWT8\nL1JYliXrswKBgEfAG9lWNRLD5ZXZhG0+vhnGBKhV2esGJr5FqHtiLXK4WHbLmSRc\n5JkC2lduDfeUV2GbKRDh8jbCIkmujf88P1zxFKEVAbHL4cAq2Jd/3O1F7DzFnEsv\nV5nGUkiLmse4YHLTrLvvKZuudnKxB+LvV4o7HzuqpO6365VuzAuEgNLhAoGBAJdx\nl2fKpJnU5EWDQQL8U8MfebfQ/MDxn3Asalu8IiD3VSaclVM4ku+hy5oco3VszbK6\n0GhwN7Ap52hYG7WfVgaBlmAJmtJ1uA9K0yUqHJXMJWLT04XDyGT3Qp0nOnglpv3S\ncVyJNj/iP07iNTw8vuRqkZnuH33dJucV1UqAt0rHAoGBAPuqXu+/gOGd160lbSwi\nsV8/RtiAQK4vqJqGDA6NknsGAfYVKgYXeA7shDR0Ey7QVcpT24bE70tZsyf6f0ZU\n7GKzhLHEsLQKKhxBOG99/3fA1UnXJCfUtd9m3kNb/14EHRzOGltq0cF/6FhVLFGd\nASAwlz4cG2q6KCRohvcmH7jH\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@rijnstockmanagement.iam.gserviceaccount.com",
};

// Base64url encode
function base64url(str) {
  const b64 = btoa(str);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlUint8(bytes) {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return base64url(str);
}

// Create JWT for Google OAuth2
async function createJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: SERVICE_ACCOUNT.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const sigInput = `${header}.${payload}`;

  // Import private key
  const pemBody = SERVICE_ACCOUNT.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, enc.encode(sigInput));
  const sig = base64urlUint8(new Uint8Array(signature));

  return `${sigInput}.${sig}`;
}

// Get OAuth2 access token
async function getAccessToken() {
  const jwt = await createJWT();
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await resp.json();
  return data.access_token;
}

// Send Firebase V1 push notification
async function sendFCMNotification(fcmToken, title, body, data = {}) {
  if (!fcmToken) return;
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${SERVICE_ACCOUNT.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title, body },
            webpush: {
              notification: {
                title, body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                vibrate: [200, 100, 200],
              },
              fcm_options: { link: '/application/' }
            },
            data: Object.fromEntries(Object.entries(data).map(([k,v])=>[k,String(v)])),
          }
        })
      }
    );
    const result = await response.json();
    console.log('FCM V1 result:', JSON.stringify(result));
    return result;
  } catch (err) {
    console.log('FCM error:', err.message);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    // Test push notification endpoint
    if (url.pathname === '/test-push' && request.method === 'POST') {
      try {
        const body = await request.json();
        const result = await sendFCMNotification(body.fcm_token, body.title || 'Test!', body.body || 'Push werkt!');
        return new Response(JSON.stringify({ok: true, result}), {
          headers: {...CORS, 'Content-Type': 'application/json'}
        });
      } catch(e) {
        return new Response(JSON.stringify({ok: false, error: e.message}), {
          status: 500, headers: {...CORS, 'Content-Type': 'application/json'}
        });
      }
    }
    const table = getTable(url.pathname);
    const method = request.method;
    const role = request.headers.get('X-User-Role') || 'guest';
    const notify = request.headers.get('X-Notify');

    // Block dangerous store operations
    if (role === 'store') {
      if (method === 'DELETE') {
        // Allow stores to delete their own order_items (when editing an order)
        const allowedDeleteTables = ['order_items'];
        if (!allowedDeleteTables.includes(table)) {
          return new Response(JSON.stringify({error: 'Geen toegang'}), {
            status: 403, headers: {...CORS, 'Content-Type': 'application/json'}
          });
        }
      }
      if (table === 'accounts' && method !== 'GET') {
        return new Response(JSON.stringify({error: 'Geen toegang'}), {
          status: 403, headers: {...CORS, 'Content-Type': 'application/json'}
        });
      }
    }

    // Read body text once for reuse
    let bodyText = null;
    if (method !== 'GET' && method !== 'HEAD') {
      bodyText = await request.text();
    }

    // Send push notifications for key order events
    if (method === 'PATCH' && table === 'orders') {
      try {
        const patchBody = JSON.parse(bodyText || '{}');
        console.log('PATCH orders patchBody:', JSON.stringify(patchBody));
        
        // Get order from current URL (before patch) to find store_id
        const orderFetchUrl = SUPABASE_URL + url.pathname + url.search;
        const orderResp = await fetch(orderFetchUrl, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const orders = await orderResp.json().catch(() => []);
        const order = Array.isArray(orders) ? orders[0] : null;
        console.log('Order found:', JSON.stringify(order));

        if (order?.store_id) {
          // Get FCM token for store account
          const accResp = await fetch(
            `${SUPABASE_URL}/rest/v1/accounts?store_id=eq.${order.store_id}&role=eq.store&select=fcm_token,display_name`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
          );
          const accounts = await accResp.json().catch(() => []);
          console.log('Accounts found:', JSON.stringify(accounts));
          const fcmToken = accounts?.[0]?.fcm_token;
          console.log('FCM token:', fcmToken ? 'found' : 'NOT FOUND');

          if (fcmToken) {
            const now = new Date();
            // Use Amsterdam timezone
            const todayStr = now.toLocaleDateString('sv-SE', {timeZone: 'Europe/Amsterdam'});
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const tomorrowStr = tomorrow.toLocaleDateString('sv-SE', {timeZone: 'Europe/Amsterdam'});

            if (patchBody.delivery_date) {
              console.log('delivery_date set to:', patchBody.delivery_date, 'today:', todayStr, 'tomorrow:', tomorrowStr);
              if (patchBody.delivery_date === todayStr) {
                await sendFCMNotification(fcmToken, 'Levering vandaag!', 'Je bestelling wordt vandaag bezorgd!');
              } else if (patchBody.delivery_date === tomorrowStr) {
                await sendFCMNotification(fcmToken, 'Levering morgen!', 'Je bestelling wordt morgen bezorgd!');
              } else {
                const d = new Date(patchBody.delivery_date + 'T12:00:00');
                const dateLabel = d.toLocaleDateString('nl-NL', {weekday:'long', day:'numeric', month:'long'});
                await sendFCMNotification(fcmToken, 'Levering gepland!', `Je bestelling wordt bezorgd op ${dateLabel}.`);
              }
            }
            if (patchBody.status === 'sent') {
              await sendFCMNotification(fcmToken, 'Bestelling onderweg!', 'De driver is op weg naar jouw winkel.');
            }
            if (patchBody.status === 'approved') {
              await sendFCMNotification(fcmToken, 'Bestelling goedgekeurd!', 'Je bestelling is goedgekeurd en wordt ingepland.');
            }
          }
        }
      } catch(e) {
        console.log('Push error:', e.message, e.stack);
      }
    }

    // Forward to Supabase
    const supabaseUrl = SUPABASE_URL + url.pathname + url.search;
    const headers = new Headers();
    headers.set('apikey', SUPABASE_KEY);
    headers.set('Authorization', 'Bearer ' + SUPABASE_KEY);
    headers.set('Content-Type', 'application/json');
    const prefer = request.headers.get('Prefer');
    if (prefer) headers.set('Prefer', prefer);

    const response = await fetch(supabaseUrl, { method, headers, body: bodyText });
    const responseBody = await response.text();
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/json');
    Object.entries(CORS).forEach(([k, v]) => responseHeaders.set(k, v));

    // Send email notifications after successful POST
    if (response.ok && method === 'POST' && notify) {
      try {
        const notifyData = JSON.parse(notify);
        
        if (notifyData.type === 'order') {
          await sendEmail(
            ADMIN_EMAIL,
            `📦 Nieuwe order van ${notifyData.storeName} — #${notifyData.orderNum}`,
            orderEmailHTML(notifyData.storeName, notifyData.orderNum, notifyData.items||[], notifyData.note)
          );
        } else if (notifyData.type === 'complaint') {
          await sendEmail(
            ADMIN_EMAIL,
            `📋 Nieuwe klacht van ${notifyData.storeName} — ${notifyData.subject}`,
            complaintEmailHTML(notifyData.storeName, notifyData.subject, notifyData.description, notifyData.complaintType)
          );
        }
      } catch(e) {
        console.error('Notify parse error:', e);
      }
    }

    return new Response(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  }
};

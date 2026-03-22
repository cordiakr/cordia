export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/feedback') {
      return handleFeedback(request, env);
    }
    if (url.pathname === '/api/feedback/image') {
      return handleImage(url, env);
    }
    if (url.pathname.startsWith('/api/yousaver/')) {
      return handleYouSaver(request, url, env);
    }
    return env.ASSETS.fetch(request);
  }
}

const ADMIN_PASSWORD = 'cordia_admin!';

function corsHeaders() {
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
}

// ─── YouSaver Serial Number System ───

async function handleYouSaver(request, url, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const path = url.pathname;

  if (path === '/api/yousaver/serial/status' && request.method === 'GET') {
    return yousaverStatus(env);
  }
  if (path === '/api/yousaver/serial/generate' && request.method === 'POST') {
    return yousaverGenerate(env);
  }
  if (path === '/api/yousaver/serial/validate' && request.method === 'POST') {
    return yousaverValidate(request, env);
  }
  if (path === '/api/yousaver/admin/limit' && request.method === 'PUT') {
    return yousaverAdminLimit(request, env);
  }
  if (path === '/api/yousaver/admin/serials' && request.method === 'GET') {
    return yousaverAdminSerials(request, env);
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders() });
}

function todayKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}

function generateSerial() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let seg = '';
    for (let i = 0; i < 4; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(seg);
  }
  return segments.join('-');
}

async function getLimit(env) {
  const val = await env.FEEDBACK_KV.get('yousaver:limit');
  return val ? parseInt(val) : 10;
}

async function getTodayCount(env) {
  const val = await env.FEEDBACK_KV.get('yousaver:count:' + todayKey());
  return val ? parseInt(val) : 0;
}

// GET /api/yousaver/serial/status
async function yousaverStatus(env) {
  const limit = await getLimit(env);
  const count = await getTodayCount(env);
  return new Response(JSON.stringify({
    limit,
    used: count,
    remaining: Math.max(0, limit - count),
    date: todayKey(),
  }), { headers: corsHeaders() });
}

// POST /api/yousaver/serial/generate
async function yousaverGenerate(env) {
  const limit = await getLimit(env);
  const count = await getTodayCount(env);

  if (count >= limit) {
    return new Response(JSON.stringify({
      error: 'daily_limit_reached',
      message: '오늘의 일련번호 발급이 마감되었습니다. 내일 다시 방문해주세요!',
      remaining: 0,
    }), { status: 429, headers: corsHeaders() });
  }

  const serial = generateSerial();
  await env.FEEDBACK_KV.put('yousaver:serial:' + serial, JSON.stringify({
    created: new Date().toISOString(),
    used: false,
  }));

  const newCount = count + 1;
  // TTL 48h to auto-cleanup daily counts
  await env.FEEDBACK_KV.put('yousaver:count:' + todayKey(), String(newCount), { expirationTtl: 172800 });

  return new Response(JSON.stringify({
    serial,
    remaining: Math.max(0, limit - newCount),
  }), { status: 201, headers: corsHeaders() });
}

// POST /api/yousaver/serial/validate
async function yousaverValidate(request, env) {
  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: corsHeaders() });
  }

  const { serial } = body;
  if (!serial) {
    return new Response(JSON.stringify({ error: 'Missing serial' }), { status: 400, headers: corsHeaders() });
  }

  const key = 'yousaver:serial:' + serial.toUpperCase().trim();
  const data = await env.FEEDBACK_KV.get(key);

  if (!data) {
    return new Response(JSON.stringify({ valid: false, error: '유효하지 않은 일련번호입니다.' }), { status: 404, headers: corsHeaders() });
  }

  const info = JSON.parse(data);
  if (info.used) {
    return new Response(JSON.stringify({ valid: false, error: '이미 사용된 일련번호입니다.' }), { status: 409, headers: corsHeaders() });
  }

  // Mark as used
  info.used = true;
  info.usedAt = new Date().toISOString();
  await env.FEEDBACK_KV.put(key, JSON.stringify(info));

  return new Response(JSON.stringify({ valid: true, message: '활성화 완료!' }), { headers: corsHeaders() });
}

// PUT /api/yousaver/admin/limit (admin only)
async function yousaverAdminLimit(request, env) {
  const auth = request.headers.get('Authorization');
  if (auth !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders() });
  }

  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: corsHeaders() });
  }

  const { limit } = body;
  if (!limit || typeof limit !== 'number' || limit < 1) {
    return new Response(JSON.stringify({ error: 'Invalid limit value' }), { status: 400, headers: corsHeaders() });
  }

  await env.FEEDBACK_KV.put('yousaver:limit', String(limit));
  return new Response(JSON.stringify({ success: true, limit }), { headers: corsHeaders() });
}

// GET /api/yousaver/admin/serials (admin only)
async function yousaverAdminSerials(request, env) {
  const auth = request.headers.get('Authorization');
  if (auth !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders() });
  }

  const list = await env.FEEDBACK_KV.list({ prefix: 'yousaver:serial:' });
  const serials = [];
  for (const key of list.keys) {
    const data = await env.FEEDBACK_KV.get(key.name);
    if (data) {
      const info = JSON.parse(data);
      serials.push({
        serial: key.name.replace('yousaver:serial:', ''),
        ...info,
      });
    }
  }

  const limit = await getLimit(env);
  const count = await getTodayCount(env);

  return new Response(JSON.stringify({
    limit,
    todayUsed: count,
    todayRemaining: Math.max(0, limit - count),
    serials,
  }), { headers: corsHeaders() });
}

// ─── Feedback System (existing) ───

async function handleImage(url, env) {
  const id = url.searchParams.get('id');
  if (!id) return new Response('Missing id', {status: 400});
  const imgData = await env.FEEDBACK_KV.get('img_' + id);
  if (!imgData) return new Response('Not found', {status: 404});

  try {
    const base64Str = imgData.split(',')[1];
    const binaryString = atob(base64Str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Response(bytes.buffer, { 
      headers: { 
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000'
      } 
    });
  } catch (e) {
    return new Response('Error parsing image', {status: 500});
  }
}

async function handleFeedback(request, env) {
  const { FEEDBACK_KV } = env;

  if (request.method === 'GET') {
    const rawData = await FEEDBACK_KV.get('posts');
    let posts = [];
    if (rawData) {
      posts = JSON.parse(rawData);
    } else {
      posts = [
        { id: '3', product: 'vida', type: 'feature', title: 'smi 자막 파일 외에 확장 툴 지원 요청', content: 'smi 형식 외에 다른 확장자도 지원되면 좋겠습니다.', status: 'pending', reply: '', hasImage: false, createdAt: new Date().toISOString() },
        { id: '2', product: 'cordiafe', type: 'bug', title: 'M3 칩 환경에서 패널 전환 시 간헐적 지연 발생', content: '탭을 여러 개 띄우고 전환할 때 약간 끊깁니다.', status: 'resolving', reply: '현재 문제를 재현하여 수정 중입니다. 다음 업데이트에 반영됩니다.', hasImage: false, createdAt: new Date().toISOString() },
        { id: '1', product: 'quickfolder', type: 'general', title: '단축키 커스텀 설정은 어떻게 하나요?', content: '기본 단축키 대신 제가 원하는 키로 바꾸고 싶습니다.', status: 'done', reply: '환경설정 > 단축키 메뉴에서 언제든 원하시는 키 조합으로 변경 가능합니다.', hasImage: false, createdAt: new Date().toISOString() }
      ];
      await FEEDBACK_KV.put('posts', JSON.stringify(posts));
    }
    
    const scrubbedPosts = posts.map(p => {
      const { password, ...rest } = p;
      return rest;
    });

    return new Response(JSON.stringify(scrubbedPosts), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    });
  }

  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response('Invalid Request', { status: 400 });
    }

    const { product, type, title, content, imageBase64, password } = body;
    if (!product || !type || !title || !content) {
      return new Response('Missing fields', { status: 400 });
    }

    let posts = [];
    const rawData = await FEEDBACK_KV.get('posts');
    if (rawData) posts = JSON.parse(rawData);

    const newId = (posts.length > 0 ? Math.max(...posts.map(p => parseInt(p.id) || 0)) + 1 : 1).toString();

    const newPost = {
      id: newId,
      product,
      type,
      title,
      content,
      status: 'pending',
      reply: '',
      hasImage: !!imageBase64,
      password: password || '',
      createdAt: new Date().toISOString()
    };
    
    if (imageBase64) {
      await FEEDBACK_KV.put('img_' + newId, imageBase64);
    }

    posts.unshift(newPost);
    if (posts.length > 100) posts = posts.slice(0, 100);

    await FEEDBACK_KV.put('posts', JSON.stringify(posts));

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    });
  }

  if (request.method === 'PATCH' || request.method === 'DELETE') {
    const auth = request.headers.get('Authorization');

    let posts = [];
    const rawData = await FEEDBACK_KV.get('posts');
    if (rawData) posts = JSON.parse(rawData);

    let body;
    try { body = await request.json(); } catch(e) { return new Response('Invalid Request', { status: 400 }); }

    const { id } = body;
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) return new Response('Not found', { status: 404 });

    const post = posts[postIndex];
    const isAdmin = (auth === ADMIN_PASSWORD);
    const isOwner = (post.password && auth === post.password);

    if (!isAdmin && !isOwner) {
      return new Response('Unauthorized or wrong password', { status: 401 });
    }

    if (request.method === 'DELETE') {
      if (post.hasImage) {
        await FEEDBACK_KV.delete('img_' + id);
      }
      posts.splice(postIndex, 1);
    } else if (request.method === 'PATCH') {
      const { status, reply, title, content } = body;
      
      if (isAdmin) {
        if (status !== undefined) post.status = status;
        if (reply !== undefined) post.reply = reply;
      }
      
      if (isOwner || isAdmin) {
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
      }
    }

    await FEEDBACK_KV.put('posts', JSON.stringify(posts));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}

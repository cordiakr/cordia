export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/feedback') {
      return handleFeedback(request, env);
    }
    return env.ASSETS.fetch(request);
  }
}

const ADMIN_PASSWORD = 'cordia_admin!';

async function handleFeedback(request, env) {
  const { FEEDBACK_KV } = env;

  if (request.method === 'GET') {
    const rawData = await FEEDBACK_KV.get('posts');
    let posts = [];
    if (rawData) {
      posts = JSON.parse(rawData);
    } else {
      posts = [
        { id: '3', product: 'vida', type: 'feature', title: 'smi 자막 파일 외에 확장 툴 지원 요청', content: 'smi 형식 외에 다른 확장자도 지원되면 좋겠습니다.', status: 'pending', reply: '', createdAt: new Date().toISOString() },
        { id: '2', product: 'cordiafe', type: 'bug', title: 'M3 칩 환경에서 패널 전환 시 간헐적 지연 발생', content: '탭을 여러 개 띄우고 전환할 때 약간 끊깁니다.', status: 'resolving', reply: '현재 문제를 재현하여 수정 중입니다. 다음 업데이트에 반영됩니다.', createdAt: new Date().toISOString() },
        { id: '1', product: 'quickfolder', type: 'general', title: '단축키 커스텀 설정은 어떻게 하나요?', content: '기본 단축키 대신 제가 원하는 키로 바꾸고 싶습니다.', status: 'done', reply: '환경설정 > 단축키 메뉴에서 언제든 원하시는 키 조합으로 변경 가능합니다.', createdAt: new Date().toISOString() }
      ];
      await FEEDBACK_KV.put('posts', JSON.stringify(posts));
    }
    return new Response(JSON.stringify(posts), {
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

    const { product, type, title, content } = body;
    if (!product || !type || !title || !content) {
      return new Response('Missing fields', { status: 400 });
    }

    let posts = [];
    const rawData = await FEEDBACK_KV.get('posts');
    if (rawData) posts = JSON.parse(rawData);

    // generate a simple sequential ID or timestamp
    const newId = (posts.length > 0 ? Math.max(...posts.map(p => parseInt(p.id) || 0)) + 1 : 1).toString();

    const newPost = {
      id: newId,
      product,
      type,
      title,
      content,
      status: 'pending',
      reply: '',
      createdAt: new Date().toISOString()
    };
    
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
    if (auth !== ADMIN_PASSWORD) {
      return new Response('Unauthorized', { status: 401 });
    }

    let posts = [];
    const rawData = await FEEDBACK_KV.get('posts');
    if (rawData) posts = JSON.parse(rawData);

    let body;
    try { body = await request.json(); } catch(e) { return new Response('Invalid Request', { status: 400 }); }

    const { id } = body;
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) return new Response('Not found', { status: 404 });

    if (request.method === 'DELETE') {
      posts.splice(postIndex, 1);
    } else if (request.method === 'PATCH') {
      const { status, reply } = body;
      if (status !== undefined) posts[postIndex].status = status;
      if (reply !== undefined) posts[postIndex].reply = reply;
    }

    await FEEDBACK_KV.put('posts', JSON.stringify(posts));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/feedback') {
      return handleFeedback(request, env);
    }
    return env.ASSETS.fetch(request);
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
        { id: '3', product: 'vida', type: 'feature', title: 'smi 자막 파일 외에 확장 툴 지원 요청', status: 'pending', createdAt: new Date().toISOString() },
        { id: '2', product: 'cordiafe', type: 'bug', title: 'M3 칩 환경에서 패널 전환 시 간헐적 지연 발생', status: 'resolving', createdAt: new Date().toISOString() },
        { id: '1', product: 'quickfolder', type: 'general', title: '단축키 커스텀 설정은 어떻게 하나요?', status: 'done', createdAt: new Date().toISOString() }
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

    const newPost = {
      id: Date.now().toString(),
      product,
      type,
      title,
      content,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    let posts = [];
    const rawData = await FEEDBACK_KV.get('posts');
    if (rawData) {
      posts = JSON.parse(rawData);
    } else {
      posts = [
        { id: '3', product: 'vida', type: 'feature', title: 'smi 자막 파일 외에 확장 툴 지원 요청', status: 'pending', createdAt: new Date().toISOString() },
        { id: '2', product: 'cordiafe', type: 'bug', title: 'M3 칩 환경에서 패널 전환 시 간헐적 지연 발생', status: 'resolving', createdAt: new Date().toISOString() },
        { id: '1', product: 'quickfolder', type: 'general', title: '단축키 커스텀 설정은 어떻게 하나요?', status: 'done', createdAt: new Date().toISOString() }
      ];
    }
    
    posts.unshift(newPost);
    if (posts.length > 50) posts = posts.slice(0, 50);

    await FEEDBACK_KV.put('posts', JSON.stringify(posts));

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}

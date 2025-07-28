// index.js（Cloudflare Workers 入口文件）
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. 处理静态资源（使用 Workers 静态资源绑定，不依赖 Deno）
      const staticFile = getStaticFilePath(path);
      if (staticFile) {
        // 通过 Workers 内置的 __STATIC_CONTENT 读取绑定的静态资源
        const fileContent = await env.__STATIC_CONTENT.get(staticFile.path);

        if (!fileContent) {
          return new Response(`静态资源 ${staticFile.path} 未找到`, {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          });
        }

        return new Response(fileContent, {
          headers: { 'Content-Type': staticFile.mimeType }
        });
      }

      // 2. 处理 API 请求（如果有）
      if (path.startsWith('/api')) {
        return handleApiRequest(request, env);
      }

      // 3. 未匹配的路径返回 404
      return new Response('请求的路径不存在', { status: 404 });

    } catch (error) {
      console.error('请求处理失败:', error);
      return new Response(`服务器错误: ${error.message}`, { status: 500 });
    }
  }
};

// 映射 URL 路径到静态资源文件及 MIME 类型
function getStaticFilePath(requestPath) {
  // 处理根路径（/ → index.html）
  if (requestPath === '/' || requestPath === '/index.html') {
    return {
      path: 'index.html',
      mimeType: 'text/html;charset=UTF-8'
    };
  }

  // 处理 CSS
  if (requestPath === '/style.css') {
    return {
      path: 'style.css',
      mimeType: 'text/css'
    };
  }

  // 处理 JS
  if (requestPath === '/app.js') {
    return {
      path: 'app.js',
      mimeType: 'application/javascript'
    };
  }

  // 其他静态资源（如图片，根据需要添加）
  if (requestPath.endsWith('.png')) {
    return {
      path: requestPath.slice(1), // 去掉开头的 '/'
      mimeType: 'image/png'
    };
  }

  // 非静态资源路径
  return null;
}

// 处理 API 请求（示例：食物相关接口）
async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 示例：获取食物列表
  if (path === '/api/foods' && request.method === 'GET') {
    const foods = await env.FOOD_WHEEL_STORAGE.get('foods') || '[]';
    return new Response(foods, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 其他 API 逻辑（添加/重置食物等）
  return new Response(JSON.stringify({ error: 'API 路径不存在' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

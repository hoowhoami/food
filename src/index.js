// worker.js（后端逻辑）
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 处理前端静态资源请求（HTML/CSS/JS）
    // 本地开发环境：Wrangler会自动处理public文件夹
    // 生产环境：通过wrangler.toml配置的静态资源绑定
    if (url.pathname === '/') {
      const html = await getStaticAsset('public/index.html', env);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    } else if (url.pathname === '/style.css') {
      const css = await getStaticAsset('public/style.css', env);
      return new Response(css, {
        headers: { 'Content-Type': 'text/css' }
      });
    } else if (url.pathname === '/app.js') {
      const js = await getStaticAsset('public/app.js', env);
      return new Response(js, {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }

    // 2. 处理 API 请求
    if (url.pathname.startsWith('/api')) {
      // 处理 /api/foods GET
      if (url.pathname === '/api/foods' && request.method === 'GET') {
        const foods = await getFoods(env);
        return new Response(JSON.stringify(foods), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 处理 /api/foods POST
      if (url.pathname === '/api/foods' && request.method === 'POST') {
        const body = await request.json();
        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
          return new Response(JSON.stringify({ error: '食物名称不能为空' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const newFood = await addFood(env, body.name.trim());
        return new Response(JSON.stringify(newFood), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 处理 /api/reset
      if (url.pathname === '/api/reset' && request.method === 'POST') {
        await resetFoods(env);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 无效API路由
      return new Response(JSON.stringify({
        error: 'API端点不存在',
        details: '请求的API路径不存在，请检查请求URL'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. 404处理
    return new Response('页面不存在', { status: 404 });
  }
};

// 静态资源处理（兼容本地开发和生产环境）
async function getStaticAsset(path, env) {
  // 生产环境：使用Cloudflare Workers的静态资源绑定
  if (env.__STATIC_CONTENT) {
    // 生产环境路径需要移除public前缀
    const productionPath = path.replace('public/', '');
    const content = await env.__STATIC_CONTENT.get(productionPath);
    if (content) return content;
  }

  // 本地开发环境：使用Wrangler的文件系统访问
  try {
    // 仅在本地开发时生效，Wrangler会处理此API
    return await Deno.readTextFile(path);
  } catch (e) {
    console.error(`读取静态资源失败: ${path}`, e);
    throw new Error(`静态资源不存在: ${path}`);
  }
}

// KV操作函数
async function getFoods(env) {
  try {
    if (!env.FOOD_WHEEL_STORAGE) {
      throw new Error("KV命名空间未绑定，请检查FOOD_WHEEL_STORAGE配置");
    }

    const data = await env.FOOD_WHEEL_STORAGE.get('foods');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("获取食物列表失败：", error.message);
    throw error;
  }
}

async function addFood(env, name) {
  try {
    if (!env.FOOD_WHEEL_STORAGE) {
      throw new Error("KV命名空间未绑定");
    }

    const foods = await getFoods(env);
    const newFood = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
      name: name,
      addedAt: Date.now()
    };

    foods.push(newFood);
    await env.FOOD_WHEEL_STORAGE.put('foods', JSON.stringify(foods));
    return newFood;
  } catch (error) {
    console.error("添加食物失败：", error.message);
    throw error;
  }
}

async function resetFoods(env) {
  try {
    if (!env.FOOD_WHEEL_STORAGE) {
      throw new Error("KV命名空间未绑定");
    }

    await env.FOOD_WHEEL_STORAGE.put('foods', JSON.stringify([]));
  } catch (error) {
    console.error("重置食物列表失败：", error.message);
    throw error;
  }
}

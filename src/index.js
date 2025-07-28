// 从KV获取食物列表
async function getFoods(env) {
  try {
    // 检查KV命名空间是否绑定
    if (!env || !env.FOOD_WHEEL_STORAGE) {
      throw new Error("KV命名空间未绑定，请检查FOOD_WHEEL_STORAGE是否正确绑定");
    }
    
    const data = await env.FOOD_WHEEL_STORAGE.get('foods');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("获取食物列表失败（KV操作）：", error.message);
    throw error; // 抛出错误让调用者处理
  }
}

// 添加食物到KV
async function addFood(env, name) {
  try {
    // 检查KV命名空间是否绑定
    if (!env || !env.FOOD_WHEEL_STORAGE) {
      throw new Error("KV命名空间未绑定");
    }
    
    const foods = await getFoods(env);
    const newFood = {
      id: crypto.randomUUID(),
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

// 重置食物列表
async function resetFoods(env) {
  try {
    // 检查KV命名空间是否绑定
    if (!env || !env.FOOD_WHEEL_STORAGE) {
      throw new Error("KV命名空间未绑定");
    }
    
    await env.FOOD_WHEEL_STORAGE.put('foods', JSON.stringify([]));
  } catch (error) {
    console.error("重置食物列表失败：", error.message);
    throw error;
  }
}

// 生成HTML页面
function generateHTML() {
  return '<!DOCTYPE html>\n' +
    '<html lang="zh-CN">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>今天吃什么</title>\n' +
    '  <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">\n' +
    '  <style>\n' +
    '    /* 基础样式 */\n' +
    '    body {\n' +
    '      background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);\n' +
    '      min-height: 100vh;\n' +
    '      font-family: Arial, sans-serif;\n' +
    '      color: #1F2937;\n' +
    '      margin: 0;\n' +
    '      padding: 0;\n' +
    '    }\n' +
    '    .container {\n' +
    '      max-width: 64rem;\n' +
    '      margin: 0 auto;\n' +
    '      padding: 2rem 1rem;\n' +
    '    }\n' +
    '    header {\n' +
    '      text-align: center;\n' +
    '      margin-bottom: 2rem;\n' +
    '    }\n' +
    '    h1 {\n' +
    '      font-size: clamp(2rem, 5vw, 3.5rem);\n' +
    '      font-weight: bold;\n' +
    '      background-clip: text;\n' +
    '      color: transparent;\n' +
    '      background-image: linear-gradient(to right, #3B82F6, #8B5CF6);\n' +
    '      margin-bottom: 0.5rem;\n' +
    '    }\n' +
    '    .subtitle {\n' +
    '      color: #6B7280;\n' +
    '      font-size: 1.125rem;\n' +
    '    }\n' +
    '    main {\n' +
    '      display: flex;\n' +
    '      flex-direction: column;\n' +
    '      gap: 2rem;\n' +
    '      align-items: center;\n' +
    '    }\n' +
    '    @media (min-width: 1024px) {\n' +
    '      main {\n' +
    '        flex-direction: row;\n' +
    '      }\n' +
    '    }\n' +
    '    .wheel-container {\n' +
    '      width: 100%;\n' +
    '      max-width: 50%;\n' +
    '      display: flex;\n' +
    '      flex-direction: column;\n' +
    '      align-items: center;\n' +
    '    }\n' +
    '    .wheel-wrapper {\n' +
    '      position: relative;\n' +
    '      width: min(300px, 80vw);\n' +
    '      height: min(300px, 80vw);\n' +
    '      margin-bottom: 1.5rem;\n' +
    '    }\n' +
    '    #wheel {\n' +
    '      width: 100%;\n' +
    '      height: 100%;\n' +
    '      border-radius: 50%;\n' +
    '      border: 8px solid white;\n' +
    '      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\n' +
    '      overflow: hidden;\n' +
    '      transition: transform 5000ms;\n' +
    '    }\n' +
    '    #wheel-inner {\n' +
    '      width: 100%;\n' +
    '      height: 100%;\n' +
    '      position: relative;\n' +
    '    }\n' +
    '    .wheel-center {\n' +
    '      position: absolute;\n' +
    '      top: 0;\n' +
    '      left: 0;\n' +
    '      right: 0;\n' +
    '      bottom: 0;\n' +
    '      display: flex;\n' +
    '      align-items: center;\n' +
    '      justify-content: center;\n' +
    '    }\n' +
    '    .wheel-center-inner {\n' +
    '      width: 4rem;\n' +
    '      height: 4rem;\n' +
    '      border-radius: 50%;\n' +
    '      background-color: white;\n' +
    '      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\n' +
    '      display: flex;\n' +
    '      align-items: center;\n' +
    '      justify-content: center;\n' +
    '      font-weight: bold;\n' +
    '      color: #3B82F6;\n' +
    '    }\n' +
    '    .wheel-pointer {\n' +
    '      position: absolute;\n' +
    '      top: 0;\n' +
    '      left: 50%;\n' +
    '      transform: translate(-50%, -33%);\n' +
    '      filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));\n' +
    '    }\n' +
    '    .pointer-shape {\n' +
    '      width: 1.5rem;\n' +
    '      height: 2.5rem;\n' +
    '      background-color: #EC4899;\n' +
    '      border-radius: 0 0 0.5rem 0.5rem;\n' +
    '    }\n' +
    '    .controls {\n' +
    '      display: flex;\n' +
    '      gap: 1rem;\n' +
    '    }\n' +
    '    .btn {\n' +
    '      font-weight: bold;\n' +
    '      padding: 0.75rem 1.5rem;\n' +
    '      border-radius: 9999px;\n' +
    '      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\n' +
    '      transition: all 300ms;\n' +
    '      display: flex;\n' +
    '      align-items: center;\n' +
    '      gap: 0.5rem;\n' +
    '      border: none;\n' +
    '      cursor: pointer;\n' +
    '    }\n' +
    '    .btn-primary {\n' +
    '      background-color: #3B82F6;\n' +
    '      color: white;\n' +
    '    }\n' +
    '    .btn-primary:disabled {\n' +
    '      opacity: 0.5;\n' +
    '      cursor: not-allowed;\n' +
    '    }\n' +
    '    .btn-reset {\n' +
    '      background-color: #4B5563;\n' +
    '      color: white;\n' +
    '    }\n' +
    '    .result {\n' +
    '      margin-top: 2rem;\n' +
    '      text-align: center;\n' +
    '      display: none;\n' +
    '    }\n' +
    '    .result h2 {\n' +
    '      font-size: 1.5rem;\n' +
    '      font-weight: bold;\n' +
    '      color: #8B5CF6;\n' +
    '      margin-bottom: 0.5rem;\n' +
    '    }\n' +
    '    .result-text {\n' +
    '      font-size: 1.25rem;\n' +
    '      font-weight: 500;\n' +
    '    }\n' +
    '    .food-manager {\n' +
    '      width: 100%;\n' +
    '      max-width: 50%;\n' +
    '      background-color: white;\n' +
    '      border-radius: 1rem;\n' +
    '      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);\n' +
    '      padding: 1.5rem;\n' +
    '    }\n' +
    '    .food-manager h2 {\n' +
    '      font-size: 1.5rem;\n' +
    '      font-weight: bold;\n' +
    '      margin-bottom: 1rem;\n' +
    '      display: flex;\n' +
    '      align-items: center;\n' +
    '      gap: 0.5rem;\n' +
    '    }\n' +
    '    .food-input-group {\n' +
    '      margin-bottom: 1.5rem;\n' +
    '      display: flex;\n' +
    '      gap: 0.5rem;\n' +
    '    }\n' +
    '    .food-input {\n' +
    '      flex: 1;\n' +
    '      padding: 0.5rem 1rem;\n' +
    '      border: 1px solid #D1D5DB;\n' +
    '      border-radius: 0.5rem;\n' +
    '      outline: none;\n' +
    '    }\n' +
    '    .btn-add {\n' +
    '      background-color: #EC4899;\n' +
    '      color: white;\n' +
    '      font-weight: bold;\n' +
    '      padding: 0.5rem 1.5rem;\n' +
    '      border-radius: 0.5rem;\n' +
    '      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\n' +
    '      transition: all 300ms;\n' +
    '      border: none;\n' +
    '      cursor: pointer;\n' +
    '    }\n' +
    '    .food-list {\n' +
    '      max-height: 300px;\n' +
    '      overflow-y: auto;\n' +
    '      padding-right: 0.5rem;\n' +
    '      gap: 0.5rem;\n' +
    '      display: flex;\n' +
    '      flex-direction: column;\n' +
    '    }\n' +
    '    .food-item {\n' +
    '      display: flex;\n' +
    '      justify-content: space-between;\n' +
    '      align-items: center;\n' +
    '      padding: 0.75rem;\n' +
    '      background-color: #f9fafb;\n' +
    '      border-radius: 0.5rem;\n' +
    '      transition: all 300ms;\n' +
    '    }\n' +
    '    .food-item:hover {\n' +
    '      background-color: rgba(59, 130, 246, 0.1);\n' +
    '      transform: scale(1.05);\n' +
    '    }\n' +
    '    .food-item span {\n' +
    '      display: flex;\n' +
    '      align-items: center;\n' +
    '      gap: 0.5rem;\n' +
    '    }\n' +
    '    .food-placeholder {\n' +
    '      color: #6B7280;\n' +
    '      text-align: center;\n' +
    '      padding: 2rem;\n' +
    '      border: 1px dashed #E5E7EB;\n' +
    '      border-radius: 0.5rem;\n' +
    '    }\n' +
    '    footer {\n' +
    '      margin-top: 4rem;\n' +
    '      text-align: center;\n' +
    '      color: #6B7280;\n' +
    '      font-size: 0.875rem;\n' +
    '    }\n' +
    '    /* 转盘动画 */\n' +
    '    @keyframes spin {\n' +
    '      0% { transform: rotate(0deg); }\n' +
    '      100% { transform: rotate(var(--final-rotation)); }\n' +
    '    }\n' +
    '    .wheel-spin {\n' +
    '      animation: spin 5s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards;\n' +
    '    }\n' +
    '    /* 错误提示样式 */\n' +
    '    .error-message {\n' +
    '      color: #dc2626;\n' +
    '      padding: 1rem;\n' +
    '      border: 1px solid #fecaca;\n' +
    '      background: #fee2e2;\n' +
    '      border-radius: 0.5rem;\n' +
    '      margin-bottom: 1rem;\n' +
    '      display: none;\n' +
    '    }\n' +
    '    .error-message strong {\n' +
    '      display: block;\n' +
    '      margin-bottom: 0.5rem;\n' +
    '    }\n' +
    '    .error-message ul {\n' +
    '      margin: 0.5rem 0 0 0;\n' +
    '      padding-left: 1.5rem;\n' +
    '    }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <div class="container">\n' +
    '    <!-- 错误提示区域 -->\n' +
    '    <div id="error-container" class="error-message"></div>\n' +
    '    \n' +
    '    <!-- 标题区域 -->\n' +
    '    <header>\n' +
    '      <h1>今天吃什么</h1>\n' +
    '      <p class="subtitle">让转盘决定你的用餐选择</p>\n' +
    '    </header>\n' +
    '    <!-- 主要内容区 -->\n' +
    '    <main>\n' +
    '      <!-- 转盘区域 -->\n' +
    '      <div class="wheel-container">\n' +
    '        <div class="wheel-wrapper">\n' +
    '          <!-- 转盘 -->\n' +
    '          <div id="wheel">\n' +
    '            <div id="wheel-inner">\n' +
    '              <!-- 转盘分区将通过JS动态生成 -->\n' +
    '              <div class="wheel-center">\n' +
    '                <div class="wheel-center-inner">转</div>\n' +
    '              </div>\n' +
    '            </div>\n' +
    '          </div>\n' +
    '          <!-- 指针 -->\n' +
    '          <div class="wheel-pointer">\n' +
    '            <div class="pointer-shape"></div>\n' +
    '          </div>\n' +
    '        </div>\n' +
    '        <!-- 转盘控制按钮 -->\n' +
    '        <div class="controls">\n' +
    '          <button id="spin-btn" class="btn btn-primary" disabled>\n' +
    '            <i class="fa fa-refresh"></i> 开始转盘\n' +
    '          </button>\n' +
    '          <button id="reset-btn" class="btn btn-reset">\n' +
    '            <i class="fa fa-trash"></i> 重置\n' +
    '          </button>\n' +
    '        </div>\n' +
    '        <!-- 结果显示 -->\n' +
    '        <div id="result" class="result">\n' +
    '          <h2>结果</h2>\n' +
    '          <p id="result-text" class="result-text"></p>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <!-- 食物管理区域 -->\n' +
    '      <div class="food-manager">\n' +
    '        <h2>\n' +
    '          <i class="fa fa-cutlery" style="color: #3B82F6;"></i> 食物列表\n' +
    '        </h2>\n' +
    '        <!-- 添加食物表单 -->\n' +
    '        <div class="food-input-group">\n' +
    '          <input \n' +
    '            type="text" \n' +
    '            id="food-input" \n' +
    '            placeholder="输入食物名称..." \n' +
    '            class="food-input"\n' +
    '          >\n' +
    '          <button id="add-food-btn" class="btn-add">\n' +
    '            添加\n' +
    '          </button>\n' +
    '        </div>\n' +
    '        <!-- 食物列表 -->\n' +
    '        <div>\n' +
    '          <div id="food-list" class="food-list">\n' +
    '            <!-- 食物项将通过JS动态生成 -->\n' +
    '            <div class="food-placeholder">\n' +
    '              还没有添加食物，快添加一些吧！\n' +
    '            </div>\n' +
    '          </div>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </main>\n' +
    '    <!-- 页脚 -->\n' +
    '    <footer>\n' +
    '      <p>使用 Cloudflare Workers 构建 | 数据将被所有用户共享</p>\n' +
    '    </footer>\n' +
    '  </div>\n' +
    '  <script>\n' +
    '    // 全局状态\n' +
    '    var foods = [];\n' +
    '    var isSpinning = false;\n' +
    '    \n' +
    '    // DOM元素\n' +
    '    var wheelElement = document.getElementById(\'wheel\');\n' +
    '    var wheelInnerElement = document.getElementById(\'wheel-inner\');\n' +
    '    var spinButton = document.getElementById(\'spin-btn\');\n' +
    '    var resetButton = document.getElementById(\'reset-btn\');\n' +
    '    var addFoodButton = document.getElementById(\'add-food-btn\');\n' +
    '    var foodInput = document.getElementById(\'food-input\');\n' +
    '    var foodListElement = document.getElementById(\'food-list\');\n' +
    '    var resultElement = document.getElementById(\'result\');\n' +
    '    var resultTextElement = document.getElementById(\'result-text\');\n' +
    '    var errorContainer = document.getElementById(\'error-container\');\n' +
    '    \n' +
    '    // 初始化\n' +
    '    function init() {\n' +
    '      loadFoods().then(function() {\n' +
    '        renderWheel();\n' +
    '        renderFoodList();\n' +
    '      });\n' +
    '      \n' +
    '      // 事件监听\n' +
    '      spinButton.addEventListener(\'click\', spinWheel);\n' +
    '      resetButton.addEventListener(\'click\', resetWheel);\n' +
    '      addFoodButton.addEventListener(\'click\', addFood);\n' +
    '      foodInput.addEventListener(\'keypress\', function(e) {\n' +
    '        if (e.key === \'Enter\') addFood();\n' +
    '      });\n' +
    '    }\n' +
    '    \n' +
    '    // 从API加载食物列表\n' +
    '    function loadFoods() {\n' +
    '      return fetch(\'/api/foods\')\n' +
    '        .then(function(response) {\n' +
    '          if (!response.ok) {\n' +
    '            return response.json().then(function(data) {\n' +
    '              throw new Error(data.details || \'请求失败，状态码：\' + response.status);\n' +
    '            }).catch(function() {\n' +
    '              throw new Error(\'请求失败，状态码：\' + response.status);\n' +
    '            });\n' +
    '          }\n' +
    '          return response.json();\n' +
    '        })\n' +
    '        .then(function(data) {\n' +
    '          foods = data;\n' +
    '          errorContainer.style.display = \'none\'; // 隐藏错误提示\n' +
    '        })\n' +
    '        .catch(function(error) {\n' +
    '          console.error(\'加载食物失败:\', error);\n' +
    '          // 显示具体错误原因\n' +
    '          errorContainer.innerHTML = \'<strong>加载食物列表失败：\' + error.message + \'</strong>\' +\n' +
    '            \'<p>请尝试以下解决方案：</p>\' +\n' +
    '            \'<ul>\' +\n' +
    '            \'  <li>检查KV命名空间是否已正确绑定为FOOD_WHEEL_STORAGE</li>\' +\n' +
    '            \'  <li>确认网络连接正常</li>\' +\n' +
    '            \'  <li>刷新页面重试</li>\' +\n' +
    '            \'</ul>\';\n' +
    '          errorContainer.style.display = \'block\';\n' +
    '          throw error;\n' +
    '        });\n' +
    '    }\n' +
    '    \n' +
    '    // 渲染转盘\n' +
    '    function renderWheel() {\n' +
    '      // 清空现有分区\n' +
    '      while (wheelInnerElement.children.length > 1) {\n' +
    '        wheelInnerElement.removeChild(wheelInnerElement.lastChild);\n' +
    '      }\n' +
    '      \n' +
    '      if (foods.length === 0) {\n' +
    '        // 显示默认提示\n' +
    '        var defaultSection = document.createElement(\'div\');\n' +
    '        defaultSection.style.position = \'absolute\';\n' +
    '        defaultSection.style.top = \'0\';\n' +
    '        defaultSection.style.left = \'0\';\n' +
    '        defaultSection.style.right = \'0\';\n' +
    '        defaultSection.style.bottom = \'0\';\n' +
    '        defaultSection.style.backgroundColor = \'#f3f4f6\';\n' +
    '        defaultSection.style.display = \'flex\';\n' +
    '        defaultSection.style.alignItems = \'center\';\n' +
    '        defaultSection.style.justifyContent = \'center\';\n' +
    '        defaultSection.innerHTML = \'<p style="color: #6B7280; text-align: center; padding: 1rem;">请先添加食物</p>\';\n' +
    '        wheelInnerElement.appendChild(defaultSection);\n' +
    '        spinButton.disabled = true;\n' +
    '        return;\n' +
    '      }\n' +
    '      \n' +
    '      spinButton.disabled = false;\n' +
    '      \n' +
    '      // 定义颜色方案\n' +
    '      var colors = [\n' +
    '        \'#3B82F6\', \'#EC4899\', \'#8B5CF6\', \'#10B981\', \'#F59E0B\',\n' +
    '        \'#EF4444\', \'#6366F1\', \'#14B8A6\', \'#F97316\', \'#84CC16\'\n' +
    '      ];\n' +
    '      \n' +
    '      var sliceAngle = 360 / foods.length;\n' +
    '      \n' +
    '      // 创建每个分区\n' +
    '      for (var i = 0; i < foods.length; i++) {\n' +
    '        var food = foods[i];\n' +
    '        var slice = document.createElement(\'div\');\n' +
    '        slice.style.position = \'absolute\';\n' +
    '        slice.style.top = \'0\';\n' +
    '        slice.style.left = \'0\';\n' +
    '        slice.style.right = \'0\';\n' +
    '        slice.style.bottom = \'0\';\n' +
    '        slice.style.overflow = \'hidden\';\n' +
    '        slice.style.transform = \'rotate(\' + (i * sliceAngle) + \'deg)\';\n' +
    '        \n' +
    '        var sliceContent = document.createElement(\'div\');\n' +
    '        sliceContent.style.position = \'absolute\';\n' +
    '        sliceContent.style.width = \'100%\';\n' +
    '        sliceContent.style.height = \'100%\';\n' +
    '        sliceContent.style.display = \'flex\';\n' +
    '        sliceContent.style.alignItems = \'center\';\n' +
    '        sliceContent.style.justifyContent = \'center\';\n' +
    '        sliceContent.style.backgroundColor = colors[i % colors.length];\n' +
    '        sliceContent.style.transform = \'rotate(\' + (sliceAngle / 2) + \'deg) translateX(50%)\';\n' +
    '        sliceContent.style.transformOrigin = \'0 50%\';\n' +
    '        \n' +
    '        var textContainer = document.createElement(\'div\');\n' +
    '        textContainer.style.color = \'white\';\n' +
    '        textContainer.style.fontWeight = \'500\';\n' +
    '        textContainer.style.fontSize = \'0.875rem\';\n' +
    '        textContainer.style.whiteSpace = \'nowrap\';\n' +
    '        textContainer.style.transform = \'rotate(90deg)\';\n' +
    '        textContainer.style.marginLeft = \'50%\';\n' +
    '        textContainer.textContent = food.name;\n' +
    '        \n' +
    '        sliceContent.appendChild(textContainer);\n' +
    '        slice.appendChild(sliceContent);\n' +
    '        wheelInnerElement.appendChild(slice);\n' +
    '      }\n' +
    '    }\n' +
    '    \n' +
    '    // 渲染食物列表\n' +
    '    function renderFoodList() {\n' +
    '      foodListElement.innerHTML = \'\';\n' +
    '      \n' +
    '      if (foods.length === 0) {\n' +
    '        foodListElement.innerHTML = \'<div class="food-placeholder">\' +\n' +
    '          \' 还没有添加食物，快添加一些吧！\' +\n' +
    '          \'</div>\';\n' +
    '        return;\n' +
    '      }\n' +
    '      \n' +
    '      for (var i = 0; i < foods.length; i++) {\n' +
    '        var food = foods[i];\n' +
    '        var foodItem = document.createElement(\'div\');\n' +
    '        foodItem.className = \'food-item\';\n' +
    '        foodItem.innerHTML = \'<span>\' +\n' +
    '          \'  <i class="fa fa-circle" style="font-size: 0.75rem; color: #3B82F6;"></i>\' +\n' +
    '          \'  \' + food.name + \'\'+ \n' +
    '          \'</span>\';\n' +
    '        foodListElement.appendChild(foodItem);\n' +
    '      }\n' +
    '    }\n' +
    '    \n' +
    '    // 旋转转盘\n' +
    '    function spinWheel() {\n' +
    '      if (isSpinning || foods.length < 2) return;\n' +
    '      \n' +
    '      isSpinning = true;\n' +
    '      spinButton.disabled = true;\n' +
    '      resultElement.style.display = \'none\';\n' +
    '      \n' +
    '      // 随机旋转角度 (5圈 + 随机角度)\n' +
    '      var randomRotation = Math.floor(Math.random() * 360);\n' +
    '      var totalRotation = 360 * 5 + randomRotation;\n' +
    '      \n' +
    '      // 设置最终旋转角度\n' +
    '      wheelElement.style.setProperty(\'--final-rotation\', totalRotation + \'deg\');\n' +
    '      wheelElement.classList.add(\'wheel-spin\');\n' +
    '      \n' +
    '      // 计算结果索引\n' +
    '      var sliceAngle = 360 / foods.length;\n' +
    '      var normalizedRotation = totalRotation % 360;\n' +
    '      var adjustedRotation = (360 - normalizedRotation) % 360;\n' +
    '      var resultIndex = Math.floor(adjustedRotation / sliceAngle) % foods.length;\n' +
    '      \n' +
    '      // 等待动画结束\n' +
    '      setTimeout(function() {\n' +
    '        // 显示结果\n' +
    '        resultTextElement.textContent = foods[resultIndex].name;\n' +
    '        resultElement.style.display = \'block\';\n' +
    '        \n' +
    '        // 重置状态\n' +
    '        wheelElement.classList.remove(\'wheel-spin\');\n' +
    '        isSpinning = false;\n' +
    '        spinButton.disabled = false;\n' +
    '      }, 5000);\n' +
    '    }\n' +
    '    \n' +
    '    // 添加食物\n' +
    '    function addFood() {\n' +
    '      var foodName = foodInput.value.trim();\n' +
    '      if (!foodName) {\n' +
    '        alert(\'请输入食物名称\');\n' +
    '        return;\n' +
    '      }\n' +
    '      \n' +
    '      fetch(\'/api/foods\', {\n' +
    '        method: \'POST\',\n' +
    '        headers: { \'Content-Type\': \'application/json\' },\n' +
    '        body: JSON.stringify({ name: foodName })\n' +
    '      })\n' +
    '      .then(function(response) {\n' +
    '        if (!response.ok) {\n' +
    '          return response.json().then(function(error) {\n' +
    '            throw new Error(error.error || \'添加失败\');\n' +
    '          });\n' +
    '        }\n' +
    '        return response.json();\n' +
    '      })\n' +
    '      .then(function() {\n' +
    '        // 重新加载食物列表并更新UI\n' +
    '        return loadFoods();\n' +
    '      })\n' +
    '      .then(function() {\n' +
    '        renderWheel();\n' +
    '        renderFoodList();\n' +
    '        // 清空输入框\n' +
    '        foodInput.value = \'\';\n' +
    '      })\n' +
    '      .catch(function(error) {\n' +
    '        console.error(\'添加食物失败:\', error);\n' +
    '        alert(error.message || \'添加食物失败，请重试\');\n' +
    '      });\n' +
    '    }\n' +
    '    \n' +
    '    // 重置转盘\n' +
    '    function resetWheel() {\n' +
    '      if (isSpinning) return;\n' +
    '      \n' +
    '      if (confirm(\'确定要清空所有食物吗？此操作不可恢复。\')) {\n' +
    '        fetch(\'/api/reset\', { method: \'POST\' })\n' +
    '        .then(function() {\n' +
    '          return loadFoods();\n' +
    '        })\n' +
    '        .then(function() {\n' +
    '          renderWheel();\n' +
    '          renderFoodList();\n' +
    '          resultElement.style.display = \'none\';\n' +
    '        })\n' +
    '        .catch(function(error) {\n' +
    '          console.error(\'重置失败:\', error);\n' +
    '          alert(\'重置失败，请重试\');\n' +
    '        });\n' +
    '      }\n' +
    '    }\n' +
    '    \n' +
    '    // 初始化应用\n' +
    '    document.addEventListener(\'DOMContentLoaded\', init);\n' +
    '  </script>\n' +
    '</body>\n' +
    '</html>';
}

// 处理请求
addEventListener('fetch', function(event) {
  event.respondWith(handleRequest(event.request, event.env));
});

async function handleRequest(request, env) {
  const url = new URL(request.url);
  
  // API路由处理
  if (url.pathname.startsWith('/api')) {
    try {
      // 获取所有食物
      if (url.pathname === '/api/foods' && request.method === 'GET') {
        const foods = await getFoods(env);
        return new Response(JSON.stringify(foods), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 添加食物
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
      
      // 重置转盘（清空食物）
      if (url.pathname === '/api/reset' && request.method === 'POST') {
        await resetFoods(env);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 无效的API路由
      return new Response(JSON.stringify({ 
        error: 'API端点不存在',
        details: '请求的API路径不存在，请检查请求URL'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      // API请求内部错误（如KV未绑定）
      return new Response(JSON.stringify({ 
        error: '服务器内部错误',
        details: error.message // 返回具体错误原因
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // 提供主页面
  return new Response(generateHTML(), {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
  });
}

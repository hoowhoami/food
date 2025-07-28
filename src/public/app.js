// 全局状态
let foods = [];
let isSpinning = false;
let canvas, ctx;
let currentRotation = 0;
let targetRotation = 0;
let animationFrameId = null;
// 新增：控制动画速度的参数
const animationDuration = 5000; // 总旋转时间（毫秒
let startTime = 0;

// DOM元素
const spinButton = document.getElementById('spin-btn');
const resetButton = document.getElementById('reset-btn');
const addFoodButton = document.getElementById('add-food-btn');
const foodInput = document.getElementById('food-input');
const foodListElement = document.getElementById('food-list');
const resultElement = document.getElementById('result');
const resultTextElement = document.getElementById('result-text');
const errorContainer = document.getElementById('error-container');

// 初始化应用
document.addEventListener('DOMContentLoaded', init);

// 初始化函数
function init() {
    // 初始化Canvas
    canvas = document.getElementById('wheel');
    ctx = canvas.getContext('2d');

    // 检查Canvas是否存在
    if (!canvas || !ctx) {
        showError('无法初始化转盘，请确保页面中存在id为"wheel"的canvas元素');
        return;
    }

    // 调整Canvas大小以适应容器
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 加载食物列表
    loadFoods().then(() => {
		drawWheel();
        renderFoodList();
    });

    // 事件监听
    spinButton.addEventListener('click', spinWheel);
    resetButton.addEventListener('click', resetWheel);
    addFoodButton.addEventListener('click', addFood);
    foodInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addFood();
    });
}

// 调整Canvas大小
function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, 500);
    canvas.width = size;
    canvas.height = size;
    drawWheel(); // 重新绘制转盘
}

// 显示错误信息
function showError(message) {
    errorContainer.innerHTML = `<strong>错误：${message}</strong>`;
    errorContainer.style.display = 'block';
    console.error(message);
}

// 从API加载食物列表
function loadFoods() {
    return fetch('/api/foods')
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.details || `请求失败，状态码：${response.status}`);
                }).catch(() => {
                    throw new Error(`请求失败，状态码：${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            foods = data;
            errorContainer.style.display = 'none';
        })
        .catch(error => {
            console.error('加载食物失败:', error);
            errorContainer.innerHTML = `<strong>加载食物列表失败：${error.message}</strong>` +
                '<p>请尝试以下解决方案：</p>' +
                '<ul>' +
                '  <li>检查KV命名空间是否已正确绑定为FOOD_WHEEL_STORAGE</li>' +
                '  <li>确认网络连接正常</li>' +
                '  <li>刷新页面重试</li>' +
                '</ul>';
            errorContainer.style.display = 'block';
            throw error;
        });
}

// 绘制转盘
function drawWheel() {
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.95; // 留一点边距

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    if (foods.length === 0) {
        // 没有食物时显示提示
        ctx.fillStyle = '#f3f4f6';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6B7280';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // ctx.fillText('请先添加食物', centerX, centerY);
        return;
    }

    // 定义颜色方案
    const colors = [
        '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B',
        '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
    ];

    const sliceAngle = (Math.PI * 2) / foods.length; // 弧度制

    // 应用当前旋转
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    // 绘制每个扇形
    for (let i = 0; i < foods.length; i++) {
        const angle = i * sliceAngle;
        const color = colors[i % colors.length];

        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // 绘制分隔线
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制文字
        const textAngle = angle + sliceAngle / 2; // 文字居中角度
        const textRadius = radius * 0.7; // 文字距离中心的距离

        // 根据食物数量计算字体大小
        const baseFontSize = Math.max(12, 24 - foods.length);
        ctx.font = `${baseFontSize}px sans-serif`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 保存当前状态
        ctx.save();

        // 将坐标系旋转到文字角度
        ctx.rotate(textAngle);

        // 处理长文本
        let foodName = foods[i].name;
        const maxTextWidth = radius * 0.5; // 最大文本宽度
        const textMetrics = ctx.measureText(foodName);

        // 如果文本太长，截断并添加省略号
        if (textMetrics.width > maxTextWidth) {
            let truncated = foodName;
            while (ctx.measureText(truncated + '...').width > maxTextWidth && truncated.length > 0) {
                truncated = truncated.slice(0, -1);
            }
            foodName = truncated + '...';
        }

        // 绘制文字（沿径向偏移）
        ctx.fillText(foodName, textRadius, 0);

        // 恢复状态
        ctx.restore();
    }

    // 恢复状态
    ctx.restore();

    // 绘制指针
    drawPointer(centerX, centerY);
}

// 绘制指针
function drawPointer(centerX, centerY) {
    const pointerSize = 15;

    ctx.save();
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - centerY * 0.9); // 指针顶部（接近转盘边缘）
    ctx.lineTo(centerX - pointerSize, centerY - centerY * 0.8);
    ctx.lineTo(centerX + pointerSize, centerY - centerY * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// 渲染食物列表
function renderFoodList() {
    foodListElement.innerHTML = '';

    if (foods.length === 0) {
        foodListElement.innerHTML = '<div class="food-placeholder">' +
            ' 还没有添加食物，快添加一些吧！' +
            '</div>';
        return;
    }

    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        foodItem.innerHTML = `<span>` +
            `  <i class="fa fa-circle" style="font-size: 0.75rem; color: #3B82F6;"></i>` +
            `  ${food.name}` +
            `</span>`;
        foodListElement.appendChild(foodItem);
    }
}

// 缓动函数 - 实现先加速后减速的自然效果
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// 旋转转盘动画（使用时间控制，确保总时长一致）
function animateRotation() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / animationDuration, 1);

    // 使用缓动函数计算进度，实现自然减速
    const easedProgress = easeOutCubic(progress);

    // 根据进度计算当前旋转角度
    currentRotation = currentRotationStart + (targetRotation - currentRotationStart) * easedProgress;
    drawWheel();

    // 检查动画是否结束
    if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateRotation);
    } else {
        // 动画结束，固定最终角度
        currentRotation = targetRotation;
        drawWheel();

        // 计算结果
        setTimeout(() => {
            finishSpin();
        }, 100);
    }
}

// 旋转转盘
function spinWheel() {
    if (isSpinning || foods.length < 1) return;

    isSpinning = true;
    spinButton.disabled = true;
    resultElement.style.display = 'none';

    // 增加旋转圈数（10-15圈）- 比原来多转一倍以上
    const fullRotations = 10 + Math.random() * 5;
    const randomAngle = Math.random() * Math.PI * 2;

    // 记录起始旋转角度，用于动画计算
    currentRotationStart = currentRotation;
    // 计算目标旋转角度
    targetRotation = currentRotation + fullRotations * Math.PI * 2 + randomAngle;

    // 记录动画开始时间
    startTime = Date.now();

    // 开始动画
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animateRotation();
}

// 完成旋转，显示结果
function finishSpin() {
    if (foods.length === 0) return;

    // 计算最终角度（标准化到0-2π）
    let finalAngle = currentRotation % (Math.PI * 2);
    if (finalAngle < 0) {
        finalAngle += Math.PI * 2;
    }

    // 计算指针指向的扇区（指针在顶部，对应角度3π/2）
    const pointerAngle = (3 * Math.PI / 2) - finalAngle;
    const normalizedAngle = (pointerAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

    // 计算结果索引
    const sliceAngle = (Math.PI * 2) / foods.length;
    let resultIndex = Math.floor(normalizedAngle / sliceAngle);
    resultIndex = resultIndex % foods.length;

    // 显示结果
    resultTextElement.textContent = foods[resultIndex].name;
    resultElement.style.display = 'block';

    // 重置状态
    isSpinning = false;
    spinButton.disabled = false;
}

// 添加食物
function addFood() {
    const foodName = foodInput.value.trim();
    if (!foodName) {
        alert('请输入食物名称');
        return;
    }

    fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: foodName })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.error || '添加失败');
            });
        }
        return response.json();
    })
    .then(() => {
        // 重新加载食物列表并更新UI
        return loadFoods();
    })
    .then(() => {
        drawWheel();
        renderFoodList();
        // 清空输入框
        foodInput.value = '';
    })
    .catch(error => {
        console.error('添加食物失败:', error);
        alert(error.message || '添加食物失败，请重试');
    });
}

// 重置转盘
function resetWheel() {
    if (isSpinning) return;

    if (confirm('确定要清空所有食物吗？此操作不可恢复。')) {
        fetch('/api/reset', { method: 'POST' })
        .then(() => {
            return loadFoods();
        })
        .then(() => {
            drawWheel();
            renderFoodList();
            resultElement.style.display = 'none';
        })
        .catch(error => {
            console.error('重置失败:', error);
            alert('重置失败，请重试');
        });
    }
}

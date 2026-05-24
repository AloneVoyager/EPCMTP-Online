// DOM 元素
const inputText = document.getElementById('inputText');
const processBtn = document.getElementById('processBtn');
const resultCard = document.getElementById('resultCard');
const outputContent = document.getElementById('outputContent');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const errorCard = document.getElementById('errorCard');
const errorMessage = document.getElementById('errorMessage');
const dismissError = document.getElementById('dismissError');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    processBtn.addEventListener('click', handleProcess);
    copyBtn.addEventListener('click', handleCopy);
    clearBtn.addEventListener('click', handleClear);
    dismissError.addEventListener('click', hideError);
    
    // 支持 Ctrl+Enter 快捷键
    inputText.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleProcess();
        }
    });
}

// 处理文本
function handleProcess() {
    const text = inputText.value.trim();
    
    if (!text) {
        showError('请输入要处理的文本');
        return;
    }
    
    try {
        // 提取地图名
        const mapName = extractMapName(text);
        
        // 提取地图码
        const mapCode = extractMapCode(text);
        
        // 生成输出内容
        const output = generateOutput(mapName, mapCode);
        
        // 显示结果
        showResult(output);
        
    } catch (error) {
        showError(error.message);
        logError(error);
    }
}

// 提取地图名
function extractMapName(text) {
    const match = text.match(/《([^》]+)》/);
    
    if (match && match[1]) {
        return match[1].trim();
    }
    
    throw new Error('未找到地图名（未匹配到《地图名》）');
}

// 提取地图码
function extractMapCode(text) {
    // 尝试匹配 "地图码1234-5678" 或 "地图码12345678"
    let match = text.match(/地图码(\d+[-]?\d+)/);
    
    if (match && match[1]) {
        return match[1].trim();
    }
    
    // 尝试更宽松的匹配：连续数字或数字+横杠+数字
    match = text.match(/(\d{4,}-\d+)/);
    
    if (match && match[1]) {
        return match[1];
    }
    
    throw new Error('未找到地图码');
}

// 生成输出内容
function generateOutput(mapName, mapCode) {
    return `【蛋仔派对】地图《${mapName}》试玩

相关游戏：蛋仔派对
地图名：${mapName}
地图码：${mapCode}
(EggyPartyCopyMapTextProcessor Generate)`;
}

// 显示结果
function showResult(content) {
    hideError();
    outputContent.textContent = content;
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 显示错误
function showError(message) {
    resultCard.style.display = 'none';
    errorMessage.textContent = message;
    errorCard.style.display = 'block';
    errorCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 隐藏错误
function hideError() {
    errorCard.style.display = 'none';
}

// 处理复制
async function handleCopy() {
    const textToCopy = outputContent.textContent;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        
        // 视觉反馈
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        copyBtn.classList.add('secondary');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('secondary');
        }, 2000);
        
    } catch (err) {
        console.error('复制失败:', err);
        // 降级方案
        fallbackCopy(textToCopy);
    }
}

// 降级复制方案
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert('内容已复制到剪贴板');
    } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动选择并复制文本');
    }
    
    document.body.removeChild(textarea);
}

// 处理清空
function handleClear() {
    inputText.value = '';
    resultCard.style.display = 'none';
    hideError();
    inputText.focus();
}

// 记录错误日志
function logError(error) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${error.name}: ${error.message}\n`;
    
    // 在实际项目中，这里可以发送到服务器
    console.error('Error logged:', logEntry);
    
    // 保存到本地存储（可选）
    try {
        const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        logs.push({
            timestamp,
            message: error.message,
            stack: error.stack
        });
        
        // 只保留最近50条日志
        if (logs.length > 50) {
            logs.splice(0, logs.length - 50);
        }
        
        localStorage.setItem('errorLogs', JSON.stringify(logs));
    } catch (e) {
        console.error('无法保存错误日志:', e);
    }
}

// 添加示例文本到输入框（方便测试）
function loadExample() {
    inputText.value = '复制打开【蛋仔派对】，游玩地图《梦幻游乐园》，地图码5821-3497。';
}

// 暴露给全局（用于调试）
window.EggyPartyProcessor = {
    extractMapName,
    extractMapCode,
    generateOutput,
    loadExample
};
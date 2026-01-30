// AI服务 - 智谱AI API集成
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export interface AISettings {
  enabled: boolean;
  apiKey: string;
  model: string;
}

export interface AIParseResult {
  title: string;
  priority: 'high' | 'medium' | 'low';
}

// 从localStorage获取设置
export function getAISettings(): AISettings {
  const saved = localStorage.getItem('ai-settings');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    enabled: false,
    apiKey: '',
    model: 'glm-4-flash'
  };
}

// 保存设置到localStorage
export function saveAISettings(settings: AISettings) {
  localStorage.setItem('ai-settings', JSON.stringify(settings));
}

// 测试API连接
export async function testAIConnection(settings: AISettings): Promise<boolean> {
  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'user', content: '你好' }
        ],
        max_tokens: 10
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}

// AI解析待办事项
export async function parseTodoWithAI(
  input: string,
  settings: AISettings
): Promise<AIParseResult> {
  if (!settings.enabled || !settings.apiKey) {
    throw new Error('AI功能未启用或未配置API密钥');
  }

  const prompt = `请将以下待办事项描述压缩成简洁明了的一句话标题

规则：
1. 标题应该简洁，不超过20个字
2. 保留关键信息（时间、人物、事件）
3. 去掉冗余描述

待办事项描述：
${input}

请按以下格式返回：
标题: <压缩后的标题>`;

  const response = await fetch(ZHIPU_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: 'system', content: '你是一个待办事项助手，擅长将长文本压缩成简洁的待办标题。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 100
    })
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // 解析返回结果
  const titleMatch = content.match(/标题:\s*(.+)/);
  const priorityMatch = content.match(/优先级:\s*(高|中|低)/);

  const title = titleMatch ? titleMatch[1].trim() : input.slice(0, 20);
  const priorityMap: Record<string, 'high' | 'medium' | 'low'> = {
    '高': 'high',
    '中': 'medium',
    '低': 'low'
  };
  const priority = priorityMatch ? priorityMap[priorityMatch[1]] : 'medium';

  return { title, priority };
}

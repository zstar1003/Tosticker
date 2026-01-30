const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const SETTINGS_KEY = 'mindflow-ai-settings';

export interface AISettings {
  apiKey: string;
}

export interface AIParseResult {
  title: string;
  priority: 'high' | 'medium' | 'low';
}

export function getAISettings(): AISettings {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    apiKey: ''
  };
}

export function saveAISettings(settings: AISettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function testAIConnection(settings: AISettings): Promise<boolean> {
  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
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

export async function parseTodoWithAI(
  input: string,
  settings: AISettings
): Promise<AIParseResult> {
  if (!settings.apiKey) {
    throw new Error('AI功能未配置API密钥');
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
      model: 'glm-4-flash',
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

  const titleMatch = content.match(/标题:\s*(.+)/);

  const title = titleMatch ? titleMatch[1].trim() : input.slice(0, 20);

  return { title, priority: 'medium' };
}

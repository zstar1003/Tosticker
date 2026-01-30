import { useState, useEffect } from 'react';
import { X, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';

interface AISettings {
  apiKey: string;
}

const DEFAULT_SETTINGS: AISettings = {
  apiKey: '',
};

const SETTINGS_KEY = 'tosticker-ai-settings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function useSettings() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
      setIsLoaded(true);
    };
    loadSettings();
  }, []);

  const saveSettings = (newSettings: AISettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateSettings = (partial: Partial<AISettings>) => {
    saveSettings({
      ...settings,
      ...partial,
    });
  };

  return {
    settings,
    isLoaded,
    saveSettings,
    updateSettings,
  };
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleTestConnection = async () => {
    if (!settings.apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('请先输入 API Key');
      return;
    }

    setTestStatus('testing');
    setTestMessage('');

    try {
      // 调用智谱AI API测试
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [{ role: 'user', content: '你好' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('连接成功！AI 功能已就绪');
      } else {
        setTestStatus('error');
        setTestMessage('连接失败，请检查 API Key 是否正确');
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage('测试过程中发生错误');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-left">
            <Sparkles size={18} />
            <span>智谱 AI 设置</span>
          </div>
          <button className="settings-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          <div className="settings-section">
            {/* API Key Input */}
            <div className="settings-field">
              <label className="settings-label">API Key</label>
              <span className="settings-description">从智谱 AI 控制台获取</span>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                placeholder="请输入您的智谱 AI API Key"
                className="settings-input"
              />
            </div>

            {/* Test Connection */}
            <div className="settings-field">
              <label className="settings-label">连接测试</label>
              <div className="test-connection-row">
                <button
                  className="btn-test-connection"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                >
                  {testStatus === 'testing' ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      测试中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      测试连接
                    </>
                  )}
                </button>
                {testStatus !== 'idle' && testStatus !== 'testing' && (
                  <div className={`test-status ${testStatus}`}>
                    {testStatus === 'success' ? (
                      <Check size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    <span>{testMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Help Text */}
            <div className="settings-help">
              <p>
                <strong>如何获取 API Key？</strong>
              </p>
              <ol>
                <li>访问智谱 AI 开放平台 (open.bigmodel.cn)</li>
                <li>注册并登录账号</li>
                <li>进入「API Keys」页面</li>
                <li>创建新的 API Key 并复制到这里</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;

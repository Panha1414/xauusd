import { useState } from 'react';
import { TelegramConfig } from '../types';
import { Send, X, ShieldAlert, CheckCircle2, HelpCircle, ExternalLink } from 'lucide-react';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onSaveConfig: (cfg: TelegramConfig) => void;
}

export default function TelegramSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: TelegramSettingsModalProps) {
  const [token, setToken] = useState(config.botToken);
  const [chatId, setChatId] = useState(config.chatId);
  const [enabled, setEnabled] = useState(config.enabled);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: token.trim(),
          chatId: chatId.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: 'Test signal alert sent successfully to Telegram!', success: true });
        setEnabled(true);
        onSaveConfig({
          enabled: true,
          botToken: token.trim(),
          chatId: chatId.trim(),
          lastTestStatus: 'SUCCESS',
        });
      } else {
        setStatusMessage({
          text: data.error || 'Failed to send alert. Check token and chat ID.',
          success: false,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error testing Telegram';
      setStatusMessage({ text: message, success: false });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      enabled,
      botToken: token.trim(),
      chatId: chatId.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-[#0d121c] border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Telegram Signal Broadcast</h3>
              <p className="text-[11px] text-slate-400">Push instant Buy/Sell setups to mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                statusMessage.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {statusMessage.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Toggle Broadcast */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Automatic Broadcast</span>
              <span className="text-[11px] text-slate-400">Send every confirmed signal to Telegram</span>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Bot Token */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-300">
              Telegram Bot Token
            </label>
            <input
              type="text"
              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              value={token}
              onChange={e => setToken(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
            <p className="text-[10px] text-slate-500">
              Obtained from <span className="text-sky-400 font-mono">@BotFather</span> on Telegram.
            </p>
          </div>

          {/* Chat ID */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-300">
              Telegram Chat ID / Channel ID
            </label>
            <input
              type="text"
              placeholder="e.g. 987654321 or @my_trading_channel"
              value={chatId}
              onChange={e => setChatId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
            <p className="text-[10px] text-slate-500">
              Your User ID or Channel handle where the bot has send permissions.
            </p>
          </div>

          {/* Guide Helper */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              Quick 2-Minute Setup:
            </span>
            <ol className="list-decimal pl-4 space-y-0.5 text-slate-400">
              <li>Message <code className="text-sky-300">@BotFather</code> on Telegram and type <code className="text-sky-300">/newbot</code>.</li>
              <li>Paste the API Token into the field above.</li>
              <li>Start your bot and send a message to <code className="text-sky-300">@userinfobot</code> to copy your numeric Chat ID.</li>
              <li>Click "Send Test Signal" to verify instantly!</li>
            </ol>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>អ្នកបង្កើត AI នេះ (Support/Creator):</span>
              <a
                href="https://t.me/sophapanha"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-bold font-mono"
              >
                Telegram: @sophapanha
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-3.5 bg-slate-900 border-t border-slate-800 text-xs">
          <button
            onClick={handleTest}
            disabled={isTesting || !token.trim() || !chatId.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 font-medium transition disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {isTesting ? 'Sending Test...' : 'Send Test Signal'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

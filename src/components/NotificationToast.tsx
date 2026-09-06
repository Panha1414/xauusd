import { useEffect } from 'react';
import { TradingSignal } from '../types';
import { TrendingUp, TrendingDown, X, Target, ShieldCheck } from 'lucide-react';

interface NotificationToastProps {
  signal: TradingSignal | null;
  onClose: () => void;
  onSelect: (signal: TradingSignal) => void;
}

export default function NotificationToast({
  signal,
  onClose,
  onSelect,
}: NotificationToastProps) {
  useEffect(() => {
    if (!signal) return;
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [signal, onClose]);

  if (!signal) return null;

  const isBuy = signal.action === 'BUY';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-[#0d121c] border border-slate-700/80 rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg flex items-center justify-center ${
              isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {isBuy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold ${
                  isBuy ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                NEW {signal.action} SIGNAL
              </span>
              <span className="text-xs font-semibold text-white font-mono">{signal.symbol}</span>
            </div>
            <p className="text-[11px] text-slate-400">{signal.strategy}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono">
        <div>
          <span className="text-slate-500 block">ENTRY</span>
          <span className="text-sky-300 font-bold">${signal.entryPrice}</span>
        </div>
        <div>
          <span className="text-slate-500 block">TARGET</span>
          <span className="text-emerald-400 font-bold">${signal.tp1}</span>
        </div>
        <div>
          <span className="text-slate-500 block">STOP</span>
          <span className="text-rose-400 font-bold">${signal.sl}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-xs">
        <span className="text-[11px] text-slate-400">
          Confidence: <span className="font-bold text-white">{signal.confidence}%</span>
        </span>
        <button
          onClick={() => {
            onSelect(signal);
            onClose();
          }}
          className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
        >
          Focus on Chart
        </button>
      </div>
    </div>
  );
}

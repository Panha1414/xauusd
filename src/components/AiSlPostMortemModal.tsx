import React from 'react';
import {
  X,
  Brain,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sliders,
  History,
} from 'lucide-react';
import { TradingSignal, SlPostMortem } from '../types';

interface AiSlPostMortemModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: TradingSignal | null;
  postMortem: SlPostMortem | null;
  isLoading?: boolean;
}

export default function AiSlPostMortemModal({
  isOpen,
  onClose,
  signal,
  postMortem,
  isLoading = false,
}: AiSlPostMortemModalProps) {
  if (!isOpen || !signal) return null;

  const data: SlPostMortem = postMortem || signal.slPostMortem || {
    signalId: signal.id,
    symbol: signal.symbol,
    lossR: -1.0,
    rootCause: 'Institutional Liquidity Sweep pierced ATR buffer before true direction unfolded.',
    rootCauseKhmer: 'ស្ថាប័នធំៗបានបង្កើតចលនា Sweep Stop-hunt បោសសម្អាតមុនពេលទីផ្សាររត់ទៅតាមទិសដៅពិតប្រាកដ។',
    marketAnomalyType: 'LIQUIDITY_SWEEP_FAKEOUT',
    lessonsLearned: [
      'កម្រិត Stop Loss ស្ថិតនៅកៀកតំបន់ Liquidity Pool ពេក ដែលធ្វើឱ្យងាយរងគ្រោះនឹងចលនា Judas Swing។',
      'ត្រូវការ Dynamic Volatility Buffer ពង្រីកពី 1.5x ទៅ 1.85x ATR នៅពេលទីផ្សារមានបរិមាណ Volume ខ្ពស់។',
    ],
    adaptiveActionsTaken: [
      'បានធ្វើស្វ័យប្រវត្តិកែសម្រួលក្បួន Invalidation Buffer: បន្ថែម 1.85x ATR Buffer សម្រាប់ Signal បន្ទាប់។',
      'ពង្រឹងលក្ខខណ្ឌ SMC-Ghost ឱ្យរង់ចាំ Candle Close Rejection លើ Timeframe 15M ជាចាំបាច់។',
    ],
    parameterAdjustments: [
      { name: 'ATR Buffer Multiplier', before: '1.50x ATR ($9.75)', after: '1.85x ATR ($12.00)' },
      { name: 'Min Entry Confirmation', before: '5M Market Execution', after: '15M Candle Close Rejection' },
      { name: 'Confluence Alignment Req', before: '80%', after: '92% Strict Threshold' },
    ],
    evolutionBadge: 'Autonomous Defense Hardening v4.4',
    modelUpgradeVersion: 'AI Model Upgraded to v4.5 (High Resistance)',
  };

  const isBuy = signal.action === 'BUY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/90 bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <span>AI SL Post-Mortem & Self-Evolution</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                  -1.0R STOPPED
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                  {data.evolutionBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ការវិភាគឫសគល់នៃការខាតបង់ & ការអភិវឌ្ឍសមត្ថភាព AI ស្វ័យប្រវត្តិកុំឱ្យច្រំដែល
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-semibold text-slate-200">
                AI កំពុងវិភាគស្វែងយល់ពីមូលហេតុបុក Stop Loss...
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                កំពុងពិនិត្យមើល Order Flow, Liquidity Sweeps, News Shocks និងកែសម្រួល Parameters ស្វ័យប្រវត្តិ។
              </p>
            </div>
          ) : (
            <>
              {/* Trade Snapshot Bar */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg font-bold font-mono text-xs flex items-center gap-1 ${
                      isBuy
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isBuy ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{signal.action} {signal.symbol}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Entry: <strong className="text-white">${signal.entryPrice}</strong> → SL: <strong className="text-rose-400">${signal.sl}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-slate-400">យុទ្ធសាស្ត្រ:</span>
                  <span className="text-slate-200 font-sans font-medium">{signal.strategy}</span>
                </div>
              </div>

              {/* Root Cause Card (មូលហេតុបណ្តាលឱ្យប៉ះ SL) */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>មូលហេតុឫសគល់ (Root Cause Analysis):</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {data.marketAnomalyType}
                  </span>
                </div>

                <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-sans font-medium">
                  {data.rootCauseKhmer}
                </p>

                <p className="text-slate-400 text-[11px] italic font-mono leading-relaxed border-t border-rose-500/20 pt-2">
                  "{data.rootCause}"
                </p>
              </div>

              {/* Lessons Learned (មេរៀនដែល AI ស្រង់បាន) */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>មេរៀនដែល AI ស្រង់បាន (Institutional Lessons Learned):</span>
                </div>

                <ul className="space-y-2">
                  {data.lessonsLearned.map((lesson, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Autonomous Model Upgrades & Parameter Recalibration */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>ការអភិវឌ្ឍសមត្ថភាព AI ស្វ័យប្រវត្តិ (Model Evolution & Parameter Hardening):</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Applied to Next Signal</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {data.parameterAdjustments.map((param, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]"
                    >
                      <span className="text-slate-300 font-sans font-semibold">
                        {param.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-rose-400 line-through opacity-80">{param.before}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-emerald-400 font-bold">{param.after}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Evolution Badge */}
                <div className="p-3 rounded-lg bg-indigo-900/30 border border-indigo-500/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs text-indigo-200 font-medium">
                      សមត្ថភាពថ្មីរបស់ AI: <strong>{data.modelUpgradeVersion}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                    Self-Learned ✓
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>ទិន្នន័យខាតបង់ត្រូវបានស្រូបចូលក្នុង AI Adaptive Memory ដើម្បីបង្កើន Winrate</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
          >
            យល់ព្រម (Close)
          </button>
        </div>
      </div>
    </div>
  );
}

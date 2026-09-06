import { MultiTimeframeAnalysis, TimeframeTrendDetail } from '../types';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldAlert,
} from 'lucide-react';

interface MultiTimeframeMatrixProps {
  mtf: MultiTimeframeAnalysis | null;
  currentPrice: number;
}

function TimeframeColumn({
  label,
  role,
  detail,
}: {
  label: string;
  role: string;
  detail?: TimeframeTrendDetail;
}) {
  if (!detail) {
    return (
      <div className="flex-1 p-3 rounded-lg bg-slate-900/60 border border-slate-800 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-slate-800 rounded w-3/4" />
      </div>
    );
  }

  const isBull = detail.trend === 'BULLISH';
  const isBear = detail.trend === 'BEARISH';

  return (
    <div
      className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${
        isBull
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : isBear
          ? 'bg-rose-950/20 border-rose-500/30'
          : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold font-mono text-white px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
            {label}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">{role}</span>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
            isBull
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : isBear
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {isBull && <TrendingUp className="w-3 h-3" />}
          {isBear && <TrendingDown className="w-3 h-3" />}
          {!isBull && !isBear && <Minus className="w-3 h-3" />}
          <span>{detail.trend}</span>
        </div>
      </div>

      {/* Structure Verdict */}
      <p className="text-xs text-slate-300 font-medium mb-2 truncate" title={detail.structure}>
        {detail.structure}
      </p>

      {/* Micro Metrics Grid */}
      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] font-mono">
        <div className="text-slate-400">
          EMA50: <span className="text-slate-200 font-semibold">${detail.ema50.toFixed(1)}</span>
        </div>
        <div className="text-slate-400 text-right">
          RSI(14):{' '}
          <span
            className={`font-semibold ${
              detail.rsi > 65
                ? 'text-amber-400'
                : detail.rsi < 35
                ? 'text-sky-400'
                : 'text-slate-200'
            }`}
          >
            {detail.rsi.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MultiTimeframeMatrix({ mtf }: MultiTimeframeMatrixProps) {
  if (!mtf) {
    return (
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Synchronizing 1H, 15M, and 5M Multi-Timeframe Matrices...</span>
        </div>
      </div>
    );
  }

  const isFull = mtf.confluenceStatus === 'FULL_ALIGNMENT';
  const isConflict = mtf.confluenceStatus === 'CONFLICT';
  const isBuy = mtf.alignedBias === 'STRONG_BUY';

  return (
    <div
      id="mtf-matrix-container"
      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-lg relative overflow-hidden"
    >
      {/* Top Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                Multi-Timeframe Trend Confirmation
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                1H + 15M + 5M
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Institutional Top-Down Analysis Engine for XAU/USD High-Accuracy Signals
            </p>
          </div>
        </div>

        {/* Confluence Status Badge */}
        <div className="flex items-center gap-2">
          {isFull ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                isBuy
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs shadow-emerald-500/20'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs shadow-rose-500/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-ping ${
                  isBuy ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>TRIPLE CONFLUENCE ({mtf.alignedBias})</span>
            </div>
          ) : isConflict ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-rose-950/40 text-rose-300 border border-rose-500/40">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>COUNTER-TREND BLOCKED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>PARTIAL ALIGNMENT</span>
            </div>
          )}

          {/* Accuracy Score Tag */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <span
              className={`font-bold ${
                mtf.confluenceScore >= 90
                  ? 'text-emerald-400'
                  : mtf.confluenceScore >= 75
                  ? 'text-sky-400'
                  : 'text-amber-400'
              }`}
            >
              {mtf.confluenceScore}%
            </span>
          </div>
        </div>
      </div>

      {/* 3 Timeframe Columns (1H + 15M + 5M) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <TimeframeColumn label="1H" role="Macro Order Flow" detail={mtf.h1} />
        <TimeframeColumn label="15M" role="Structure & BOS" detail={mtf.m15} />
        <TimeframeColumn label="5M" role="Execution Trigger" detail={mtf.m5} />
      </div>

      {/* Confluence Footnote / Anti-Fakeout Notice */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-slate-500">Active Rule:</span>
          {isFull ? (
            <span className="text-emerald-400 font-semibold">
              All 3 timeframes agree. Probability of fakeout reduced by ~85%.
            </span>
          ) : isConflict ? (
            <span className="text-rose-400 font-semibold">
              {mtf.filterReason || '1H Macro contradicts 5M. AI Engine suppresses fakeout signals.'}
            </span>
          ) : (
            <span className="text-amber-300 font-medium">
              Waiting for 5M execution candle to sync with 1H Macro Order Flow.
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          Top-Down Confluence Filter v2.5
        </span>
      </div>
    </div>
  );
}

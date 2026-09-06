import { IndicatorMetrics } from '../types';
import { Activity, TrendingUp, ShieldAlert, BarChart2 } from 'lucide-react';

interface IndicatorSubChartProps {
  indicators: IndicatorMetrics | null;
  currentPrice: number;
}

export default function IndicatorSubChart({ indicators, currentPrice }: IndicatorSubChartProps) {
  if (!indicators) return null;

  const rsi = indicators.rsi;
  const isRsiOverbought = rsi >= 70;
  const isRsiOversold = rsi <= 30;

  const macd = indicators.macd;
  const isMacdBullish = macd.histogram > 0;

  // Trend status
  const isBullishTrend = currentPrice > indicators.ema20 && indicators.ema20 > indicators.ema50;
  const isBearishTrend = currentPrice < indicators.ema20 && indicators.ema20 < indicators.ema50;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
      {/* RSI Gauge */}
      <div className="flex flex-col gap-1.5 p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            RSI (14)
          </span>
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
              isRsiOverbought
                ? 'bg-rose-500/20 text-rose-400'
                : isRsiOversold
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isRsiOverbought ? 'OVERBOUGHT' : isRsiOversold ? 'OVERSOLD' : 'NEUTRAL'}
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-0.5">
          <span className="text-lg font-bold font-mono text-white">{rsi}</span>
          <span className="text-[11px] text-slate-500">Threshold 30 / 70</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
          {/* Neutral zone indicator */}
          <div className="absolute left-[30%] right-[30%] top-0 bottom-0 bg-slate-700/60" />
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isRsiOverbought ? 'bg-rose-500' : isRsiOversold ? 'bg-emerald-500' : 'bg-sky-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, rsi))}%` }}
          />
        </div>
      </div>

      {/* MACD Oscillator */}
      <div className="flex flex-col gap-1.5 p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
            MACD (12,26,9)
          </span>
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
              isMacdBullish ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {isMacdBullish ? 'BULLISH' : 'BEARISH'}
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-0.5">
          <span
            className={`text-lg font-bold font-mono ${
              macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {macd.histogram >= 0 ? `+${macd.histogram}` : macd.histogram}
          </span>
          <span className="text-[11px] text-slate-500">Hist Delta</span>
        </div>
        <div className="text-[11px] text-slate-400 flex justify-between pt-0.5 font-mono">
          <span>MACD: {macd.macd}</span>
          <span>SIG: {macd.signal}</span>
        </div>
      </div>

      {/* EMA Trend Alignment */}
      <div className="flex flex-col gap-1.5 p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            EMA Alignment
          </span>
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
              isBullishTrend
                ? 'bg-emerald-500/20 text-emerald-400'
                : isBearishTrend
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isBullishTrend ? 'STRONG BULL' : isBearishTrend ? 'STRONG BEAR' : 'RANGE'}
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-0.5">
          <span className="text-sm font-semibold font-mono text-white">
            {isBullishTrend ? 'Price > E20 > E50' : isBearishTrend ? 'Price < E20 < E50' : 'Consolidation'}
          </span>
          <span className="text-[11px] text-slate-400">ATR: ${indicators.atr}</span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span className="text-cyan-400">E20: {indicators.ema20}</span>
          <span className="text-amber-400">E50: {indicators.ema50}</span>
        </div>
      </div>

      {/* Smart Money Concept (SMC) & Key Zones */}
      <div className="flex flex-col gap-1.5 p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            SMC & Key Zones
          </span>
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
              indicators.smcBias === 'BULLISH_SWEEP'
                ? 'bg-emerald-500/20 text-emerald-400'
                : indicators.smcBias === 'BEARISH_SWEEP'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {indicators.smcBias === 'BULLISH_SWEEP'
              ? 'LIQ SWEEP (BUY)'
              : indicators.smcBias === 'BEARISH_SWEEP'
              ? 'LIQ SWEEP (SELL)'
              : 'RANGE BOUND'}
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-0.5 font-mono text-xs">
          <span className="text-rose-400 font-medium">RES: ${indicators.resistanceLevel}</span>
          <span className="text-emerald-400 font-medium">SUP: ${indicators.supportLevel}</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          200 EMA Base: <span className="font-mono text-purple-400">${indicators.ema200}</span>
        </div>
      </div>
    </div>
  );
}

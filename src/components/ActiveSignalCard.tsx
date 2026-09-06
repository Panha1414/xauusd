import { useState, useEffect } from 'react';
import { TradingSignal } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Target,
  ShieldCheck,
  Zap,
  Send,
  Sparkles,
  Volume2,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Timer,
  AlertTriangle,
  Play,
  Lock,
} from 'lucide-react';
import { playSignalSound } from '../utils/audioChime';

interface ActiveSignalCardProps {
  signal: TradingSignal | null;
  currentPrice?: number;
  onOpenAiAnalysis: () => void;
  onSendTelegram: (signal: TradingSignal) => void;
  onActivateLimit?: (signalId: string) => void;
  isAiAnalyzing?: boolean;
}

export default function ActiveSignalCard({
  signal,
  currentPrice,
  onOpenAiAnalysis,
  onSendTelegram,
  onActivateLimit,
  isAiAnalyzing,
}: ActiveSignalCardProps) {
  const [telegramSending, setTelegramSending] = useState(false);
  const [activatingLimit, setActivatingLimit] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);

  // Live countdown timer for pending limit orders
  useEffect(() => {
    if (!signal?.expiresAt || signal.status !== 'PENDING') {
      setTimeLeftSec(null);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((signal.expiresAt! - Date.now()) / 1000));
      setTimeLeftSec(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [signal?.expiresAt, signal?.status]);

  if (!signal) {
    return (
      <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-400 flex flex-col items-center justify-center min-h-[220px] text-center">
        <Zap className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
        <p className="font-medium text-slate-300">Scanning Real-time Market Data...</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          The institutional engine is scanning for high-probability SMC Order Blocks, FVG Retests, and Limit Order setups.
        </p>
      </div>
    );
  }

  const isBuy = signal.action === 'BUY';
  const isPending = signal.status === 'PENDING';
  const isLimit = signal.orderType === 'BUY_LIMIT' || signal.orderType === 'SELL_LIMIT';
  const livePrice = currentPrice ?? signal.entryPrice;

  // Calculate live distance to fill or targets
  const distToEntry = isBuy ? livePrice - signal.entryPrice : signal.entryPrice - livePrice;
  const distToTp1 = isBuy ? signal.tp1 - livePrice : livePrice - signal.tp1;
  const distToTp2 = isBuy ? signal.tp2 - livePrice : livePrice - signal.tp2;
  const distToSl = isBuy ? livePrice - signal.sl : signal.sl - livePrice;

  // Progress percentage toward TP1
  const totalSpan = Math.abs(signal.tp1 - signal.entryPrice);
  const currentProgressRaw = totalSpan > 0 
    ? (isBuy ? (livePrice - signal.entryPrice) / totalSpan : (signal.entryPrice - livePrice) / totalSpan) * 100
    : 0;
  const progressPercent = Math.max(0, Math.min(100, Math.round(currentProgressRaw)));

  // Expiration countdown format
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTelegramClick = async () => {
    setTelegramSending(true);
    try {
      await onSendTelegram(signal);
    } finally {
      setTimeout(() => setTelegramSending(false), 800);
    }
  };

  const handleManualActivate = async () => {
    if (!onActivateLimit) return;
    setActivatingLimit(true);
    try {
      await onActivateLimit(signal.id);
    } finally {
      setTimeout(() => setActivatingLimit(false), 800);
    }
  };

  return (
    <div
      id="active-signal-card"
      className={`relative p-4 rounded-xl border transition-all duration-300 ${
        isPending
          ? 'bg-gradient-to-b from-amber-950/40 via-slate-900/95 to-slate-950 border-amber-500/50 shadow-lg shadow-amber-950/30'
          : isBuy
          ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900/90 to-slate-950 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
          : 'bg-gradient-to-b from-rose-950/40 via-slate-900/90 to-slate-950 border-rose-500/40 shadow-lg shadow-rose-950/30'
      }`}
    >
      {/* Header: Order Type, Action Badge & Confidence */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg flex items-center justify-center ${
              isPending
                ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40'
                : isBuy
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {isBuy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-lg font-extrabold tracking-wider ${
                  isPending
                    ? 'text-amber-400'
                    : isBuy
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {signal.orderType?.replace('_', ' ') || signal.action} {signal.symbol}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {signal.timeframe}
              </span>
              {isPending && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Timer className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                  PENDING RETEST
                </span>
              )}
              {signal.mtfAnalysis && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  <Layers className="w-2.5 h-2.5" />
                  1H+15M+5M
                </span>
              )}
              {signal.committeeConsensus && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Users className="w-2.5 h-2.5" />
                  4/4 AI BOARD
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              Issued {new Date(signal.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Confidence:</span>
            <span
              className={`text-base font-bold font-mono ${
                signal.confidence >= 90
                  ? 'text-emerald-400'
                  : signal.confidence >= 80
                  ? 'text-sky-400'
                  : 'text-amber-400'
              }`}
            >
              {signal.confidence}%
            </span>
          </div>
          <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isPending ? 'bg-amber-500' : isBuy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${signal.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expiration Countdown Banner for Pending Limit Orders */}
      {isPending && (
        <div className="my-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
              <Timer className="w-4 h-4 text-amber-400" />
              <span>ពេលវេលាផុតកំណត់ Limit Order (Expiration Countdown):</span>
            </div>
            {timeLeftSec !== null && (
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 font-mono font-extrabold text-amber-300 text-sm">
                {formatCountdown(timeLeftSec)}
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-300 flex flex-col gap-1">
            <div className="text-amber-200/90 font-medium">
              🇰🇭 {signal.expirationReasonKhmer || 'បញ្ជាទិញនេះនឹងផុតកំណត់ស្វ័យប្រវត្តិ ប្រសិនបើតម្លៃមិន retest ដល់កម្រិតកំណត់ ឬរត់ដល់ Target មុន។'}
            </div>
            <div className="text-slate-400 text-[10px]">
              🌐 {signal.expirationReason || `Valid for ${signal.expirationMinutes || 45} mins.`}
            </div>
          </div>

          {/* Fill Status & Manual Activation Button */}
          <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-xs">
            <span className="font-mono text-slate-300">
              {distToEntry > 0 ? (
                <span className="text-amber-300">
                  រង់ចាំតម្លៃ Retest: <span className="font-bold">${distToEntry.toFixed(2)}</span> ទៀតដើម្បី Fill
                </span>
              ) : (
                <span className="text-emerald-400 font-bold">✓ តម្លៃដល់កម្រិត Entry - កំពុង Execute</span>
              )}
            </span>

            {onActivateLimit && (
              <button
                type="button"
                onClick={handleManualActivate}
                disabled={activatingLimit}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
                title="ចូលទីផ្សារភ្លាមៗតាមតម្លៃ Limit"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{activatingLimit ? 'Activating...' : 'ចូលភ្លាមៗ (Fill Now)'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Target & Risk Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-3">
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Zap className="w-3 h-3 text-sky-400" />
            {isLimit ? 'Limit Entry' : 'Entry Price'}
          </div>
          <div className="text-base font-bold font-mono text-sky-300 mt-1">
            ${signal.entryPrice}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isLimit ? 'Institutional Retrace' : 'Market Execution'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          {(signal.status === 'HIT_TP1' || signal.partialScaleOut?.tp1Closed) && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
              50% LOCKED ✓
            </div>
          )}
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-400" />
            TP1 (50% Lot)
          </div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-1">
            ${signal.tp1}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {signal.status === 'ACTIVE' 
              ? `${distToTp1 > 0 ? `+$${distToTp1.toFixed(2)} away` : 'Reaching...'}`
              : 'Target (+1.5R)'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          {(signal.status === 'HIT_TP2' || signal.partialScaleOut?.tp2Closed) && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded">
              30% LOCKED ✓
            </div>
          )}
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-300" />
            TP2 (30% Lot)
          </div>
          <div className="text-base font-bold font-mono text-emerald-300 mt-1">
            ${signal.tp2}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {signal.status === 'ACTIVE' || signal.status === 'HIT_TP1'
              ? `${distToTp2 > 0 ? `+$${distToTp2.toFixed(2)} away` : 'Achieved'}`
              : 'Target (+3.0R)'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            TP3 Runner (20%)
          </div>
          <div className="text-base font-bold font-mono text-amber-300 mt-1">
            ${signal.tp3 || Number((isBuy ? signal.tp2 + (signal.tp1 - signal.entryPrice) * 1.5 : signal.tp2 - (signal.entryPrice - signal.tp1) * 1.5).toFixed(2))}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Moon-Bag (+4.5R+)
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          {signal.status === 'HIT_SL' && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[9px] font-bold rounded">
              HIT ✕
            </div>
          )}
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-rose-400" />
            Stop Loss (SL)
          </div>
          <div className="text-base font-bold font-mono text-rose-400 mt-1">
            ${signal.sl}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {signal.isBreakevenProtected || signal.status === 'HIT_TP1'
              ? '🔒 Breakeven (0 Risk)' 
              : `Anti-SL 2.6x ATR Buffer`}
          </div>
        </div>
      </div>

      {/* Institutional Intelligence Badges: SMT, Killzone & Multi-Stage Scale-Out */}
      <div className="mb-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col gap-2 font-mono text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-sans text-[11px] font-bold">Institutional Tags:</span>
            {signal.sessionKillzone && (
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{signal.sessionKillzone}</span>
              </span>
            )}
            {signal.smtInfo && signal.smtInfo.divergenceType !== 'NONE' && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>{signal.smtInfo.divergenceType}</span>
              </span>
            )}
            {signal.liquidityTarget && (
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{signal.liquidityTarget.poolType} Pool: ${signal.liquidityTarget.level}</span>
              </span>
            )}
          </div>
          <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            Multi-Stage Scale-Out: 50% / 30% / 20%
          </span>
        </div>

        {/* Dynamic Trailing Stop Notification */}
        {signal.dynamicTrailingSl && (
          <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800 flex items-center justify-between font-sans">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{signal.dynamicTrailingSl.statusText}</span>
            </span>
            {signal.dynamicTrailingSl.pipsSecured > 0 && (
              <span className="text-emerald-400 font-mono font-bold text-xs whitespace-nowrap">
                +{signal.dynamicTrailingSl.pipsSecured} pips locked
              </span>
            )}
          </div>
        )}
      </div>

      {/* Anti-SL Engine 2.0 & Auto-Breakeven Protection Banner */}
      <div className="mb-3 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40 text-xs font-mono flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Anti-SL Engine 2.0 (ប្រព័ន្ធការពារ Stop Loss ថ្មី)</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
            {signal.antiSlBufferPips ? `${signal.antiSlBufferPips} Pips Cushion` : '2.6x ATR Buffer'}
          </span>
        </div>

        <div className="text-[11px] text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1">
            {signal.isBreakevenProtected ? (
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>🔒 Breakeven Lock Active: SL moved to ${signal.entryPrice} (Zero Downside Risk)</span>
              </span>
            ) : (
              <span className="text-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Auto-Breakeven: Stop Loss នឹងផ្លាស់ទីទៅ Entry ស្វ័យប្រវត្តិកាលណាតម្លៃដើរដល់ +50% ឆ្ពោះទៅ TP1</span>
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Live Trade Status & Trade Progress Banner */}
      <div className="mb-3.5 p-2.5 rounded-lg border text-xs font-mono flex flex-col gap-1.5 transition-all">
        {signal.status === 'ACTIVE' && (
          <div className="flex flex-col gap-1.5 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Trade in progress • Targeting TP1 (${signal.tp1})</span>
              </span>
              <span className="text-slate-300 font-bold">
                {distToTp1 > 0 ? `$${distToTp1.toFixed(2)} to TP1` : 'Touching TP1'}
              </span>
            </div>
            {/* Progress bar to TP1 */}
            <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Entry: ${signal.entryPrice}</span>
              <span className="text-emerald-300 font-semibold">{progressPercent}% Progress</span>
              <span>TP1: ${signal.tp1}</span>
            </div>
          </div>
        )}

        {signal.status === 'HIT_TP1' && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 p-2 rounded-md flex items-center justify-between text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="text-base">🎉</span>
              <div>
                <div className="font-bold text-emerald-200">TARGET TP1 HIT (+1.5R Realized!)</div>
                <div className="text-[10px] text-emerald-400/90 font-normal">
                  Stop Loss automatically trailed to Breakeven (${signal.entryPrice}). Trailing runner to TP2 (${signal.tp2}).
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
              +1.5R
            </span>
          </div>
        )}

        {signal.status === 'HIT_TP2' && (
          <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-emerald-500/50 p-2.5 rounded-md flex items-center justify-between text-emerald-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <div>
                <div className="font-extrabold text-amber-300 tracking-wide">FULL TARGET TP2 HIT (+3.0R Realized!)</div>
                <div className="text-[10px] text-slate-300 font-normal">
                  Institutional trade completed with maximum payout. Engine entering market cooldown.
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40">
              +3.0R FULL
            </span>
          </div>
        )}

        {signal.status === 'HIT_SL' && (
          <div className="bg-rose-500/15 border border-rose-500/30 p-2 rounded-md flex items-center justify-between text-rose-300">
            <div className="flex items-center gap-2">
              <span className="text-base">🛑</span>
              <div>
                <div className="font-bold text-rose-200">STOP LOSS EXECUTED (-1.0R Controlled Risk)</div>
                <div className="text-[10px] text-rose-400/90 font-normal">
                  Stop Loss buffer preserved capital. Post-mortem analysis generated for AI adaptation.
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[11px] border border-rose-500/30">
              -1.0R
            </span>
          </div>
        )}

        {signal.status === 'EXPIRED' && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-2 rounded-md flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-base">⏰</span>
              <div>
                <div className="font-bold text-slate-200">ORDER EXPIRED / CANCELLED</div>
                <div className="text-[10px] text-slate-400 font-normal">
                  {signal.expirationReason || 'Limit order did not retest in time or closed at breakeven.'}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-bold text-[11px]">
              0.0R
            </span>
          </div>
        )}

        {/* Protection Note */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-slate-800/60">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Single Active Trade Protocol:</span>
          </span>
          <span className="text-indigo-300 font-semibold">
            {signal.status === 'PENDING'
              ? '⏳ Limit Order Awaiting Retest Fill'
              : signal.status === 'ACTIVE' || signal.status === 'HIT_TP1'
              ? '🔒 Stream Locked (No Overlapping Signals)'
              : '🔓 Ready for Next Setup'}
          </span>
        </div>
      </div>

      {/* Confluences Checklist */}
      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 mb-3.5">
        <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <span>Algorithmic Confluences:</span>
          <span className="text-[11px] text-slate-400 font-normal">{signal.strategy}</span>
        </div>
        <div className="space-y-1">
          {signal.confluences.map((conf, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}
              />
              <span className="truncate">{conf}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            id="btn-ai-deep-analysis"
            onClick={onOpenAiAnalysis}
            disabled={isAiAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAiAnalyzing ? 'AI Reasoning...' : 'Gemini AI Deep Scan'}
          </button>

          <button
            id="btn-telegram-broadcast"
            onClick={handleTelegramClick}
            disabled={telegramSending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/40 text-xs font-semibold transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {telegramSending ? 'Sending...' : 'Broadcast Telegram'}
          </button>
        </div>

        <button
          id="btn-sound-preview"
          onClick={() => playSignalSound(signal.action === 'BUY' ? 'BUY' : 'SELL')}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
          title="Play Alert Chime"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


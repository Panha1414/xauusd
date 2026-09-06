import React, { useState } from 'react';
import { TradingSignal } from '../types';
import { computeBacktestMetrics } from '../services/backtestEngine';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  Send,
  BarChart3,
  Brain,
  Sparkles,
  ShieldAlert,
  Filter,
} from 'lucide-react';

interface SignalHistoryProps {
  signals: TradingSignal[];
  activeSignalId?: string;
  onSelectSignal: (signal: TradingSignal) => void;
  onBroadcastTelegram: (signal: TradingSignal) => void;
  onViewBacktest?: () => void;
  onOpenSlPostMortem?: (signal: TradingSignal) => void;
}

export default function SignalHistory({
  signals,
  activeSignalId,
  onSelectSignal,
  onBroadcastTelegram,
  onViewBacktest,
  onOpenSlPostMortem,
}: SignalHistoryProps) {
  const [filter, setFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'ACTIVE' | 'PENDING'>('ALL');

  // Compute analytics dynamically
  const metrics = computeBacktestMetrics(signals);
  const total = signals.length;
  const wins = signals.filter(s => s.status === 'HIT_TP1' || s.status === 'HIT_TP2').length;
  const losses = signals.filter(s => s.status === 'HIT_SL').length;
  const actives = signals.filter(s => s.status === 'ACTIVE').length;
  const pendings = signals.filter(s => s.status === 'PENDING').length;

  const filteredSignals = signals.filter(s => {
    if (filter === 'WIN') return s.status === 'HIT_TP1' || s.status === 'HIT_TP2';
    if (filter === 'LOSS') return s.status === 'HIT_SL';
    if (filter === 'ACTIVE') return s.status === 'ACTIVE';
    if (filter === 'PENDING') return s.status === 'PENDING';
    return true;
  });

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col gap-3.5">
      {/* Header & Stats Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 pb-2.5 border-b border-slate-800">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Trading Signals Stream</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-normal">
                {total} Logged
              </span>
            </h2>
            {onViewBacktest && (
              <button
                type="button"
                onClick={onViewBacktest}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-semibold transition cursor-pointer"
              >
                <BarChart3 className="w-3 h-3" />
                <span>Backtest Visualizer</span>
              </button>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <span>🛡️ Single Active Trade Protocol</span>
            <span>•</span>
            <span className="text-indigo-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI Self-Learning on SL Enabled</span>
            </span>
          </div>
        </div>

        {/* Win Rate & Performance Metrics */}
        <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
            <span className="text-[10px] text-emerald-500 font-bold">WIN RATE:</span>
            <span className="font-bold text-sm">{metrics.winRate}%</span>
            <span className="text-[10px] text-emerald-400/70">({wins}W/{losses}L)</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-xs">
            <span className="text-[10px] text-amber-500 font-bold">PF:</span>
            <span className="font-bold text-sm">{metrics.profitFactor}x</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-xs">
            <span className="text-[10px] text-sky-500 font-bold">NET:</span>
            <span className="font-bold text-sm">+{metrics.netProfitR}R</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono border-b border-slate-800/60 pb-2">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            filter === 'ALL'
              ? 'bg-slate-700 text-white font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span>ទាំងអស់ ({total})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('WIN')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            filter === 'WIN'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10'
          }`}
        >
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>ឈ្នះ TP1/TP2 ({wins})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('LOSS')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            filter === 'LOSS'
              ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
              : 'text-slate-400 hover:text-rose-300 hover:bg-rose-500/10'
          }`}
        >
          <Brain className="w-3 h-3 text-rose-400" />
          <span>ចាញ់ SL - រៀនសូត្រ ({losses})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('ACTIVE')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            filter === 'ACTIVE'
              ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
              : 'text-slate-400 hover:text-sky-300 hover:bg-sky-500/10'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>កំពុងដំណើរការ ({actives})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('PENDING')}
          className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            filter === 'PENDING'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
              : 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Limit Orders ({pendings})</span>
        </button>
      </div>

      {/* Signals List */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 select-none">
        {filteredSignals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            មិនមាន Signal នៅក្នុង Filter នេះទេ។
          </div>
        ) : (
          filteredSignals.map(sig => {
            const isBuy = sig.action === 'BUY';
            const isPending = sig.status === 'PENDING';
            const isSelected = sig.id === activeSignalId;
            const isLoss = sig.status === 'HIT_SL';
            const orderTypeLabel = sig.orderType === 'BUY_LIMIT' 
              ? 'BUY LIMIT' 
              : sig.orderType === 'SELL_LIMIT' 
              ? 'SELL LIMIT' 
              : sig.action;

            return (
              <div
                key={sig.id}
                onClick={() => onSelectSignal(sig)}
                className={`p-3 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isSelected
                    ? isPending
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40'
                      : isBuy
                      ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/40'
                    : isLoss
                    ? 'bg-slate-950/70 border-slate-800/90 hover:border-rose-500/40'
                    : isPending
                    ? 'bg-slate-950/60 border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Action, Symbol, Time, Strategy */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isPending
                        ? 'bg-amber-500/20 text-amber-400'
                        : isBuy
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold font-mono ${
                          isPending
                            ? 'text-amber-400'
                            : isBuy
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {orderTypeLabel}
                      </span>
                      <span className="text-xs font-semibold text-white">{sig.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {sig.timeframe}
                      </span>
                      {sig.isBreakevenProtected && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold border border-sky-500/30">
                          BE LOCK
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                      {sig.strategy}
                    </div>
                  </div>
                </div>

                {/* Right: Levels & Status & SL Post-Mortem Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono flex-wrap">
                  <div className="flex flex-col text-right">
                    <span className="text-slate-300">
                      Entry: <span className="text-sky-300 font-semibold">${sig.entryPrice}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      TP: <span className="text-emerald-400">${sig.tp1}</span> | SL: <span className="text-rose-400">${sig.sl}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                        sig.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-1 ring-amber-500/30'
                          : sig.status === 'HIT_TP2'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : sig.status === 'HIT_TP1'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : sig.status === 'HIT_SL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : sig.status === 'EXPIRED'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-sky-500/15 text-sky-300 border border-sky-500/30 ring-1 ring-sky-500/30'
                      }`}
                    >
                      {sig.status === 'PENDING' ? (
                        <>
                          <Clock className="w-2.5 h-2.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                          <span>PENDING LIMIT</span>
                        </>
                      ) : sig.status === 'HIT_TP2' ? (
                        'TP2 (+3.0R) 🏆'
                      ) : sig.status === 'HIT_TP1' ? (
                        'TP1 (+1.5R) ✓'
                      ) : sig.status === 'HIT_SL' ? (
                        'STOPPED (-1.0R)'
                      ) : sig.status === 'EXPIRED' ? (
                        'EXPIRED 0R'
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                          <span>RUNNING</span>
                        </>
                      )}
                    </span>

                    {/* SL Post-Mortem & Self-Evolution Trigger Button */}
                    {isLoss && onOpenSlPostMortem && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onOpenSlPostMortem(sig);
                        }}
                        className="px-2 py-0.5 rounded-md bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                        title="វិភាគហេតុផល SL & ការអភិវឌ្ឍ AI ស្វ័យប្រវត្តិកុំឱ្យច្រំដែល"
                      >
                        <Brain className="w-3 h-3 text-rose-400" />
                        <span>វិភាគ SL</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onBroadcastTelegram(sig);
                      }}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-400 transition cursor-pointer"
                      title="Send to Telegram"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

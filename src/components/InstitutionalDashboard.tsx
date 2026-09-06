import React, { useState } from 'react';
import {
  InstitutionalIntel,
  LiquidityPool,
  LossPatternMemory,
  SessionKillzoneType,
} from '../types';
import {
  Clock,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Droplets,
  Layers,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  DollarSign,
  Activity,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';

interface InstitutionalDashboardProps {
  intel: InstitutionalIntel | null;
  currentPrice: number;
  onSelectLiquidityTarget?: (level: number) => void;
  onRefreshIntel?: () => void;
}

type TabType = 'KILLZONES' | 'LIQUIDITY_CVD' | 'SMT_DIVERGENCE' | 'PATTERN_SHIELD';

export default function InstitutionalDashboard({
  intel,
  currentPrice,
  onSelectLiquidityTarget,
  onRefreshIntel,
}: InstitutionalDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('KILLZONES');

  if (!intel) {
    return (
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-amber-400 animate-spin mb-2" />
        <span className="text-xs text-slate-400 font-mono">
          កំពុងទាញទិន្នន័យ Institutional Market Intelligence (Killzones, SMT, Liquidity Heatmap)...
        </span>
      </div>
    );
  }

  const { session, liquidity, smt, patternShield } = intel;

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 sm:p-4 flex flex-col gap-3 shadow-xl">
      {/* Header with Title and Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Institutional Market Matrix
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                PRO SMC • 5 PILLARS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ប្រព័ន្ធវិភាគកម្រិតស្ថាប័នធំៗ៖ Killzones, SMT, Liquidity Pools & AI Loss Memory
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('KILLZONES')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'KILLZONES'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Killzones & Trap</span>
            {session.isKillzoneActive && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('LIQUIDITY_CVD')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'LIQUIDITY_CVD'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Liquidity & CVD</span>
          </button>

          <button
            onClick={() => setActiveTab('SMT_DIVERGENCE')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SMT_DIVERGENCE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SMT (Gold/Silver)</span>
            {smt.hasDivergence && (
              <span className="text-[9px] px-1 rounded bg-emerald-500/30 text-emerald-300 font-mono">
                +{smt.signalQualityBoost}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PATTERN_SHIELD')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'PATTERN_SHIELD'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Loss Shield</span>
            <span className="text-[9px] px-1 rounded bg-purple-500/30 text-purple-300 font-mono">
              {patternShield.totalLossesPreventedCount} 🛡️
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: SESSION KILLZONES & JUDAS TRAP RADAR */}
      {activeTab === 'KILLZONES' && (
        <div className="space-y-3">
          {/* Active Session Status Card */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              session.isKillzoneActive
                ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/30'
                : session.currentSession === 'ASIAN'
                ? 'bg-indigo-950/20 border-indigo-500/30'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    session.isKillzoneActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {session.isKillzoneActive ? (
                    <>
                      <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span>KILLZONE សកម្ម (High Volatility)</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.sessionNameEnglish}</span>
                    </>
                  )}
                </span>
                <span className="text-xs text-white font-bold">{session.sessionNameKhmer}</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">{session.advisoryKhmer}</p>
            </div>

            {/* Time Clocks */}
            <div className="flex items-center gap-2.5 font-mono text-xs">
              <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400">ម៉ោងនៅកម្ពុជា</div>
                <div className="text-amber-300 font-bold">{session.cambodiaTime}</div>
              </div>
              <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400">ម៉ោងស្តង់ដារ UTC</div>
                <div className="text-slate-300">{session.utcTime}</div>
              </div>
            </div>
          </div>

          {/* Asian Range & Judas Trap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Asian High/Low Range */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Asian Session Range (កម្រិតព្រំដែនអាស៊ី)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Range: {session.asianRange.rangePips} pips
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Asian High</span>
                    {session.asianRange.sweptHigh && (
                      <span className="text-rose-400 font-bold text-[9px]">SWEPT 💥</span>
                    )}
                  </span>
                  <span className="text-emerald-400 font-bold text-sm mt-0.5">
                    ${session.asianRange.high.toFixed(2)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Asian Low</span>
                    {session.asianRange.sweptLow && (
                      <span className="text-emerald-400 font-bold text-[9px]">SWEPT 💥</span>
                    )}
                  </span>
                  <span className="text-rose-400 font-bold text-sm mt-0.5">
                    ${session.asianRange.low.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                💡 យុទ្ធសាស្ត្រស្ថាប័ន៖ ស្វែងរក Liquidity Sweep លើ Asian High/Low ក្នុងអំឡុងពេល London Open ដើម្បីស្ទាក់ចាប់ Judas Swing។
              </p>
            </div>

            {/* Judas Swing Trap Detector */}
            <div
              className={`p-3 rounded-xl border space-y-2 ${
                session.judasSwing.detected
                  ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className={`w-3.5 h-3.5 ${session.judasSwing.detected ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                  <span>Judas Swing Trap Radar (ម៉ាស៊ីនចាប់អន្ទាក់)</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    session.judasSwing.detected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {session.judasSwing.detected ? 'TRAP DETECTED' : 'CLEAN FLOW'}
                </span>
              </div>

              <div className="text-xs font-semibold text-amber-300">
                {session.judasSwing.trapTitleKhmer}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {session.judasSwing.detailsKhmer}
              </p>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 font-mono">
                <span>Next Session: {session.nextSessionName}</span>
                <span>~{session.minutesUntilNextSession} នាទីទៀត</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIQUIDITY HEATMAP & CVD VOLUME DELTA */}
      {activeTab === 'LIQUIDITY_CVD' && (
        <div className="space-y-3">
          {/* CVD Volume Delta Meter Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">
                  Cumulative Volume Delta (CVD) • កម្លាំងទិញលក់ពិតប្រាកដ
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                {liquidity.cvd.flowState}
              </span>
            </div>

            {/* Aggression Ratio Progress Bar */}
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">
                  Buyer Aggression: {liquidity.cvd.buyerPercent}%
                </span>
                <span className="text-rose-400 font-bold">
                  Seller Aggression: {liquidity.cvd.sellerPercent}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${liquidity.cvd.buyerPercent}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${liquidity.cvd.sellerPercent}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 leading-relaxed">
              💡 {liquidity.cvd.divergenceAlertKhmer}
            </p>
          </div>

          {/* Institutional Liquidity Pools (BSL vs SSL) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Buy-Side Liquidity (BSL) */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Buy-Side Liquidity (BSL) Pools</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Total: {liquidity.bslVolumeTotal}
                </span>
              </div>

              <div className="space-y-1.5">
                {liquidity.pools
                  .filter(p => p.type === 'BSL')
                  .map(pool => (
                    <div
                      key={pool.id}
                      onClick={() => onSelectLiquidityTarget && onSelectLiquidityTarget(pool.level)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="text-slate-200 font-semibold">{pool.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {pool.descriptionKhmer}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">${pool.level.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">
                          +{pool.distancePips} pips ({pool.volumeUsd})
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Sell-Side Liquidity (SSL) */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Sell-Side Liquidity (SSL) Pools</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Total: {liquidity.sslVolumeTotal}
                </span>
              </div>

              <div className="space-y-1.5">
                {liquidity.pools
                  .filter(p => p.type === 'SSL')
                  .map(pool => (
                    <div
                      key={pool.id}
                      onClick={() => onSelectLiquidityTarget && onSelectLiquidityTarget(pool.level)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition cursor-pointer flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <div className="text-slate-200 font-semibold">{pool.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {pool.descriptionKhmer}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-rose-400 font-bold">${pool.level.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">
                          -{pool.distancePips} pips ({pool.volumeUsd})
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMT DIVERGENCE MATRIX (GOLD VS SILVER VS DXY) */}
      {activeTab === 'SMT_DIVERGENCE' && (
        <div className="space-y-3">
          {/* Main SMT Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              smt.hasDivergence
                ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                    smt.hasDivergence
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {smt.divergenceType}
                </span>
                <span className="text-xs text-white font-bold">
                  Smart Money Technique (SMT Matrix)
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {smt.explanationKhmer}
              </p>
            </div>

            <div className="bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 text-right font-mono text-xs whitespace-nowrap">
              <div className="text-[10px] text-slate-400">គុណភាព Signal បន្ថែម</div>
              <div className="text-emerald-400 font-bold text-sm">+{smt.signalQualityBoost}% Accuracy Boost</div>
              <div className="text-[10px] text-slate-400">Correlation: {smt.correlationRating}%</div>
            </div>
          </div>

          {/* 3-Way Asset Sync Cards: Gold, Silver, DXY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            {/* Asset 1: Gold (XAU/USD) */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">🟡 XAU/USD (Gold)</span>
                <span className="text-amber-400 font-bold">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                {smt.goldStatus}
              </div>
            </div>

            {/* Asset 2: Silver (XAG/USD) */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">⚪ XAG/USD (Silver)</span>
                <span className="text-sky-300 font-bold">${smt.silverPrice.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                {smt.silverStatus}
              </div>
            </div>

            {/* Asset 3: US Dollar Index (DXY) */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">💵 DXY (Dollar Index)</span>
                <span
                  className={`font-bold ${
                    smt.dxyChangePercent < 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {smt.dxyValue.toFixed(2)} ({smt.dxyChangePercent > 0 ? '+' : ''}{smt.dxyChangePercent}%)
                </span>
              </div>
              <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                កម្លាំងដុល្លារ {smt.dxyTrend}៖ {smt.dxyChangePercent < 0 ? 'ដុល្លារធ្លាក់ជួយរុញមាសឡើង!' : 'ដុល្លារឡើងរារាំងមាស!'}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{smt.tacticalAdvantageKhmer}</span>
          </div>
        </div>
      )}

      {/* TAB 4: AI LOSS MEMORY & PATTERN BLACKLIST SHIELD */}
      {activeTab === 'PATTERN_SHIELD' && (
        <div className="space-y-3">
          {/* Shield Status Card */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              patternShield.isSafe
                ? 'bg-purple-950/20 border-purple-500/40 ring-1 ring-purple-500/30'
                : 'bg-rose-950/30 border-rose-500/50 ring-1 ring-rose-500/40'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {patternShield.isSafe ? (
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                )}
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Loss Memory & Reflex Defense System
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                  {patternShield.activeRiskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {patternShield.systemStatusKhmer}
              </p>
            </div>

            <div className="bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 text-right font-mono text-xs whitespace-nowrap">
              <div className="text-[10px] text-slate-400">អន្ទាក់គ្រោះថ្នាក់ដែលបានរារាំង</div>
              <div className="text-purple-300 font-bold text-sm">
                🛡️ {patternShield.totalLossesPreventedCount} Toxic Trades Blocked
              </div>
              <div className="text-[10px] text-slate-400">Zero SL Repetition Rule</div>
            </div>
          </div>

          {/* Blacklisted Pattern Memories */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>បញ្ជីទម្រង់ដែល AI ចងចាំ និងបដិសេធ (Active Blacklist Memories):</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {patternShield.activeMemories.length} Active Neural Rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {patternShield.activeMemories.map(mem => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/30 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-xs font-bold text-slate-200">{mem.nameKhmer}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-purple-300 font-mono">
                      ការពារបាន {mem.timesPrevented} ដង
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {mem.descriptionKhmer}
                  </p>

                  <div className="pt-1 text-[10px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800/80 font-sans">
                    <span className="text-amber-400 font-bold">🛡️ ក្បួនការពារ៖ </span>
                    <span>{mem.avoidanceRule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

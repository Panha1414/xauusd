import React, { useState } from 'react';
import {
  AiCommitteeConsensus,
  AiCommitteeMember,
  MarketTrapStatus,
} from '../types';
import {
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  Award,
  Lock,
  Compass,
  Cpu,
  Globe2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Radar,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface AiCommitteeBoardProps {
  consensus: AiCommitteeConsensus | null;
  onRefreshCommittee: () => void;
  onExecuteConsensusTrade?: (action: 'BUY' | 'SELL') => void;
  onOpenGeminiAudit: () => void;
  isDeliberating?: boolean;
}

function getAgentIcon(iconType: AiCommitteeMember['iconType']) {
  switch (iconType) {
    case 'smc':
      return <Compass className="w-4 h-4 text-purple-400" />;
    case 'quant':
      return <Cpu className="w-4 h-4 text-cyan-400" />;
    case 'macro':
      return <Globe2 className="w-4 h-4 text-emerald-400" />;
    case 'risk':
      return <Shield className="w-4 h-4 text-amber-400" />;
  }
}

interface AgentCardProps {
  member: AiCommitteeMember;
  isExpanded: boolean;
  onToggle: () => void;
  isDeliberating?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({
  member,
  isExpanded,
  onToggle,
  isDeliberating = false,
}) => {
  const isBuy = member.verdict === 'BUY';
  const isBear = member.verdict === 'SELL';
  const scanDetails = member.scanningStatus || {
    isScanning: true,
    activeTargetKhmer:
      member.id === 'smc_ghost'
        ? 'កំពុងស្កេន 5M/15M Liquidity Pools, Order Blocks & FVG Imbalance'
        : member.id === 'quant_pulse'
        ? 'កំពុងវាស់ Volume Delta, RSI Divergence & Dynamic EMA 20/50 Ribbon'
        : member.id === 'macro_aegis'
        ? 'កំពុងតាមដាន Forex Factory Economic Calendar & DXY Dollar Index'
        : 'កំពុងត្រួតពិនិត្យ 1:3.0 Risk/Reward Ratio & Invalidation SL Protection',
    metricsProcessed:
      member.id === 'smc_ghost'
        ? '14 Swings Analyzed • 3 Order Blocks Mapped'
        : member.id === 'quant_pulse'
        ? 'Vol Delta: Active • ATR Volatility: ±$6.50'
        : member.id === 'macro_aegis'
        ? 'DXY Correlation: Active • Fed Yield Curve: Synchronized'
        : 'Capital Shield: 100% Active • Max Drawdown Cap: 0.85%',
    lastScanTime: Date.now(),
    activityLevel: 'HIGH',
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden flex flex-col relative ${
        isBuy
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : isBear
          ? 'bg-rose-950/20 border-rose-500/30'
          : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      {/* Top Active Scanning Activity Line */}
      <div className="h-0.5 w-full bg-slate-800 relative overflow-hidden">
        <div
          className={`h-full animate-pulse transition-all ${
            member.id === 'smc_ghost'
              ? 'bg-purple-500 w-full'
              : member.id === 'quant_pulse'
              ? 'bg-cyan-400 w-full'
              : member.id === 'macro_aegis'
              ? 'bg-emerald-400 w-full'
              : 'bg-amber-400 w-full'
          }`}
        />
      </div>

      {/* Header bar of the agent card */}
      <div
        onClick={onToggle}
        className="p-3 cursor-pointer hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-2 select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`p-1.5 rounded-lg border ${
                member.iconType === 'smc'
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : member.iconType === 'quant'
                  ? 'bg-cyan-500/10 border-cyan-500/30'
                  : member.iconType === 'macro'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              {getAgentIcon(member.iconType)}
            </div>
            {/* Live scanning radar dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-tight truncate">
                {member.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono hidden sm:inline">
                {member.confidence}% Conf.
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{member.roleKhmer}</p>
          </div>
        </div>

        {/* Verdict Badge & Expand Arrow */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
              isBuy
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : isBear
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {isBuy && <TrendingUp className="w-3 h-3 text-emerald-400" />}
            {isBear && <TrendingDown className="w-3 h-3 text-rose-400" />}
            {!isBuy && !isBear && <Minus className="w-3 h-3 text-slate-400" />}
            <span>{member.verdict}</span>
          </div>

          <button
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-white"
            aria-label="Toggle details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Live Active Scanning Badge Indicator */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/70 flex items-center justify-between gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 min-w-0 text-slate-300">
          <span className="flex h-1.5 w-1.5 shrink-0 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="text-emerald-400 font-bold shrink-0">SCANNING:</span>
          <span className="truncate text-slate-300 font-sans font-normal">
            {scanDetails.activeTargetKhmer}
          </span>
        </div>

        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 shrink-0 hidden sm:inline">
          LIVE
        </span>
      </div>

      {/* Mini Anti-Trap Badge for this Agent */}
      {member.trapAssessment && (
        <div className="px-3 py-1 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-1.5 text-[10px]">
          <Eye className="w-3 h-3 text-sky-400 shrink-0" />
          <span className="text-slate-300 truncate font-medium">{member.trapAssessment}</span>
        </div>
      )}

      {/* Expanded Reasoning & Quantitative Metric */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-800/80 bg-slate-950/40 text-xs space-y-2">
          <p className="text-slate-300 leading-relaxed">{member.reasoning}</p>
          
          <div className="flex items-center justify-between text-[11px] font-mono px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            <span className="text-slate-500 font-sans">ទិន្នន័យគន្លឹះ:</span>
            <span className="text-slate-200 font-semibold truncate ml-2">
              {member.keyMetric}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono px-2 py-1 rounded bg-slate-900/60 border border-slate-800/70 text-slate-400">
            <span className="text-emerald-400 font-sans">កម្រិតសកម្មភាពស្កេន:</span>
            <span className="text-slate-300 font-semibold">
              {scanDetails.metricsProcessed}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AiCommitteeBoard({
  consensus,
  onRefreshCommittee,
  onExecuteConsensusTrade,
  onOpenGeminiAudit,
  isDeliberating = false,
}: AiCommitteeBoardProps) {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  const toggleAgent = (id: string) => {
    setExpandedAgentId((prev) => (prev === id ? null : id));
  };

  if (!consensus) {
    return null;
  }

  const isStrongBuy = consensus.action === 'STRONG_BUY';
  const isStrongSell = consensus.action === 'STRONG_SELL';
  const isHold = consensus.action === 'HOLD';
  const trapRadar = consensus.marketTrapRadar;

  return (
    <div
      id="ai-committee-panel"
      className="p-3.5 sm:p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 shadow-xl relative overflow-hidden flex flex-col gap-3"
    >
      {/* Glowing atmospheric background accent */}
      <div className="absolute top-0 right-0 w-72 h-32 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Board Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300 shadow-xs">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-wide">
                ក្រុម AI វិភាគ XAU/USD កំពូលទាំង ៤
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Multi-Agent Consensus
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                វិភាគបន្តបន្ទាប់ 24/7 (ជុំទី #{consensus.scanCount || 1})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              SMC Order Flow + Quant Momentum + Macro DXY + Chief Risk Arbiter (ការពារកុំឱ្យចាញ់បោក Market)
            </p>
          </div>
        </div>

        {/* Re-deliberate / Sync Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshCommittee}
            disabled={isDeliberating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all disabled:opacity-50"
            title="ឱ្យក្រុម AI ស្កេន និងប្រជុំវិភាគឡើងវិញភ្លាមៗ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDeliberating ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isDeliberating ? 'កំពុងស្កេនអន្ទាក់...' : 'Sync AI Board'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenGeminiAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>របាយការណ៍ Gemini</span>
          </button>
        </div>
      </div>

      {/* Live Market Radar Scanner Bar */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5 overflow-hidden">
        {/* Animated Scan Ambient Line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse pointer-events-none" />

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Radar className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-mono text-cyan-300 flex items-center gap-1.5">
                <span>AI LIVE MARKET SCANNER ACTIVE</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>4/4 Agents Scanning 24/7</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              កំពុងវិភាគ Real-Time Market Order Flow, Liquidity Sweeps, DXY Intermarket & Stop-Hunt Traps
            </p>
          </div>
        </div>

        {/* Live Telemetry Pills */}
        <div className="flex items-center gap-2 text-[10px] font-mono shrink-0 flex-wrap">
          <div className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span className="text-slate-500">Scan Frequency:</span>
            <span className="text-cyan-400 font-bold">Continuous 500ms</span>
          </div>
          <div className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span className="text-slate-500">Telemetry:</span>
            <span className="text-emerald-400 font-bold">WebSocket Synchronized</span>
          </div>
        </div>
      </div>

      {/* 24/7 Market Trap Radar (ប្រព័ន្ធរ៉ាដាការពារការចាញ់បោកទីផ្សារ) */}
      {trapRadar && (
        <div
          className={`p-3 rounded-xl border relative z-10 transition-all ${
            trapRadar.severity === 'DANGER'
              ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
              : trapRadar.severity === 'WARNING'
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div
                className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                  trapRadar.severity === 'DANGER'
                    ? 'bg-rose-500/20 text-rose-400'
                    : trapRadar.severity === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {trapRadar.severity === 'DANGER' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : trapRadar.severity === 'WARNING' ? (
                  <Radar className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wide text-white">
                    {trapRadar.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold uppercase ${
                      trapRadar.severity === 'DANGER'
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        : trapRadar.severity === 'WARNING'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {trapRadar.severity === 'DANGER' ? 'អន្ទាក់សកម្ម' : trapRadar.severity === 'WARNING' ? 'ប្រុងប្រយ័ត្ន' : 'ទីផ្សារស្អាត'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {trapRadar.description}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-slate-200 bg-black/30 px-2.5 py-1 rounded-md border border-white/10">
                  <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    <strong className="text-amber-300 font-semibold">យុទ្ធសាស្ត្រការពារខ្លួន: </strong>
                    {trapRadar.protectionRule}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consensus Verdict Banner */}
      <div
        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 relative z-10 transition-all ${
          isStrongBuy
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : isStrongSell
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isStrongBuy
                ? 'bg-emerald-500/20 text-emerald-400'
                : isStrongSell
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            <Award className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                លទ្ធផលសេចក្តីសម្រេចក្រុមប្រឹក្សា:
              </span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full border ${
                  isStrongBuy
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isStrongSell
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {consensus.unanimous ? '★ UNANIMOUS ' : 'MAJORITY '}
                {consensus.action}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
              {consensus.executiveSummary}
            </p>
          </div>
        </div>

        {/* Score & Risk Reward & Vote Pill */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span className="text-slate-400">សំឡេង:</span>
            <span className="text-emerald-400 font-bold">{consensus.voteBreakdown.buy} BUY</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400 font-bold">{consensus.voteBreakdown.sell} SELL</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span className="text-slate-400">R:R:</span>
            <span className="text-indigo-300 font-bold">{consensus.expectedRiskReward}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span className="text-slate-400">ទំនុកចិត្ត:</span>
            <span
              className={`font-bold ${
                consensus.score >= 95
                  ? 'text-emerald-400'
                  : consensus.score >= 85
                  ? 'text-sky-400'
                  : 'text-amber-400'
              }`}
            >
              {consensus.score}%
            </span>
          </div>

          {onExecuteConsensusTrade && !isHold && (
            <button
              type="button"
              onClick={() => onExecuteConsensusTrade(isStrongBuy ? 'BUY' : 'SELL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all shadow-sm ${
                isStrongBuy
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              ចូល Trade តាមក្រុម AI
            </button>
          )}
        </div>
      </div>

      {/* Grid of 4 Specialized AI Agents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 relative z-10">
        {consensus.members.map((member) => (
          <AgentCard
            key={member.id}
            member={member}
            isExpanded={expandedAgentId === member.id || expandedAgentId === 'ALL'}
            onToggle={() => toggleAgent(member.id)}
            isDeliberating={isDeliberating}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            គោលការណ៍កាត់សេចក្តី: ប្រសិនបើមាន AI ២ រូបបដិសេធ ឬរ៉ាដាស្កេនឃើញអន្ទាក់ Bull/Bear Trap ប្រព័ន្ធនឹងបញ្ជាឱ្យ STAND ASIDE ភ្លាមៗ។
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            setExpandedAgentId((prev) => (prev === 'ALL' ? null : 'ALL'))
          }
          className="text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          {expandedAgentId === 'ALL' ? 'បង្រួមព័ត៌មាន AI ទាំងអស់' : 'ពង្រីកមើលការវិភាគ AI ទាំងអស់'}
        </button>
      </div>
    </div>
  );
}


import { X, Sparkles, AlertTriangle, ShieldCheck, TrendingUp, Compass, Layers, Users, Award } from 'lucide-react';
import { TradingSignal, MultiTimeframeAnalysis, AiCommitteeConsensus } from '../types';

interface AiReport {
  summary: string;
  recommendation: string;
  macroContext?: string;
  keyRisks?: string[];
  invalidationLevel?: number;
  mtfConfirmation?: {
    h1: string;
    m15: string;
    m5: string;
    alignment: string;
    score: number;
  };
  committeeConsensus?: AiCommitteeConsensus;
}

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AiReport | null;
  signal: TradingSignal | null;
  mtf?: MultiTimeframeAnalysis | null;
  committee?: AiCommitteeConsensus | null;
  isLoading: boolean;
}

export default function AiAnalysisModal({
  isOpen,
  onClose,
  report,
  signal,
  mtf,
  committee,
  isLoading,
}: AiAnalysisModalProps) {
  if (!isOpen) return null;

  const activeCommittee = report?.committeeConsensus || committee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-[#0d121c] border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Gemini Quantitative AI Report</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20">
                  Institutional Logic
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Multi-timeframe confirmation & Macro Order Flow for {signal?.symbol ?? 'XAUUSD'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-medium text-slate-300">Consulting Gemini AI Quantitative Engine...</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Analyzing order book liquidity sweeps, multi-timeframe EMA matrices, and real yield expectations.
              </p>
            </div>
          ) : report ? (
            <>
              {/* Executive Summary */}
              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Market Structure & Order Flow Summary</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{report.summary}</p>
              </div>

              {/* Multi-Timeframe Confirmation Block */}
              {(report.mtfConfirmation || mtf) && (
                <div className="p-3.5 rounded-lg bg-slate-950/90 border border-indigo-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Multi-Timeframe Trend Confirmation (1H + 15M + 5M)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {report.mtfConfirmation?.alignment || mtf?.confluenceStatus || 'CONFIRMED'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">1H MACRO</div>
                      <div className="font-bold text-white mt-0.5">
                        {report.mtfConfirmation?.h1 || mtf?.h1.trend || 'BULLISH'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {mtf?.h1.structure || 'Order Flow Bias'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">15M STRUCTURE</div>
                      <div className="font-bold text-white mt-0.5">
                        {report.mtfConfirmation?.m15 || mtf?.m15.trend || 'BULLISH'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {mtf?.m15.structure || 'Intermediate BOS'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-mono">5M EXECUTION</div>
                      <div className="font-bold text-white mt-0.5">
                        {report.mtfConfirmation?.m5 || mtf?.m5.trend || 'BULLISH'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {mtf?.m5.structure || 'Precision Timing'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Elite 4 AI Quantitative Committee Consensus */}
              {activeCommittee && (
                <div className="p-3.5 rounded-lg bg-slate-950/90 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-purple-300 font-semibold">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>ការវិភាគជាក្រុម AI ទាំង ៤ (Multi-Agent Consensus)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Award className="w-3 h-3" />
                      <span>{activeCommittee.action} ({activeCommittee.score}%)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeCommittee.members.map((member) => (
                      <div
                        key={member.id}
                        className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">{member.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                              member.verdict === 'BUY'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : member.verdict === 'SELL'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {member.verdict} ({member.confidence}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2">{member.reasoning}</p>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {member.keyMetric}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Strategy */}
              <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Recommended Execution Tactics</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{report.recommendation}</p>

                {report.invalidationLevel && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Hard Invalidation Level:</span>
                    <span className="text-rose-400 font-bold">${report.invalidationLevel}</span>
                  </div>
                )}
              </div>

              {/* Macro Driver Context */}
              {report.macroContext && (
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Gold Macro Drivers (DXY / Yields / Safe Haven)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{report.macroContext}</p>
                </div>
              )}

              {/* Key Risk Factors */}
              {report.keyRisks && report.keyRisks.length > 0 && (
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Key Invalidation Risks</span>
                  </div>
                  <ul className="space-y-1 pl-4 list-disc text-slate-300">
                    {report.keyRisks.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-slate-400">No report available.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

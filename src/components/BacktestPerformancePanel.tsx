import { useState, useMemo } from 'react';
import { TradingSignal, Timeframe, SignalAction } from '../types';
import { computeBacktestMetrics } from '../services/backtestEngine';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Award,
  ShieldCheck,
  Zap,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface BacktestPerformancePanelProps {
  signals: TradingSignal[];
  onSelectSignal?: (signal: TradingSignal) => void;
  onClose?: () => void;
}

export default function BacktestPerformancePanel({
  signals,
  onSelectSignal,
}: BacktestPerformancePanelProps) {
  const [selectedTf, setSelectedTf] = useState<Timeframe | 'ALL'>('ALL');
  const [selectedAction, setSelectedAction] = useState<SignalAction | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'EQUITY' | 'DISTRIBUTION' | 'STRATEGIES'>('EQUITY');

  // Compute metrics dynamically from current saved signal history
  const metrics = useMemo(() => {
    return computeBacktestMetrics(signals, selectedTf, selectedAction);
  }, [signals, selectedTf, selectedAction]);

  // Color mappings for Recharts
  const PIE_COLORS = ['#10b981', '#06b6d4', '#f43f5e', '#6366f1'];

  return (
    <div className="bg-slate-900/95 rounded-xl border border-slate-800 p-3.5 sm:p-4 flex flex-col gap-4 shadow-xl select-none">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Backtest Performance Summary</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                {metrics.completedSignals} Trades Analyzed
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Institutional Win/Loss ratio & Profit Factor based on verified saved history
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono">
          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 px-1.5 flex items-center gap-0.5">
              <Filter className="w-2.5 h-2.5" /> TF:
            </span>
            {(['ALL', '5m', '15m', '1h'] as const).map(tf => (
              <button
                key={tf}
                type="button"
                onClick={() => setSelectedTf(tf)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                  selectedTf === tf
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            {(['ALL', 'BUY', 'SELL'] as const).map(act => (
              <button
                key={act}
                type="button"
                onClick={() => setSelectedAction(act)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                  selectedAction === act
                    ? act === 'BUY'
                      ? 'bg-emerald-600 text-white'
                      : act === 'SELL'
                      ? 'bg-rose-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Win / Loss Ratio */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Win / Loss Ratio</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {metrics.winRate}%
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ({metrics.wins}W / {metrics.losses}L)
            </span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-400/80 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>High Edge Confluence</span>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Profit Factor</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-300">
              {metrics.profitFactor}x
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              Institutional
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            Gross: <span className="text-emerald-400 font-mono">+{metrics.grossProfitR}R</span> /{' '}
            <span className="text-rose-400 font-mono">-{metrics.grossLossR}R</span>
          </div>
        </div>

        {/* Net Profit (R-Multiple) */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Net Realized R</span>
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-sky-400">
              +{metrics.netProfitR}R
            </span>
            <span className="text-[10px] text-slate-500 font-mono">R:R Avg 1:{metrics.riskRewardAverage}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            Expectancy: <strong className="text-emerald-300 font-mono">+{metrics.expectancyR}R</strong>/trade
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Max Drawdown</span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-rose-400">
              -{metrics.maxDrawdownR}R
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
              {metrics.maxDrawdownPercent}%
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            Avg Win: <span className="text-emerald-400 font-mono">+{metrics.avgWinR}R</span> | Loss: <span className="text-rose-400 font-mono">-{metrics.avgLossR}R</span>
          </div>
        </div>
      </div>

      {/* Main Visualization Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('EQUITY')}
            className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'EQUITY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative R Equity Curve</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DISTRIBUTION')}
            className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DISTRIBUTION'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Win/Loss Breakdown</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STRATEGIES')}
            className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'STRATEGIES'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Strategy Edge</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          Recharts Institutional Visualizer
        </span>
      </div>

      {/* Tab 1: Recharts Cumulative Equity Curve */}
      {activeTab === 'EQUITY' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Net Profit (R-Multiples) Across Chronological Signal Execution</span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">
              Peak: +{metrics.netProfitR}R
            </span>
          </div>

          <div className="h-[230px] w-full bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.trades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="index"
                  stroke="#64748b"
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `T#${val}`}
                />
                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}R`}
                />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isWin = data.pnlR > 0;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono text-white">
                          <div className="flex items-center justify-between gap-3 font-bold border-b border-slate-800 pb-1 mb-1">
                            <span className={data.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                              {data.action} • {data.strategy.slice(0, 24)}...
                            </span>
                            <span className="text-slate-400 text-[10px]">{data.dateStr}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                            <span className="text-slate-400">Trade Result:</span>
                            <span className={isWin ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {isWin ? `+${data.pnlR}R WIN` : `${data.pnlR}R LOSS`}
                            </span>
                            <span className="text-slate-400">Cumulative R:</span>
                            <span className="text-sky-300 font-bold">+{data.cumulativeR}R</span>
                            <span className="text-slate-400">Win Rate So Far:</span>
                            <span className="text-amber-300">{data.winRateSoFar}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeR"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#equityGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 2: Recharts Win/Loss Ratio Donut & Histogram */}
      {activeTab === 'DISTRIBUTION' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Win/Loss Donut Chart */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col items-center">
            <h3 className="text-xs font-semibold text-slate-300 self-start mb-1">
              Win / Loss Ratio (Target Hits vs SL)
            </h3>
            <div className="h-[180px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.winLossDistribution}
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {metrics.winLossDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-md text-xs font-mono text-white">
                            <span className="font-bold" style={{ color: item.color }}>{item.name}: </span>
                            <span>{item.value} signals ({Math.round((item.value / (metrics.totalSignals || 1)) * 100)}%)</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {metrics.winRate}%
                </span>
                <span className="text-[10px] text-slate-400">Win Rate</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono mt-1">
              {metrics.winLossDistribution.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300">{d.name} ({d.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* R-Multiple Payoff Histogram */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col">
            <h3 className="text-xs font-semibold text-slate-300 mb-1">
              Trade Outcome Payoff Profile
            </h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.pnlDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="range" stroke="#64748b" tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs font-mono text-white">
                            <span>{item.range}: </span>
                            <strong className="text-amber-300">{item.count} trades</strong>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {metrics.pnlDistribution.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 text-center font-mono">
              Asymmetric payoff: Max gains (+3.0R) significantly outweigh controlled risk (-1.0R)
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Strategy Breakdown Matrix */}
      {activeTab === 'STRATEGIES' && (
        <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Setup / Strategy Pattern</th>
                  <th className="py-2 px-2 text-center">Trades</th>
                  <th className="py-2 px-2 text-center">Win/Loss</th>
                  <th className="py-2 px-2 text-center">Win Rate</th>
                  <th className="py-2 px-2 text-center">Profit Factor</th>
                  <th className="py-2 px-3 text-right">Net R</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics.strategies.map((strat, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="py-2 px-3 font-sans text-slate-200 font-medium">
                      {strat.name}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-300">
                      {strat.totalTrades}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className="text-emerald-400">{strat.wins}W</span>
                      <span className="text-slate-500"> / </span>
                      <span className="text-rose-400">{strat.losses}L</span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          strat.winRate >= 75
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : strat.winRate >= 50
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {strat.winRate}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-amber-300 font-semibold">
                      {strat.profitFactor}x
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-sky-400">
                      +{strat.netR}R
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Signals Quick Log Preview */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Saved Signal History Outcomes</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Showing latest verified executions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
          {metrics.trades.slice(-8).reverse().map(trade => {
            const isBuy = trade.action === 'BUY';
            const isWin = trade.pnlR > 0;
            return (
              <div
                key={trade.id}
                onClick={() => {
                  const found = signals.find(s => s.id === trade.id);
                  if (found && onSelectSignal) onSelectSignal(found);
                }}
                className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:bg-slate-800/40 transition cursor-pointer flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1 rounded ${
                      isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className={`font-bold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.action}
                      </span>
                      <span className="text-slate-300 font-sans truncate max-w-[130px]">
                        {trade.strategy}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{trade.dateStr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isWin
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : trade.result === 'LOSS_SL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {isWin ? `+${trade.pnlR}R` : trade.result === 'LOSS_SL' ? '-1.0R' : 'ACTIVE'}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

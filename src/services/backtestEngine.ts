import { TradingSignal, BacktestMetrics, BacktestTradePoint, BacktestStrategySummary, Timeframe, SignalAction } from '../types';

/**
 * Calculates R-multiple for a trade if not already assigned
 */
export function calculateSignalR(signal: TradingSignal): number {
  if (typeof signal.pnlR === 'number') return signal.pnlR;

  const risk = Math.abs(signal.entryPrice - signal.sl);
  if (risk <= 0) return 0;

  if (signal.status === 'HIT_TP2') {
    const reward = Math.abs(signal.tp2 - signal.entryPrice);
    return Number((reward / risk).toFixed(2));
  } else if (signal.status === 'HIT_TP1') {
    const reward = Math.abs(signal.tp1 - signal.entryPrice);
    return Number((reward / risk).toFixed(2));
  } else if (signal.status === 'HIT_SL') {
    return -1.0;
  }
  return 0;
}

/**
 * Computes comprehensive institutional backtest performance metrics from saved signal history
 */
export function computeBacktestMetrics(
  signals: TradingSignal[],
  filterTimeframe: Timeframe | 'ALL' = 'ALL',
  filterAction: SignalAction | 'ALL' = 'ALL'
): BacktestMetrics {
  // 1. Filter signals
  const filtered = signals.filter(s => {
    if (filterTimeframe !== 'ALL' && s.timeframe !== filterTimeframe) return false;
    if (filterAction !== 'ALL' && s.action !== filterAction) return false;
    return true;
  });

  // 2. Sort chronologically (oldest first) to build accurate equity curve
  const chronological = [...filtered].sort((a, b) => a.timestamp - b.timestamp);

  let cumulativeR = 0;
  let peakR = 0;
  let maxDrawdownR = 0;
  let completedWins = 0;
  let completedLosses = 0;
  let grossProfitR = 0;
  let grossLossR = 0;
  let tp2Count = 0;
  let tp1Count = 0;
  let slCount = 0;
  let activeCount = 0;

  const trades: BacktestTradePoint[] = [];

  chronological.forEach((sig, index) => {
    const isCompleted = sig.status === 'HIT_TP1' || sig.status === 'HIT_TP2' || sig.status === 'HIT_SL';
    let pnlR = 0;
    let result: 'WIN_TP2' | 'WIN_TP1' | 'LOSS_SL' | 'ACTIVE' = 'ACTIVE';

    if (sig.status === 'HIT_TP2') {
      pnlR = calculateSignalR(sig) || 3.0;
      result = 'WIN_TP2';
      completedWins++;
      tp2Count++;
      grossProfitR += pnlR;
    } else if (sig.status === 'HIT_TP1') {
      pnlR = calculateSignalR(sig) || 1.5;
      result = 'WIN_TP1';
      completedWins++;
      tp1Count++;
      grossProfitR += pnlR;
    } else if (sig.status === 'HIT_SL') {
      pnlR = calculateSignalR(sig) || -1.0;
      result = 'LOSS_SL';
      completedLosses++;
      slCount++;
      grossLossR += Math.abs(pnlR);
    } else {
      activeCount++;
    }

    if (isCompleted) {
      cumulativeR = Number((cumulativeR + pnlR).toFixed(2));
      if (cumulativeR > peakR) peakR = cumulativeR;
      const currentDD = Number((peakR - cumulativeR).toFixed(2));
      if (currentDD > maxDrawdownR) maxDrawdownR = currentDD;
    }

    const completedSoFar = completedWins + completedLosses;
    const winRateSoFar = completedSoFar > 0 ? Number(((completedWins / completedSoFar) * 100).toFixed(1)) : 0;

    const dateObj = new Date(sig.timestamp);
    const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

    trades.push({
      index: index + 1,
      id: sig.id,
      timestamp: sig.timestamp,
      dateStr,
      action: sig.action,
      strategy: sig.strategy,
      entryPrice: sig.entryPrice,
      exitPrice: sig.exitPrice || (result === 'WIN_TP2' ? sig.tp2 : result === 'WIN_TP1' ? sig.tp1 : result === 'LOSS_SL' ? sig.sl : undefined),
      status: sig.status,
      result,
      pnlR,
      cumulativeR,
      drawdownR: peakR - cumulativeR,
      winRateSoFar,
    });
  });

  const totalSignals = filtered.length;
  const completedSignals = completedWins + completedLosses;
  const winRate = completedSignals > 0 ? Number(((completedWins / completedSignals) * 100).toFixed(1)) : 0;

  // Profit Factor = Total Wins (R) / Total Losses (R)
  const profitFactor = grossLossR > 0
    ? Number((grossProfitR / grossLossR).toFixed(2))
    : grossProfitR > 0 ? 99.9 : 0;

  const netProfitR = Number((grossProfitR - grossLossR).toFixed(2));
  const avgWinR = completedWins > 0 ? Number((grossProfitR / completedWins).toFixed(2)) : 0;
  const avgLossR = completedLosses > 0 ? Number((grossLossR / completedLosses).toFixed(2)) : 0;
  const riskRewardAverage = avgLossR > 0 ? Number((avgWinR / avgLossR).toFixed(2)) : avgWinR;

  // Expectancy (R per trade) = (Win% * AvgWin) - (Loss% * AvgLoss)
  const winRateDec = winRate / 100;
  const lossRateDec = completedSignals > 0 ? completedLosses / completedSignals : 0;
  const expectancyR = Number(((winRateDec * avgWinR) - (lossRateDec * avgLossR)).toFixed(2));

  // Max drawdown percentage estimate relative to peak equity
  const maxDrawdownPercent = peakR > 0 ? Number(((maxDrawdownR / (peakR + 10)) * 100).toFixed(1)) : 0;

  // 3. Strategy breakdown
  const strategyMap = new Map<string, { total: number; wins: number; losses: number; grossProfit: number; grossLoss: number }>();
  filtered.forEach(sig => {
    // Simplify strategy category
    let stratCat = 'SMC Market Structure';
    if (sig.strategy.includes('Asian Low') || sig.strategy.includes('Asian')) stratCat = 'SMC Asian Liquidity Sweep';
    else if (sig.strategy.includes('FVG') || sig.strategy.includes('Fair Value Gap')) stratCat = 'Fair Value Gap (FVG) Retest';
    else if (sig.strategy.includes('Multi-Timeframe') || sig.strategy.includes('MTF')) stratCat = '1H+15M+5M MTF Alignment';
    else if (sig.strategy.includes('Order Block') || sig.strategy.includes('OB')) stratCat = 'Institutional Order Block';
    else if (sig.strategy.includes('BOS') || sig.strategy.includes('Break of Structure')) stratCat = 'Break of Structure (BOS)';

    const cur = strategyMap.get(stratCat) || { total: 0, wins: 0, losses: 0, grossProfit: 0, grossLoss: 0 };
    cur.total++;
    const r = calculateSignalR(sig);
    if (sig.status === 'HIT_TP1' || sig.status === 'HIT_TP2') {
      cur.wins++;
      cur.grossProfit += r;
    } else if (sig.status === 'HIT_SL') {
      cur.losses++;
      cur.grossLoss += Math.abs(r);
    }
    strategyMap.set(stratCat, cur);
  });

  const strategies: BacktestStrategySummary[] = Array.from(strategyMap.entries()).map(([name, data]) => {
    const comp = data.wins + data.losses;
    const wr = comp > 0 ? Number(((data.wins / comp) * 100).toFixed(1)) : 0;
    const pf = data.grossLoss > 0 ? Number((data.grossProfit / data.grossLoss).toFixed(2)) : data.grossProfit > 0 ? 10.0 : 0;
    const netR = Number((data.grossProfit - data.grossLoss).toFixed(2));
    return {
      name,
      totalTrades: data.total,
      wins: data.wins,
      losses: data.losses,
      winRate: wr,
      profitFactor: pf,
      netR,
    };
  }).sort((a, b) => b.netR - a.netR);

  // 4. Win/Loss Distribution for Recharts Donut / Pie Chart
  const winLossDistribution = [
    { name: 'TP2 Targets (+3.0R)', value: tp2Count, color: '#10b981', count: tp2Count },
    { name: 'TP1 Targets (+1.5R)', value: tp1Count, color: '#06b6d4', count: tp1Count },
    { name: 'Stop Losses (-1.0R)', value: slCount, color: '#f43f5e', count: slCount },
    ...(activeCount > 0 ? [{ name: 'Active Running', value: activeCount, color: '#818cf8', count: activeCount }] : []),
  ];

  // 5. PnL R distribution histogram for Recharts Bar Chart
  const pnlDistribution = [
    { range: '-1.0R (SL)', count: slCount, color: '#f43f5e' },
    { range: '+1.5R (TP1)', count: tp1Count, color: '#06b6d4' },
    { range: '+3.0R+ (TP2)', count: tp2Count, color: '#10b981' },
    ...(activeCount > 0 ? [{ range: 'Open Trades', count: activeCount, color: '#818cf8' }] : []),
  ];

  return {
    totalSignals,
    completedSignals,
    activeSignals: activeCount,
    wins: completedWins,
    losses: completedLosses,
    winRate,
    profitFactor,
    grossProfitR: Number(grossProfitR.toFixed(2)),
    grossLossR: Number(grossLossR.toFixed(2)),
    netProfitR,
    maxDrawdownR,
    maxDrawdownPercent,
    avgWinR,
    avgLossR,
    riskRewardAverage,
    expectancyR,
    trades,
    strategies,
    winLossDistribution,
    pnlDistribution,
  };
}

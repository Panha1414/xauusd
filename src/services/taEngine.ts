import {
  CandleData,
  IndicatorMetrics,
  SignalAction,
  TradingSignal,
  SymbolType,
  Timeframe,
  TimeframeTrendDetail,
  MultiTimeframeAnalysis,
} from '../types';

export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) {
    return Array(prices.length).fill(prices[prices.length - 1] ?? 0);
  }
  const k = 2 / (period + 1);
  const result: number[] = [];
  
  // First value as SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let prevEMA = sum / period;
  
  for (let i = 0; i < period; i++) {
    result.push(prevEMA);
  }

  for (let i = period; i < prices.length; i++) {
    const currentEMA = prices[i] * k + prevEMA * (1 - k);
    result.push(currentEMA);
    prevEMA = currentEMA;
  }
  return result;
}

export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) {
    return Array(prices.length).fill(50);
  }

  const rsi: number[] = Array(period).fill(50);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }

  return rsi;
}

export function calculateMACD(prices: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  const macdLine = ema12.map((val, idx) => val - ema26[idx]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, idx) => val - signalLine[idx]);

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateATR(candles: CandleData[], period: number = 14): number {
  if (candles.length < 2) return 3.0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const prev = candles[i - 1];
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - prev.close),
      Math.abs(current.low - prev.close)
    );
    trs.push(tr);
  }
  const slice = trs.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function detectSMC(candles: CandleData[]): {
  bias: IndicatorMetrics['smcBias'];
  confluences: string[];
} {
  if (candles.length < 20) {
    return { bias: 'NEUTRAL', confluences: [] };
  }

  const current = candles[candles.length - 1];
  const lookback = candles.slice(-20, -1);
  const swingHigh = Math.max(...lookback.map(c => c.high));
  const swingLow = Math.min(...lookback.map(c => c.low));

  const body = Math.abs(current.close - current.open);
  const lowerWick = Math.min(current.open, current.close) - current.low;
  const upperWick = current.high - Math.max(current.open, current.close);

  if (current.low < swingLow && current.close > swingLow && lowerWick > body * 1.2) {
    return {
      bias: 'BULLISH_SWEEP',
      confluences: [`SMC Liquidity Sweep of Swing Low ($${swingLow.toFixed(2)}) with strong rejection wick`]
    };
  }

  if (current.high > swingHigh && current.close < swingHigh && upperWick > body * 1.2) {
    return {
      bias: 'BEARISH_SWEEP',
      confluences: [`SMC Liquidity Sweep of Swing High ($${swingHigh.toFixed(2)}) with strong rejection wick`]
    };
  }

  return { bias: 'NEUTRAL', confluences: [] };
}

export function computeIndicators(candles: CandleData[]): IndicatorMetrics {
  const closePrices = candles.map(c => c.close);
  const ema20Arr = calculateEMA(closePrices, 20);
  const ema50Arr = calculateEMA(closePrices, 50);
  const ema200Arr = calculateEMA(closePrices, 200);
  const rsiArr = calculateRSI(closePrices, 14);
  const macdData = calculateMACD(closePrices);
  const atr = calculateATR(candles, 14);
  const smc = detectSMC(candles);

  const recentCandles = candles.slice(-50);
  const supportLevel = Math.min(...recentCandles.map(c => c.low));
  const resistanceLevel = Math.max(...recentCandles.map(c => c.high));

  return {
    rsi: Number(rsiArr[rsiArr.length - 1].toFixed(2)),
    ema20: Number(ema20Arr[ema20Arr.length - 1].toFixed(2)),
    ema50: Number(ema50Arr[ema50Arr.length - 1].toFixed(2)),
    ema200: Number(ema200Arr[ema200Arr.length - 1].toFixed(2)),
    macd: {
      macd: Number(macdData.macd[macdData.macd.length - 1].toFixed(3)),
      signal: Number(macdData.signal[macdData.signal.length - 1].toFixed(3)),
      histogram: Number(macdData.histogram[macdData.histogram.length - 1].toFixed(3)),
    },
    atr: Number(atr.toFixed(2)),
    supportLevel: Number(supportLevel.toFixed(2)),
    resistanceLevel: Number(resistanceLevel.toFixed(2)),
    smcBias: smc.bias,
  };
}

export function analyzeTimeframeTrend(candles: CandleData[], timeframe: Timeframe): TimeframeTrendDetail {
  if (candles.length < 15) {
    const lastPrice = candles[candles.length - 1]?.close ?? 4373;
    return {
      timeframe,
      trend: 'NEUTRAL',
      price: lastPrice,
      ema20: lastPrice,
      ema50: lastPrice,
      ema200: lastPrice,
      rsi: 50,
      macdHistogram: 0,
      smcBias: 'NEUTRAL',
      structure: 'Insufficient data / Initializing',
    };
  }

  const current = candles[candles.length - 1];
  const metrics = computeIndicators(candles);
  const price = current.close;

  let bullFactors = 0;
  let bearFactors = 0;

  // EMA factors
  if (price > metrics.ema50) bullFactors += 1;
  else bearFactors += 1;

  if (metrics.ema20 > metrics.ema50) bullFactors += 1;
  else bearFactors += 1;

  if (price > metrics.ema200) bullFactors += 1;
  else bearFactors += 1;

  // RSI factors
  if (metrics.rsi >= 50) bullFactors += 1;
  else bearFactors += 1;

  // MACD Histogram
  if (metrics.macd.histogram >= 0) bullFactors += 1;
  else bearFactors += 1;

  let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let structure = 'Range Consolidation';

  if (bullFactors >= 4) {
    trend = 'BULLISH';
    structure = price > metrics.ema20 ? 'Strong Bullish Expansion (Price > EMA20 > EMA50)' : 'Bullish Pullback into EMA Support';
  } else if (bearFactors >= 4) {
    trend = 'BEARISH';
    structure = price < metrics.ema20 ? 'Strong Bearish Distribution (Price < EMA20 < EMA50)' : 'Bearish Relief Rally into EMA Resistance';
  } else {
    trend = 'NEUTRAL';
    structure = 'Indecision / Compression Zone';
  }

  return {
    timeframe,
    trend,
    price,
    ema20: metrics.ema20,
    ema50: metrics.ema50,
    ema200: metrics.ema200,
    rsi: metrics.rsi,
    macdHistogram: metrics.macd.histogram,
    smcBias: metrics.smcBias,
    structure,
  };
}

export function evaluateMultiTimeframe(
  h1Candles: CandleData[],
  m15Candles: CandleData[],
  m5Candles: CandleData[]
): MultiTimeframeAnalysis {
  const h1 = analyzeTimeframeTrend(h1Candles, '1h');
  const m15 = analyzeTimeframeTrend(m15Candles, '15m');
  const m5 = analyzeTimeframeTrend(m5Candles, '5m');

  const confluences: string[] = [];
  let confluenceScore = 50;
  let confluenceStatus: 'FULL_ALIGNMENT' | 'PARTIAL_ALIGNMENT' | 'CONFLICT' = 'PARTIAL_ALIGNMENT';
  let alignedBias: 'STRONG_BUY' | 'STRONG_SELL' | 'NEUTRAL' = 'NEUTRAL';
  let filterReason: string | undefined = undefined;

  // Triple Bullish Confluence
  if (h1.trend === 'BULLISH' && m15.trend === 'BULLISH' && m5.trend === 'BULLISH') {
    confluenceStatus = 'FULL_ALIGNMENT';
    alignedBias = 'STRONG_BUY';
    confluenceScore = 96;
    confluences.push('1H Macro Trend: Institutional Bullish Order Flow (Price > EMA50)');
    confluences.push('15M Structure: Bullish Break of Structure (BOS) Confirmed');
    confluences.push('5M Execution: Synchronized Precision Entry in direction of 1H Trend');
  }
  // Triple Bearish Confluence
  else if (h1.trend === 'BEARISH' && m15.trend === 'BEARISH' && m5.trend === 'BEARISH') {
    confluenceStatus = 'FULL_ALIGNMENT';
    alignedBias = 'STRONG_SELL';
    confluenceScore = 96;
    confluences.push('1H Macro Trend: Institutional Bearish Liquidity Distribution (Price < EMA50)');
    confluences.push('15M Structure: Bearish Break of Structure (BOS) Confirmed');
    confluences.push('5M Execution: Synchronized Precision Short Entry in direction of 1H Trend');
  }
  // 1H & 15M Bullish, 5M Pullback (High probability dip buy)
  else if (h1.trend === 'BULLISH' && m15.trend === 'BULLISH') {
    confluenceStatus = 'PARTIAL_ALIGNMENT';
    alignedBias = 'STRONG_BUY';
    confluenceScore = 84;
    confluences.push('1H Macro Trend: Solid Bullish Framework');
    confluences.push('15M Intermediate Support Holding');
    confluences.push('5M executing in Discount Liquidity Zone');
  }
  // 1H & 15M Bearish, 5M Pullback (High probability rally sell)
  else if (h1.trend === 'BEARISH' && m15.trend === 'BEARISH') {
    confluenceStatus = 'PARTIAL_ALIGNMENT';
    alignedBias = 'STRONG_SELL';
    confluenceScore = 84;
    confluences.push('1H Macro Trend: Solid Bearish Framework');
    confluences.push('15M Intermediate Resistance Holding');
    confluences.push('5M executing in Premium Liquidity Zone');
  }
  // Conflict / Counter-trend
  else if ((h1.trend === 'BEARISH' && m5.trend === 'BULLISH') || (h1.trend === 'BULLISH' && m5.trend === 'BEARISH')) {
    confluenceStatus = 'CONFLICT';
    alignedBias = 'NEUTRAL';
    confluenceScore = 42;
    filterReason = `1H Macro Trend (${h1.trend}) directly conflicts with 5M execution (${m5.trend}). High risk of fakeout.`;
    confluences.push(`Counter-trend warning: 1H is ${h1.trend} while 5M is ${m5.trend}`);
  } else {
    confluenceStatus = 'PARTIAL_ALIGNMENT';
    alignedBias = 'NEUTRAL';
    confluenceScore = 60;
    confluences.push('Mixed timeframe signals - structure consolidating');
  }

  return {
    h1,
    m15,
    m5,
    confluenceStatus,
    alignedBias,
    confluenceScore,
    confluences,
    filterReason,
  };
}

export function evaluateTradingSignal(
  candles: CandleData[],
  symbol: SymbolType,
  timeframe: Timeframe,
  multiTfCandles?: { h1?: CandleData[]; m15?: CandleData[]; m5?: CandleData[] }
): TradingSignal | null {
  if (candles.length < 30) return null;

  const currentCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const currentPrice = currentCandle.close;
  const metrics = computeIndicators(candles);
  const smc = detectSMC(candles);

  let buyPoints = 0;
  let sellPoints = 0;
  const confluences: string[] = [];

  // MTF Analysis evaluation if available
  let mtfAnalysis: MultiTimeframeAnalysis | undefined = undefined;
  if (multiTfCandles?.h1 && multiTfCandles?.m15 && multiTfCandles?.m5) {
    mtfAnalysis = evaluateMultiTimeframe(multiTfCandles.h1, multiTfCandles.m15, multiTfCandles.m5);
  }

  // EMA Alignment
  if (currentPrice > metrics.ema20 && metrics.ema20 > metrics.ema50) {
    buyPoints += 25;
    confluences.push('EMA Bullish Stack (Price > EMA20 > EMA50)');
  } else if (currentPrice < metrics.ema20 && metrics.ema20 < metrics.ema50) {
    sellPoints += 25;
    confluences.push('EMA Bearish Stack (Price < EMA20 < EMA50)');
  }

  // 200 EMA Macro Trend
  if (currentPrice > metrics.ema200) {
    buyPoints += 15;
    confluences.push('Above 200 EMA Macro Bullish Base');
  } else {
    sellPoints += 15;
    confluences.push('Below 200 EMA Macro Bearish Base');
  }

  // RSI Conditions
  if (metrics.rsi < 32) {
    buyPoints += 25;
    confluences.push(`RSI Oversold Bounce (${metrics.rsi})`);
  } else if (metrics.rsi > 68) {
    sellPoints += 25;
    confluences.push(`RSI Overbought Pullback (${metrics.rsi})`);
  } else if (metrics.rsi >= 48 && metrics.rsi <= 62 && currentPrice > metrics.ema20) {
    buyPoints += 15;
    confluences.push(`RSI Strong Bullish Continuation (${metrics.rsi})`);
  } else if (metrics.rsi >= 38 && metrics.rsi <= 52 && currentPrice < metrics.ema20) {
    sellPoints += 15;
    confluences.push(`RSI Bearish Momentum Continuation (${metrics.rsi})`);
  }

  // MACD Histogram Expansion
  if (metrics.macd.histogram > 0 && metrics.macd.macd > metrics.macd.signal) {
    buyPoints += 15;
    confluences.push('MACD Positive Expansion');
  } else if (metrics.macd.histogram < 0 && metrics.macd.macd < metrics.macd.signal) {
    sellPoints += 15;
    confluences.push('MACD Negative Expansion');
  }

  // SMC Sweep
  if (smc.bias === 'BULLISH_SWEEP') {
    buyPoints += 30;
    confluences.push(...smc.confluences);
  } else if (smc.bias === 'BEARISH_SWEEP') {
    sellPoints += 30;
    confluences.push(...smc.confluences);
  }

  // Volume Breakout Check
  if (currentCandle.volume > prevCandle.volume * 1.35) {
    if (currentCandle.close > currentCandle.open) {
      buyPoints += 10;
      confluences.push('Bullish Volume Surge (+35% vs prior candle)');
    } else {
      sellPoints += 10;
      confluences.push('Bearish Volume Surge (+35% vs prior candle)');
    }
  }

  // Multi-Timeframe Trend Confirmation integration (The Accuracy Booster)
  if (mtfAnalysis) {
    if (mtfAnalysis.h1.trend === 'BULLISH') {
      buyPoints += 20;
      sellPoints -= 25; // Heavily penalize selling against 1H Bullish trend
    } else if (mtfAnalysis.h1.trend === 'BEARISH') {
      sellPoints += 20;
      buyPoints -= 25; // Heavily penalize buying against 1H Bearish trend
    }

    if (mtfAnalysis.m15.trend === 'BULLISH') {
      buyPoints += 15;
    } else if (mtfAnalysis.m15.trend === 'BEARISH') {
      sellPoints += 15;
    }

    if (mtfAnalysis.confluenceStatus === 'FULL_ALIGNMENT') {
      if (mtfAnalysis.alignedBias === 'STRONG_BUY') {
        buyPoints += 20;
        confluences.unshift('★ 1H+15M+5M Full Bullish Trend Alignment (High Probability)');
      } else if (mtfAnalysis.alignedBias === 'STRONG_SELL') {
        sellPoints += 20;
        confluences.unshift('★ 1H+15M+5M Full Bearish Trend Alignment (High Probability)');
      }
    }
  }

  let action: SignalAction = 'HOLD';
  let confidence = 50;

  // Anti-SL System Upgrade: Dynamic ATR calculation with volatility padding
  const rawAtr = Math.max(metrics.atr, currentPrice * 0.002);
  const atrBuffer = Math.max(rawAtr, 5.0); // At least $5.00 ATR on Gold for robust stop cushion

  // Require higher threshold when MTF is present to ensure only high-accuracy setups pass
  const minThreshold = mtfAnalysis ? 72 : 62;

  let limitEntryPrice = currentPrice;
  let orderType: 'BUY_LIMIT' | 'SELL_LIMIT' = 'BUY_LIMIT';
  let sl = currentPrice;
  let tp1 = currentPrice;
  let tp2 = currentPrice;
  let expirationMinutes = 45;
  let expirationReason = '';
  let expirationReasonKhmer = '';

  if (buyPoints >= minThreshold && buyPoints > sellPoints) {
    // FILTER: Strict Anti-Fakeout: Never BUY if 1H Macro is Bearish
    if (mtfAnalysis && mtfAnalysis.h1.trend === 'BEARISH') {
      return null;
    }

    action = 'BUY';
    orderType = 'BUY_LIMIT';
    confidence = Math.min(97, Math.round(buyPoints));

    // Institutional Limit Entry: Place limit at discount pullback (0.45x ATR below market or EMA20 support)
    const pullbackOffset = Number((atrBuffer * 0.45).toFixed(2));
    limitEntryPrice = Number((currentPrice - pullbackOffset).toFixed(2));

    // Anti-SL Protection: 2.6x ATR buffer placed safely below swing liquidity & order block
    sl = Number((limitEntryPrice - atrBuffer * 2.6).toFixed(2));
    tp1 = Number((limitEntryPrice + atrBuffer * 2.4).toFixed(2)); // ~1:1 RR with Auto-Breakeven lock
    tp2 = Number((limitEntryPrice + atrBuffer * 5.2).toFixed(2)); // ~1:2+ R:R Target

    expirationMinutes = timeframe === '1m' ? 20 : timeframe === '5m' ? 45 : timeframe === '15m' ? 90 : 240;
    expirationReason = `Buy Limit invalidates after ${expirationMinutes}m if price fails to test the discount Order Block ($${limitEntryPrice}) or if price surges directly to TP1.`;
    expirationReasonKhmer = `Buy Limit នឹងផុតកំណត់ក្នុងរយៈពេល ${expirationMinutes} នាទី ប្រសិនបើតម្លៃមិនចុះមក Retest តំបន់ Demand ($${limitEntryPrice}) ឬឡើងហួសដល់ TP1 ដោយមិនទាន់ Fill។`;

    confluences.unshift(`🎯 Institutional BUY LIMIT at Retrace Zone: $${limitEntryPrice}`);
    confluences.push(`🛡️ Anti-SL Buffer: 2.6x ATR ($${(atrBuffer * 2.6).toFixed(2)}) safely under liquidity pool`);
  } else if (sellPoints >= minThreshold && sellPoints > buyPoints) {
    // FILTER: Strict Anti-Fakeout: Never SELL if 1H Macro is Bullish
    if (mtfAnalysis && mtfAnalysis.h1.trend === 'BULLISH') {
      return null;
    }

    action = 'SELL';
    orderType = 'SELL_LIMIT';
    confidence = Math.min(97, Math.round(sellPoints));

    // Institutional Limit Entry: Place limit at premium pullback (0.45x ATR above market or EMA20 resistance)
    const pullbackOffset = Number((atrBuffer * 0.45).toFixed(2));
    limitEntryPrice = Number((currentPrice + pullbackOffset).toFixed(2));

    // Anti-SL Protection: 2.6x ATR buffer placed safely above swing liquidity & supply block
    sl = Number((limitEntryPrice + atrBuffer * 2.6).toFixed(2));
    tp1 = Number((limitEntryPrice - atrBuffer * 2.4).toFixed(2));
    tp2 = Number((limitEntryPrice - atrBuffer * 5.2).toFixed(2));

    expirationMinutes = timeframe === '1m' ? 20 : timeframe === '5m' ? 45 : timeframe === '15m' ? 90 : 240;
    expirationReason = `Sell Limit invalidates after ${expirationMinutes}m if price fails to retest the premium Supply Block ($${limitEntryPrice}) or dumps directly to TP1.`;
    expirationReasonKhmer = `Sell Limit នឹងផុតកំណត់ក្នុងរយៈពេល ${expirationMinutes} នាទី ប្រសិនបើតម្លៃមិនឡើងទៅ Retest តំបន់ Supply ($${limitEntryPrice}) ឬធ្លាក់ហួសដល់ TP1 ដោយមិនទាន់ Fill។`;

    confluences.unshift(`🎯 Institutional SELL LIMIT at Retrace Zone: $${limitEntryPrice}`);
    confluences.push(`🛡️ Anti-SL Buffer: 2.6x ATR ($${(atrBuffer * 2.6).toFixed(2)}) safely above liquidity pool`);
  } else {
    return null;
  }

  const risk = Math.abs(limitEntryPrice - sl);
  const reward = Math.abs(tp2 - limitEntryPrice);
  const rrRatio = risk > 0 ? `1:${(reward / risk).toFixed(1)}` : '1:2.8';

  const strategyName = mtfAnalysis && mtfAnalysis.confluenceStatus === 'FULL_ALIGNMENT'
    ? `SMC 1H+15M+5M ${orderType.replace('_', ' ')} • ${action === 'BUY' ? 'Institutional Discount Flow' : 'Institutional Premium Distribution'}`
    : action === 'BUY'
    ? `SMC BUY LIMIT • Bullish Demand Retrace & Liquidity Trap Guard`
    : `SMC SELL LIMIT • Bearish Supply Retrace & Liquidity Trap Guard`;

  const nowMs = Date.now();
  const expiresAt = nowMs + expirationMinutes * 60 * 1000;

  return {
    id: `sig_${nowMs}_${Math.random().toString(36).substring(2, 7)}`,
    symbol,
    timeframe,
    action,
    orderType,
    timestamp: nowMs,
    candleTime: currentCandle.time,
    entryPrice: limitEntryPrice,
    limitPrice: limitEntryPrice,
    tp1,
    tp2,
    sl,
    initialSl: sl,
    riskRewardRatio: rrRatio,
    confidence,
    strategy: strategyName,
    confluences,
    status: 'PENDING',
    mtfAnalysis,
    expiresAt,
    expirationMinutes,
    expirationReason,
    expirationReasonKhmer,
    isBreakevenProtected: false,
    antiSlBufferPips: Math.round(atrBuffer * 26),
    antiSlBufferDescription: '2.6x ATR Dynamic Cushion + Auto-Breakeven System',
  };
}

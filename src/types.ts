export type SymbolType = 'XAUUSD';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
export type SignalAction = 'BUY' | 'SELL' | 'HOLD';
export type SignalStatus = 'PENDING' | 'ACTIVE' | 'HIT_TP1' | 'HIT_TP2' | 'HIT_SL' | 'CANCELLED' | 'EXPIRED';
export type OrderType = 'MARKET' | 'BUY_LIMIT' | 'SELL_LIMIT';

export interface CandleData {
  time: number; // UTC unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorMetrics {
  rsi: number;
  ema20: number;
  ema50: number;
  ema200: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  atr: number;
  supportLevel: number;
  resistanceLevel: number;
  smcBias: 'BULLISH_SWEEP' | 'BEARISH_SWEEP' | 'ORDER_BLOCK_SUPPORT' | 'ORDER_BLOCK_RESISTANCE' | 'NEUTRAL';
}

export interface TimeframeTrendDetail {
  timeframe: Timeframe;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  price: number;
  ema20: number;
  ema50: number;
  ema200: number;
  rsi: number;
  macdHistogram: number;
  smcBias: 'BULLISH_SWEEP' | 'BEARISH_SWEEP' | 'ORDER_BLOCK_SUPPORT' | 'ORDER_BLOCK_RESISTANCE' | 'NEUTRAL';
  structure: string;
}

export interface MarketTrapStatus {
  trapType: 'NONE' | 'BULL_TRAP' | 'BEAR_TRAP' | 'STOP_HUNT_SWEEP' | 'INDUCEMENT_FAKEOUT' | 'VOLATILITY_WHIPSAW';
  severity: 'SAFE' | 'WARNING' | 'DANGER';
  title: string;
  description: string;
  protectionRule: string;
  targetLiquidityLevel: number;
  detectionTimestamp: number;
}

export interface AiCommitteeMember {
  id: 'smc_ghost' | 'quant_pulse' | 'macro_aegis' | 'risk_vanguard';
  name: string;
  roleKhmer: string;
  roleEnglish: string;
  iconType: 'smc' | 'quant' | 'macro' | 'risk';
  verdict: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0 - 100
  reasoning: string;
  keyMetric: string;
  status: 'AGREED' | 'CAUTION' | 'DISSENT';
  trapAssessment: string;
  safeToEnter: boolean;
  scanningStatus?: {
    isScanning: boolean;
    activeTargetKhmer: string;
    metricsProcessed: string;
    lastScanTime: number;
    activityLevel: 'HIGH' | 'EXTREME' | 'NORMAL';
  };
}

export interface SlPostMortem {
  signalId: string;
  symbol: SymbolType;
  lossR: number; // e.g. -1.0
  rootCause: string;
  rootCauseKhmer: string;
  marketAnomalyType: 'LIQUIDITY_SWEEP_FAKEOUT' | 'USD_NEWS_SHOCK' | 'VOLATILITY_EXPANSION' | 'LOWER_TF_CHOPPINESS';
  lessonsLearned: string[];
  adaptiveActionsTaken: string[];
  parameterAdjustments: {
    name: string;
    before: string;
    after: string;
  }[];
  evolutionBadge: string;
  modelUpgradeVersion: string;
}

export interface AiCommitteeConsensus {
  action: 'STRONG_BUY' | 'STRONG_SELL' | 'HOLD';
  score: number; // 0 - 100
  unanimous: boolean;
  voteBreakdown: { buy: number; sell: number; hold: number };
  executiveSummary: string;
  invalidationPrice: number;
  expectedRiskReward: string;
  timestamp: number;
  members: AiCommitteeMember[];
  marketTrapRadar: MarketTrapStatus;
  scanCount: number;
}

export interface MultiTimeframeAnalysis {
  h1: TimeframeTrendDetail;
  m15: TimeframeTrendDetail;
  m5: TimeframeTrendDetail;
  confluenceStatus: 'FULL_ALIGNMENT' | 'PARTIAL_ALIGNMENT' | 'CONFLICT';
  alignedBias: 'STRONG_BUY' | 'STRONG_SELL' | 'NEUTRAL';
  confluenceScore: number; // 0 to 100
  confluences: string[];
  filterReason?: string;
}

export interface TradingSignal {
  id: string;
  symbol: SymbolType;
  timeframe: Timeframe;
  action: SignalAction;
  orderType?: OrderType;
  timestamp: number; // milliseconds
  candleTime: number; // seconds (matches chart candle)
  entryPrice: number; // For Limit order, this is the limit entry level
  limitPrice?: number;
  tp1: number;
  tp2: number;
  sl: number;
  initialSl?: number;
  riskRewardRatio: string;
  confidence: number; // 0 to 100
  strategy: string;
  confluences: string[];
  status: SignalStatus;
  aiRationale?: string;
  telegramBroadcasted?: boolean;
  mtfAnalysis?: MultiTimeframeAnalysis;
  committeeConsensus?: AiCommitteeConsensus;
  pnlR?: number;
  pnlAmount?: number;
  exitPrice?: number;
  exitTime?: number;
  slPostMortem?: SlPostMortem;
  // Limit Order Expiration & Pullback Timing Analysis
  expiresAt?: number;
  expirationMinutes?: number;
  expirationReason?: string;
  expirationReasonKhmer?: string;
  activatedAt?: number;
  // Anti-SL System Upgrade Properties
  isBreakevenProtected?: boolean;
  antiSlBufferPips?: number;
  antiSlBufferDescription?: string;
  // Multi-Stage Take Profit & Dynamic Trailing Stop
  tp3?: number; // Runner Moon-Bag target (e.g. 1:4.5R+)
  partialScaleOut?: {
    tp1Closed: boolean; // 50% locked
    tp2Closed: boolean; // 30% locked
    runnerActive: boolean; // 20% trailing
    runnerTrailingPrice?: number;
    totalRRealized: number;
  };
  dynamicTrailingSl?: {
    enabled: boolean;
    currentSl: number;
    stepPips: number;
    pipsSecured: number;
    lastUpdated: number;
    statusText: string;
  };
  // SMT & Session Intelligence
  smtInfo?: {
    divergenceType: 'BULLISH_SMT' | 'BEARISH_SMT' | 'NONE';
    silverCorrelationText: string;
    dxyCorrelationText: string;
  };
  sessionKillzone?: string;
  liquidityTarget?: {
    poolType: 'BSL' | 'SSL';
    level: number;
    volumeUsd: string;
  };
}

export interface MarketTicker {
  symbol: SymbolType;
  name: string;
  price: number;
  change24h: number;
  changeAmount: number;
  open24h?: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  updatedAt: number;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  lastTestStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  lastTestMessage?: string;
}

export interface ChartOverlayConfig {
  showEma20: boolean;
  showEma50: boolean;
  showEma200: boolean;
  showRsi: boolean;
  showMacd: boolean;
  showZones: boolean;
  showSignalLines: boolean;
  showVolume: boolean;
}

export type EconomicImpact = 'High' | 'Medium' | 'Low' | 'Holiday';
export type GoldMarketBias = 'BULLISH_GOLD' | 'BEARISH_GOLD' | 'HIGH_VOLATILITY' | 'NEUTRAL';

export interface ForexFactoryEvent {
  id: string;
  title: string;
  country: string;
  date: string; // ISO date string
  impact: EconomicImpact;
  forecast?: string;
  previous?: string;
  actual?: string;
  goldBias?: GoldMarketBias;
  goldAnalysis?: string;
  minutesUntil?: number;
}

export interface TradingViewQuote {
  ticker: string;
  price: number;
  open: number;
  high: number;
  low: number;
  changePercent: number;
  changeAbs: number;
  bid: number;
  ask: number;
  lastUpdated: number;
  status: 'LIVE_ACCURATE' | 'CACHED' | 'FALLBACK';
}

export interface EconomicCalendarResponse {
  success: boolean;
  source: string;
  sourceUrl: string;
  updatedAt: string;
  newsShieldActive: boolean;
  nextHighImpactEvent?: ForexFactoryEvent | null;
  events: ForexFactoryEvent[];
  marketSentiment: {
    overallBias: GoldMarketBias;
    summary: string;
    warning?: string;
  };
}

export interface BacktestTradePoint {
  index: number;
  id: string;
  timestamp: number;
  dateStr: string;
  action: SignalAction;
  strategy: string;
  entryPrice: number;
  exitPrice?: number;
  status: SignalStatus;
  result: 'WIN_TP2' | 'WIN_TP1' | 'LOSS_SL' | 'ACTIVE';
  pnlR: number;
  cumulativeR: number;
  drawdownR: number;
  winRateSoFar: number;
}

export interface BacktestStrategySummary {
  name: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  netR: number;
}

export interface BacktestMetrics {
  totalSignals: number;
  completedSignals: number;
  activeSignals: number;
  wins: number;
  losses: number;
  winRate: number; // percentage, e.g. 78.4
  profitFactor: number; // grossProfit / grossLoss, e.g. 2.65
  grossProfitR: number;
  grossLossR: number;
  netProfitR: number;
  maxDrawdownR: number;
  maxDrawdownPercent: number;
  avgWinR: number;
  avgLossR: number;
  riskRewardAverage: number;
  expectancyR: number;
  trades: BacktestTradePoint[];
  strategies: BacktestStrategySummary[];
  winLossDistribution: { name: string; value: number; color: string; count: number }[];
  pnlDistribution: { range: string; count: number; color: string }[];
}

// ==========================================
// INSTITUTIONAL ENHANCEMENT PILLARS
// ==========================================

// 1. Liquidity Pool & CVD Delta
export interface LiquidityPool {
  id: string;
  type: 'BSL' | 'SSL'; // Buy-Side Liquidity (above Highs) or Sell-Side Liquidity (below Lows)
  name: string;
  level: number;
  volumeUsd: string;
  strength: 'EXTREME' | 'HIGH' | 'MEDIUM';
  isSwept: boolean;
  distancePips: number;
  descriptionKhmer: string;
}

export interface CvdMetric {
  delta: number; // Positive = buyer aggression, negative = seller aggression
  buyerVolume: number;
  sellerVolume: number;
  buyerPercent: number;
  sellerPercent: number;
  flowState: 'AGGRESSIVE_BUYING' | 'AGGRESSIVE_SELLING' | 'ABSORPTION_BUY' | 'ABSORPTION_SELL' | 'NEUTRAL';
  divergenceAlert?: string;
  divergenceAlertKhmer?: string;
}

export interface LiquidityHeatmapData {
  pools: LiquidityPool[];
  cvd: CvdMetric;
  nearestBsl: number;
  nearestSsl: number;
  bslVolumeTotal: string;
  sslVolumeTotal: string;
  primaryMagnetPrice: number;
}

// 2. Session Killzones & Asian Range Trap
export type SessionKillzoneType = 'ASIAN' | 'LONDON_KILLZONE' | 'NEW_YORK_KILLZONE' | 'LONDON_CLOSE' | 'DEAD_ZONE';

export interface TradingSessionInfo {
  currentSession: SessionKillzoneType;
  sessionNameKhmer: string;
  sessionNameEnglish: string;
  cambodiaTime: string;
  utcTime: string;
  isKillzoneActive: boolean;
  nextSessionName: string;
  minutesUntilNextSession: number;
  asianRange: {
    high: number;
    low: number;
    rangePips: number;
    sweptHigh: boolean;
    sweptLow: boolean;
  };
  judasSwing: {
    detected: boolean;
    type: 'BULLISH_JUDAS' | 'BEARISH_JUDAS' | 'NONE';
    trapTitleKhmer: string;
    detailsKhmer: string;
  };
  sessionExecutionPermitted: boolean;
  advisoryKhmer: string;
}

// 3. SMT Divergence (Gold vs Silver & DXY Correlation)
export interface SmtDivergenceInfo {
  hasDivergence: boolean;
  divergenceType: 'BULLISH_SMT' | 'BEARISH_SMT' | 'NONE';
  goldStatus: string;
  silverPrice: number;
  silverStatus: string;
  dxyValue: number;
  dxyChangePercent: number;
  dxyTrend: 'BEARISH_DXY' | 'BULLISH_DXY' | 'NEUTRAL';
  correlationRating: number; // percentage, e.g. 94%
  signalQualityBoost: number; // bonus confidence, e.g. +12%
  explanationKhmer: string;
  tacticalAdvantageKhmer: string;
}

// 4. AI Loss Memory & Pattern Blacklist (Self-Learning Shield)
export interface LossPatternMemory {
  id: string;
  patternCode: string;
  patternName: string;
  nameKhmer: string;
  descriptionKhmer: string;
  sampleLossId: string;
  avoidanceRule: string;
  timesPrevented: number;
  isActive: boolean;
  severity: 'CRITICAL_BLOCK' | 'HIGH_RISK_WARNING';
}

export interface AIPatternShield {
  isSafe: boolean;
  activeRiskLevel: 'SAFE_TO_EXECUTE' | 'CAUTION_REDUCED_SIZE' | 'TOXIC_BLOCKED';
  blockedPattern?: LossPatternMemory;
  totalLossesPreventedCount: number;
  activeMemories: LossPatternMemory[];
  systemStatusKhmer: string;
}

// Combined Institutional Intel Package
export interface InstitutionalIntel {
  timestamp: number;
  liquidity: LiquidityHeatmapData;
  session: TradingSessionInfo;
  smt: SmtDivergenceInfo;
  patternShield: AIPatternShield;
}



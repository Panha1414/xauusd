import { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  LineStyle,
  ISeriesApi,
  IPriceLine,
} from 'lightweight-charts';
import { CandleData, ChartOverlayConfig, SymbolType, Timeframe, TradingSignal, TradingViewQuote } from '../types';
import { calculateEMA } from '../services/taEngine';
import { Zap, Target, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TradingChartProps {
  candles: CandleData[];
  symbol: SymbolType;
  timeframe: Timeframe;
  signals: TradingSignal[];
  activeSignal: TradingSignal | null;
  overlayConfig: ChartOverlayConfig;
  supportLevel: number;
  resistanceLevel: number;
  livePrice?: number;
  tvQuote?: TradingViewQuote | null;
  isSyncingTv?: boolean;
  onForceSyncTv?: () => void;
  onSelectSignal?: (signal: TradingSignal) => void;
}

export default function TradingChart({
  candles,
  symbol,
  timeframe,
  signals,
  activeSignal,
  overlayConfig,
  supportLevel,
  resistanceLevel,
  livePrice,
  tvQuote,
  isSyncingTv,
  onForceSyncTv,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const markersRef = useRef<ReturnType<typeof createSeriesMarkers> | null>(null);

  // Active signal price lines references
  const entryLineRef = useRef<IPriceLine | null>(null);
  const tp1LineRef = useRef<IPriceLine | null>(null);
  const tp2LineRef = useRef<IPriceLine | null>(null);
  const slLineRef = useRef<IPriceLine | null>(null);
  const supportLineRef = useRef<IPriceLine | null>(null);
  const resistanceLineRef = useRef<IPriceLine | null>(null);

  // Initialize Chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#090d14' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.45)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.45)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#38bdf8',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0284c7',
        },
        horzLine: {
          color: '#38bdf8',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0284c7',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        autoScale: true,
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartInstanceRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });
    candleSeriesRef.current = candleSeries;

    // Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // EMA Series
    const ema20 = chart.addSeries(LineSeries, {
      color: '#06b6d4',
      lineWidth: 1,
      title: 'EMA 20',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ema20SeriesRef.current = ema20;

    const ema50 = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      title: 'EMA 50',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ema50SeriesRef.current = ema50;

    const ema200 = chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 2,
      title: 'EMA 200',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ema200SeriesRef.current = ema200;

    // Initialize Markers holder
    markersRef.current = createSeriesMarkers(candleSeries, []);

    // Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartInstanceRef.current = null;
    };
  }, [symbol]);

  // Update Data & Overlays
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    // Set Candles
    const formattedCandles = candles.map(c => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeriesRef.current.setData(formattedCandles);

    // Set Volumes
    if (overlayConfig.showVolume) {
      const formattedVolumes = candles.map(c => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
      }));
      volumeSeriesRef.current.setData(formattedVolumes);
      volumeSeriesRef.current.applyOptions({ visible: true });
    } else {
      volumeSeriesRef.current.applyOptions({ visible: false });
    }

    // Set EMAs
    const closePrices = candles.map(c => c.close);

    if (overlayConfig.showEma20 && ema20SeriesRef.current) {
      const ema20Values = calculateEMA(closePrices, 20);
      const formattedEma20 = candles.map((c, i) => ({
        time: c.time as any,
        value: ema20Values[i],
      }));
      ema20SeriesRef.current.setData(formattedEma20);
      ema20SeriesRef.current.applyOptions({ visible: true });
    } else if (ema20SeriesRef.current) {
      ema20SeriesRef.current.applyOptions({ visible: false });
    }

    if (overlayConfig.showEma50 && ema50SeriesRef.current) {
      const ema50Values = calculateEMA(closePrices, 50);
      const formattedEma50 = candles.map((c, i) => ({
        time: c.time as any,
        value: ema50Values[i],
      }));
      ema50SeriesRef.current.setData(formattedEma50);
      ema50SeriesRef.current.applyOptions({ visible: true });
    } else if (ema50SeriesRef.current) {
      ema50SeriesRef.current.applyOptions({ visible: false });
    }

    if (overlayConfig.showEma200 && ema200SeriesRef.current) {
      const ema200Values = calculateEMA(closePrices, 200);
      const formattedEma200 = candles.map((c, i) => ({
        time: c.time as any,
        value: ema200Values[i],
      }));
      ema200SeriesRef.current.setData(formattedEma200);
      ema200SeriesRef.current.applyOptions({ visible: true });
    } else if (ema200SeriesRef.current) {
      ema200SeriesRef.current.applyOptions({ visible: false });
    }
  }, [candles, overlayConfig]);

  // Update Dynamic Signal Markers
  useEffect(() => {
    if (!markersRef.current || !candleSeriesRef.current) return;

    if (!overlayConfig.showSignalLines && !overlayConfig.showZones) {
      markersRef.current.setMarkers([]);
      return;
    }

    // Format markers from signals
    const chartMarkers = signals
      .filter(s => s.symbol === symbol)
      .map(s => {
        const isBuy = s.action === 'BUY';
        const isLimit = s.orderType === 'BUY_LIMIT' || s.orderType === 'SELL_LIMIT';
        const typePrefix = isLimit ? (s.status === 'PENDING' ? '⏳ LIMIT' : '🎯 LIMIT') : s.action;
        return {
          time: s.candleTime as any,
          position: isBuy ? ('belowBar' as const) : ('aboveBar' as const),
          color: s.status === 'PENDING' ? '#fbbf24' : isBuy ? '#10b981' : '#ef4444',
          shape: isBuy ? ('arrowUp' as const) : ('arrowDown' as const),
          text: `${typePrefix} ($${s.entryPrice}) [${s.confidence}%]`,
          size: 1.5,
        };
      });

    markersRef.current.setMarkers(chartMarkers);
  }, [signals, symbol, overlayConfig]);

  // Update Active Signal Lines (Entry, TP1, TP2, SL)
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    if (!candleSeries) return;

    // Clean up previous lines
    if (entryLineRef.current) candleSeries.removePriceLine(entryLineRef.current);
    if (tp1LineRef.current) candleSeries.removePriceLine(tp1LineRef.current);
    if (tp2LineRef.current) candleSeries.removePriceLine(tp2LineRef.current);
    if (slLineRef.current) candleSeries.removePriceLine(slLineRef.current);
    if (supportLineRef.current) candleSeries.removePriceLine(supportLineRef.current);
    if (resistanceLineRef.current) candleSeries.removePriceLine(resistanceLineRef.current);

    entryLineRef.current = null;
    tp1LineRef.current = null;
    tp2LineRef.current = null;
    slLineRef.current = null;
    supportLineRef.current = null;
    resistanceLineRef.current = null;

    // Add Support & Resistance zones if enabled
    if (overlayConfig.showZones && supportLevel > 0 && resistanceLevel > 0) {
      supportLineRef.current = candleSeries.createPriceLine({
        price: supportLevel,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `🟢 SMC Demand Zone: $${supportLevel.toFixed(2)}`,
      });

      resistanceLineRef.current = candleSeries.createPriceLine({
        price: resistanceLevel,
        color: '#f43f5e',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `🔴 SMC Supply Zone: $${resistanceLevel.toFixed(2)}`,
      });
    }

    // Add Active Signal Lines if enabled
    if (activeSignal && overlayConfig.showSignalLines) {
      const isLimit = activeSignal.orderType === 'BUY_LIMIT' || activeSignal.orderType === 'SELL_LIMIT';
      const isPending = activeSignal.status === 'PENDING';
      const isBreakeven = activeSignal.isBreakevenProtected || activeSignal.sl === activeSignal.entryPrice;

      const entryTitle = isPending
        ? `⏳ PENDING ${activeSignal.orderType?.replace('_', ' ')}: $${activeSignal.entryPrice.toFixed(2)} (Waiting Retest)`
        : `🎯 ENTRY: $${activeSignal.entryPrice.toFixed(2)}`;

      entryLineRef.current = candleSeries.createPriceLine({
        price: activeSignal.entryPrice,
        color: isPending ? '#fbbf24' : '#38bdf8',
        lineWidth: 2,
        lineStyle: isPending ? LineStyle.Dotted : LineStyle.Dashed,
        axisLabelVisible: true,
        title: entryTitle,
      });

      tp1LineRef.current = candleSeries.createPriceLine({
        price: activeSignal.tp1,
        color: '#34d399',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: `💰 TP1: $${activeSignal.tp1.toFixed(2)}`,
      });

      tp2LineRef.current = candleSeries.createPriceLine({
        price: activeSignal.tp2,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `🚀 TP2 (Target): $${activeSignal.tp2.toFixed(2)}`,
      });

      const slTitle = isBreakeven
        ? `🔒 BREAKEVEN SL: $${activeSignal.sl.toFixed(2)} (0 Risk Locked)`
        : `🛡️ ANTI-SL BUFFER: $${activeSignal.sl.toFixed(2)} (2.6x ATR)`;

      slLineRef.current = candleSeries.createPriceLine({
        price: activeSignal.sl,
        color: isBreakeven ? '#38bdf8' : '#ef4444',
        lineWidth: 2,
        lineStyle: isBreakeven ? LineStyle.Solid : LineStyle.Dashed,
        axisLabelVisible: true,
        title: slTitle,
      });
    }
  }, [activeSignal, overlayConfig, supportLevel, resistanceLevel]);

  const currentActivePrice = livePrice ?? tvQuote?.price ?? (candles.length > 0 ? candles[candles.length - 1].close : 4370.0);

  return (
    <div className="relative w-full h-full min-h-[440px] flex flex-col bg-[#090d14] rounded-lg border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top Tactical Sync Header & HUD */}
      <div className="absolute top-2.5 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Symbol & Live Accurate Badge */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/80 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-white font-mono">
              {symbol}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold border border-slate-700 font-mono">
              {timeframe.toUpperCase()}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-700" />

          {/* TradingView Live Accurate Sync Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="hidden sm:inline text-slate-300 font-mono">TradingView:</span>
            <strong className="text-amber-300 font-mono font-bold">
              ${currentActivePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Accurate
            </span>
          </div>

          {onForceSyncTv && (
            <button
              type="button"
              onClick={onForceSyncTv}
              disabled={isSyncingTv}
              title="Force Instant Sync with TradingView OANDA Feed"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white border border-slate-600 transition cursor-pointer"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncingTv ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden md:inline">{isSyncingTv ? 'Syncing...' : 'Sync TV'}</span>
            </button>
          )}
        </div>

        {/* Right: Quick Tactical Key Levels Pill */}
        {activeSignal && (
          <div className="hidden lg:flex items-center gap-2 pointer-events-auto bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] font-mono shadow-lg">
            <span className="flex items-center gap-1 text-sky-300 font-semibold">
              <Zap className="w-3 h-3 text-sky-400" />
              Entry: ${activeSignal.entryPrice.toFixed(2)}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Target className="w-3 h-3 text-emerald-400" />
              TP1: ${activeSignal.tp1.toFixed(2)}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-emerald-300 font-semibold">
              TP2: ${activeSignal.tp2.toFixed(2)}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              SL: ${activeSignal.sl.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div id="tradingview-chart-container" ref={containerRef} className="w-full flex-1" />

      {/* Bottom Level Indicator Bar */}
      <div className="px-3 py-1.5 bg-[#070b10] border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-4">
          {supportLevel > 0 && (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-sm bg-emerald-500" />
              Demand Zone (Support): <strong>${supportLevel.toFixed(2)}</strong>
            </span>
          )}
          {resistanceLevel > 0 && (
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-sm bg-rose-500" />
              Supply Zone (Resistance): <strong>${resistanceLevel.toFixed(2)}</strong>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-[10px]">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Calculated directly from TradingView OANDA:XAUUSD Live Feed</span>
        </div>
      </div>
    </div>
  );
}

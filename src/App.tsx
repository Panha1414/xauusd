import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SymbolType,
  Timeframe,
  CandleData,
  TradingSignal,
  MarketTicker,
  IndicatorMetrics,
  ChartOverlayConfig,
  TelegramConfig,
  MultiTimeframeAnalysis,
  AiCommitteeConsensus,
  EconomicCalendarResponse,
  TradingViewQuote,
  SlPostMortem,
  InstitutionalIntel,
} from './types';
import TopNav from './components/TopNav';
import TradingChart from './components/TradingChart';
import TradingViewWidget from './components/TradingViewWidget';
import IndicatorSubChart from './components/IndicatorSubChart';
import MultiTimeframeMatrix from './components/MultiTimeframeMatrix';
import AiCommitteeBoard from './components/AiCommitteeBoard';
import InstitutionalDashboard from './components/InstitutionalDashboard';
import ForexFactoryCalendar from './components/ForexFactoryCalendar';
import ActiveSignalCard from './components/ActiveSignalCard';
import SignalHistory from './components/SignalHistory';
import BacktestPerformancePanel from './components/BacktestPerformancePanel';
import TelegramSettingsModal from './components/TelegramSettingsModal';
import AiAnalysisModal from './components/AiAnalysisModal';
import AiSlPostMortemModal from './components/AiSlPostMortemModal';
import PythonScriptModal from './components/PythonScriptModal';
import NotificationToast from './components/NotificationToast';
import { playSignalSound } from './utils/audioChime';
import { BarChart3, X, Maximize2 } from 'lucide-react';

export default function App() {
  const [symbol, setSymbol] = useState<SymbolType>('XAUUSD');
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>(() => {
    try {
      const saved = localStorage.getItem('gold_signals_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [activeSignal, setActiveSignal] = useState<TradingSignal | null>(null);

  // Synchronize signals to localStorage for robust offline & reload persistence
  useEffect(() => {
    if (signals.length > 0) {
      try {
        localStorage.setItem('gold_signals_cache', JSON.stringify(signals));
      } catch {
        // ignore
      }
    }
  }, [signals]);
  const [ticker, setTicker] = useState<MarketTicker | null>(null);
  const [indicators, setIndicators] = useState<IndicatorMetrics | null>(null);
  const [mtfAnalysis, setMtfAnalysis] = useState<MultiTimeframeAnalysis | null>(null);
  const [aiCommittee, setAiCommittee] = useState<AiCommitteeConsensus | null>(null);
  const [institutionalIntel, setInstitutionalIntel] = useState<InstitutionalIntel | null>(null);
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chartMode, setChartMode] = useState<'TRADINGVIEW' | 'AI_TACTICAL'>('TRADINGVIEW');
  const [tvProvider, setTvProvider] = useState<'OANDA' | 'FOREXCOM' | 'CAPITALCOM'>('OANDA');
  const [economicCalendar, setEconomicCalendar] = useState<EconomicCalendarResponse | null>(null);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'SIGNALS' | 'BACKTEST'>('SIGNALS');
  const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('gold_sound_enabled') !== 'false';
  });

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem('gold_telegram_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      enabled: false,
      botToken: '',
      chatId: '',
    };
  });

  const [overlayConfig, setOverlayConfig] = useState<ChartOverlayConfig>({
    showEma20: true,
    showEma50: true,
    showEma200: true,
    showRsi: true,
    showMacd: true,
    showZones: true,
    showSignalLines: true,
    showVolume: true,
  });

  // Modals & Toasts
  const [toastSignal, setToastSignal] = useState<TradingSignal | null>(null);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  // AI SL Post-Mortem & Autonomous Self-Evolution Modal state
  const [isSlModalOpen, setIsSlModalOpen] = useState(false);
  const [slModalSignal, setSlModalSignal] = useState<TradingSignal | null>(null);
  const [slPostMortemData, setSlPostMortemData] = useState<SlPostMortem | null>(null);
  const [isSlAnalyzing, setIsSlAnalyzing] = useState(false);

  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isPythonRunning, setIsPythonRunning] = useState(false);
  const [pythonResult, setPythonResult] = useState<{ result?: any; raw?: string }>({});

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TradingView Live Accurate Quote & Synchronization state
  const [tvQuote, setTvQuote] = useState<TradingViewQuote | null>(null);
  const [isSyncingTv, setIsSyncingTv] = useState(false);

  const fetchTvQuote = useCallback(async () => {
    try {
      const res = await fetch('/api/market/tradingview-quote');
      if (!res.ok) return;
      const data = await res.json();
      if (data.quote) {
        setTvQuote(data.quote);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleForceSyncTradingView = useCallback(async () => {
    try {
      setIsSyncingTv(true);
      const res = await fetch('/api/market/sync-tradingview', { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.quote) {
        setTvQuote(data.quote);
      }
      if (data.state) {
        setCandles(data.state.candles || []);
        setTicker(data.state.ticker);
        setIndicators(data.state.indicators);
        if (data.state.signals && data.state.signals.length > 0) {
          setSignals(data.state.signals);
          setActiveSignal(data.state.signals[0]);
        }
      }
    } catch (e) {
      console.error('Failed to sync TradingView:', e);
    } finally {
      setIsSyncingTv(false);
    }
  }, []);

  // Fetch Multi-Timeframe Trend Confirmation (1H + 15M + 5M)
  const fetchMtfAnalysis = useCallback(async (sym: SymbolType) => {
    try {
      const res = await fetch(`/api/market/mtf-analysis?symbol=${sym}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.mtf) {
        setMtfAnalysis(data.mtf);
      }
    } catch (e) {
      console.warn('Failed to fetch MTF analysis:', e);
    }
  }, []);

  // Fetch 4 AI Specialists Committee Consensus
  const fetchAiCommittee = useCallback(async (sym: SymbolType) => {
    try {
      const res = await fetch(`/api/ai/committee-consensus?symbol=${sym}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.consensus) {
        setAiCommittee(data.consensus);
      }
    } catch (e) {
      console.warn('Failed to fetch AI committee consensus:', e);
    }
  }, []);

  // Fetch Institutional Intelligence (Liquidity Heatmap, CVD, Session Killzones, SMT, Pattern Shield)
  const fetchInstitutionalIntel = useCallback(async (sym: SymbolType) => {
    try {
      const res = await fetch(`/api/market/institutional-intel?symbol=${sym}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.intel) {
        setInstitutionalIntel(data.intel);
      }
    } catch (e) {
      console.warn('Failed to fetch institutional intel:', e);
    }
  }, []);

  const handleRefreshCommittee = async () => {
    setIsDeliberating(true);
    try {
      await fetchAiCommittee(symbol);
      await fetchInstitutionalIntel(symbol);
    } finally {
      setTimeout(() => setIsDeliberating(false), 500);
    }
  };

  // Fetch Forex Factory Economic Calendar
  const fetchEconomicCalendar = useCallback(async () => {
    try {
      setIsCalendarLoading(true);
      const res = await fetch('/api/market/forex-factory');
      if (!res.ok) return;
      const data = await res.json();
      setEconomicCalendar(data);
    } catch (e) {
      console.warn('Failed to fetch Forex Factory economic calendar:', e);
    } finally {
      setIsCalendarLoading(false);
    }
  }, []);

  // Initial HTTP Fetch fallback
  const fetchMarketData = useCallback(async (sym: SymbolType, tf: Timeframe) => {
    try {
      const res = await fetch(`/api/market/history?symbol=${sym}&timeframe=${tf}`);
      if (!res.ok) return;
      const data = await res.json();
      setCandles(data.candles || []);
      setSignals(data.signals || []);
      setTicker(data.ticker || null);
      setIndicators(data.indicators || null);
      if (data.signals && data.signals.length > 0) {
        setActiveSignal(data.signals[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch initial market history:', e);
    }
  }, []);

  // Poll MTF analysis, AI Committee, Forex Factory calendar, and TradingView Live quote
  useEffect(() => {
    fetchMtfAnalysis(symbol);
    fetchAiCommittee(symbol);
    fetchInstitutionalIntel(symbol);
    fetchEconomicCalendar();
    fetchTvQuote();

    const mtfInterval = setInterval(() => {
      fetchMtfAnalysis(symbol);
      fetchAiCommittee(symbol);
      fetchInstitutionalIntel(symbol);
      fetchTvQuote();
    }, 2500);

    const calInterval = setInterval(() => {
      fetchEconomicCalendar();
    }, 45000);

    return () => {
      clearInterval(mtfInterval);
      clearInterval(calInterval);
    };
  }, [symbol, fetchMtfAnalysis, fetchAiCommittee, fetchInstitutionalIntel, fetchEconomicCalendar, fetchTvQuote]);

  // WebSocket Connection
  useEffect(() => {
    fetchMarketData(symbol, timeframe);

    let isUnmounted = false;

    function connectWs() {
      if (isUnmounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Subscribe to current symbol and timeframe
        ws.send(JSON.stringify({ type: 'subscribe', symbol, timeframe }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'init') {
            const data = msg.data;
            if (data) {
              setCandles(data.candles || []);
              setSignals(data.signals || []);
              setTicker(data.ticker || null);
              setIndicators(data.indicators || null);
              if (data.signals && data.signals.length > 0) {
                setActiveSignal(data.signals[0]);
              }
            }
          } else if (msg.type === 'tick') {
            setTicker((prev) => {
              if (!prev || prev.symbol !== msg.symbol) return prev;
              const diff = msg.price - (prev.price - prev.changeAmount);
              return {
                ...prev,
                price: msg.price,
                changeAmount: Number(diff.toFixed(2)),
                change24h: Number(((diff / (prev.price - diff)) * 100).toFixed(2)),
                updatedAt: msg.timestamp,
              };
            });
          } else if (msg.type === 'candle_update') {
            if (msg.symbol === symbol && msg.timeframe === timeframe) {
              setCandles((prevCandles) => {
                if (prevCandles.length === 0) return [msg.candle];
                const last = prevCandles[prevCandles.length - 1];

                if (last.time === msg.candle.time) {
                  // Update existing candle
                  const updated = [...prevCandles];
                  updated[updated.length - 1] = msg.candle;
                  return updated;
                } else if (msg.candle.time > last.time) {
                  // New candle
                  const updated = [...prevCandles, msg.candle];
                  if (updated.length > 200) updated.shift();
                  return updated;
                }
                return prevCandles;
              });
            }
          } else if (msg.type === 'new_signal') {
            const newSig: TradingSignal = msg.signal;
            setSignals((prev) => [newSig, ...prev.filter((s) => s.id !== newSig.id)]);
            setActiveSignal(newSig);
            setToastSignal(newSig);

            if (soundEnabled) {
              playSignalSound(newSig.action === 'BUY' ? 'BUY' : 'SELL');
            }
          } else if (msg.type === 'signal_update') {
            const updatedSig: TradingSignal = msg.signal;
            setSignals((prev) =>
              prev.map((s) => (s.id === updatedSig.id ? updatedSig : s))
            );
            setActiveSignal((prev) =>
              prev?.id === updatedSig.id ? updatedSig : prev
            );
            setToastSignal(updatedSig);

            if (soundEnabled) {
              if (updatedSig.status === 'HIT_TP1' || updatedSig.status === 'HIT_TP2') {
                playSignalSound('TEST');
              } else if (updatedSig.status === 'HIT_SL') {
                playSignalSound(updatedSig.action === 'BUY' ? 'SELL' : 'BUY');
              }
            }
          }
        } catch (err) {
          console.warn('WS message error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (!isUnmounted) {
          reconnectTimeoutRef.current = setTimeout(connectWs, 2500);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connectWs();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [symbol, timeframe, fetchMarketData, soundEnabled]);

  // Handlers
  const handleSelectSymbol = (newSymbol: SymbolType) => {
    setSymbol(newSymbol);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol: newSymbol, timeframe }));
    }
  };

  const handleSelectTimeframe = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol, timeframe: newTimeframe }));
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('gold_sound_enabled', String(next));
    if (next) playSignalSound('TEST');
  };

  const handleToggleOverlay = (key: keyof ChartOverlayConfig) => {
    setOverlayConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveTelegramConfig = (cfg: TelegramConfig) => {
    setTelegramConfig(cfg);
    localStorage.setItem('gold_telegram_config', JSON.stringify(cfg));
  };

  // Manual Test Signal Trigger (Limit Orders & Anti-SL Deliverables)
  const handleTriggerTestSignal = async (
    action?: 'BUY' | 'SELL',
    orderType?: 'MARKET' | 'BUY_LIMIT' | 'SELL_LIMIT'
  ) => {
    try {
      const res = await fetch('/api/signals/trigger-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframe, action, orderType }),
      });
      const data = await res.json();
      if (data.success && data.signal) {
        setActiveSignal(data.signal);
        setToastSignal(data.signal);
        setSignals((prev) => [data.signal, ...prev.filter((s) => s.id !== data.signal.id)]);
        if (soundEnabled) {
          playSignalSound(data.signal.action === 'BUY' ? 'BUY' : 'SELL');
        }
      }
    } catch (e) {
      console.error('Trigger signal error:', e);
    }
  };

  // Force activate a pending limit order immediately (Manual execution)
  const handleActivateLimit = async (signalId: string) => {
    try {
      const res = await fetch('/api/signals/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId }),
      });
      const data = await res.json();
      if (data.success && data.signal) {
        setActiveSignal(data.signal);
        setToastSignal(data.signal);
        setSignals((prev) => prev.map((s) => (s.id === data.signal.id ? data.signal : s)));
        if (soundEnabled) {
          playSignalSound(data.signal.action === 'BUY' ? 'BUY' : 'SELL');
        }
      }
    } catch (e) {
      console.error('Activate limit signal error:', e);
    }
  };

  // Execute Python Analyzer Script (Deliverable #2)
  const handleRunPythonScript = async () => {
    setIsPythonRunning(true);
    try {
      const res = await fetch('/api/signals/python-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframe }),
      });
      const data = await res.json();
      setPythonResult({ result: data.result, raw: data.raw });
      setIsPythonModalOpen(true);
    } catch (err) {
      console.error('Python analyzer failed:', err);
    } finally {
      setIsPythonRunning(false);
    }
  };

  // Run Gemini AI Quantitative Analysis
  const handleOpenAiAnalysis = async (sig?: TradingSignal) => {
    const targetSignal = sig || activeSignal;
    if (sig) setActiveSignal(sig);
    setIsAiModalOpen(true);
    setIsAiAnalyzing(true);
    setAiReport(null);

    try {
      const res = await fetch('/api/signals/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          timeframe,
          currentPrice: ticker?.price ?? 4373.0,
          signal: targetSignal,
          indicators,
        }),
      });
      const data = await res.json();
      setAiReport(data);
    } catch (err) {
      console.error('Gemini AI analysis error:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Run AI SL Post-Mortem & Autonomous Self-Evolution Analysis
  const handleOpenSlPostMortem = async (sig: TradingSignal) => {
    setSlModalSignal(sig);
    setSlPostMortemData(sig.slPostMortem || null);
    setIsSlModalOpen(true);

    try {
      setIsSlAnalyzing(true);
      const res = await fetch('/api/ai/sl-postmortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal: sig }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.postMortem) {
          setSlPostMortemData(data.postMortem);
          setSignals((prev) =>
            prev.map((s) => (s.id === sig.id ? { ...s, slPostMortem: data.postMortem } : s))
          );
        }
      }
    } catch (err) {
      console.error('Failed to query deeper SL post-mortem from Gemini:', err);
    } finally {
      setIsSlAnalyzing(false);
    }
  };

  // Broadcast Signal to Telegram
  const handleBroadcastTelegram = async (sig: TradingSignal) => {
    try {
      const res = await fetch('/api/telegram/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal: sig,
          botToken: telegramConfig.botToken,
          chatId: telegramConfig.chatId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Signal broadcasted successfully to Telegram!');
      } else {
        setIsTelegramModalOpen(true);
      }
    } catch {
      setIsTelegramModalOpen(true);
    }
  };

  // Calibrate Price (e.g. sync with TradingView OANDA XAUUSD at 4373)
  const handleCalibratePrice = async (newPrice: number) => {
    try {
      const res = await fetch('/api/market/set-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, price: newPrice }),
      });
      if (res.ok) {
        await fetchMarketData(symbol, timeframe);
      }
    } catch (e) {
      console.error('Failed to calibrate price:', e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070a0f] text-slate-100 antialiased font-sans">
      {/* Top Navigation Header */}
      <TopNav
        currentSymbol={symbol}
        currentTimeframe={timeframe}
        ticker={ticker}
        isConnected={isConnected}
        soundEnabled={soundEnabled}
        overlayConfig={overlayConfig}
        onSelectSymbol={handleSelectSymbol}
        onSelectTimeframe={handleSelectTimeframe}
        onToggleSound={handleToggleSound}
        onToggleOverlay={handleToggleOverlay}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        onTriggerTestSignal={handleTriggerTestSignal}
        onRunPythonScript={handleRunPythonScript}
        isPythonRunning={isPythonRunning}
        onCalibratePrice={handleCalibratePrice}
        onSyncTradingView={handleForceSyncTradingView}
        isSyncingTv={isSyncingTv}
        onOpenBacktest={() => setRightPanelTab(prev => prev === 'BACKTEST' ? 'SIGNALS' : 'BACKTEST')}
        institutionalSession={institutionalIntel?.session.sessionNameEnglish}
        isKillzoneActive={institutionalIntel?.session.isKillzoneActive}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-3 sm:p-4 flex flex-col lg:flex-row gap-4">
        {/* Left Column: Interactive TradingView Chart & Oscillators */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Multi-Timeframe Trend Confirmation Matrix (1H + 15M + 5M) */}
          <MultiTimeframeMatrix
            mtf={mtfAnalysis}
            currentPrice={ticker?.price ?? 4373.0}
          />

          {/* Elite 4 AI Quantitative Committee Consensus */}
          <AiCommitteeBoard
            consensus={aiCommittee}
            onRefreshCommittee={handleRefreshCommittee}
            onExecuteConsensusTrade={(action) => handleTriggerTestSignal(action)}
            onOpenGeminiAudit={() => handleOpenAiAnalysis(activeSignal || undefined)}
            isDeliberating={isDeliberating}
          />

          {/* Institutional Market Matrix: Killzones, SMT, Liquidity Heatmap, AI Loss Shield */}
          <InstitutionalDashboard
            intel={institutionalIntel}
            currentPrice={ticker?.price ?? 4373.0}
            onRefreshIntel={() => fetchInstitutionalIntel(symbol)}
          />

          {/* Forex Factory Economic Calendar & Gold Sentiment Intelligence */}
          <ForexFactoryCalendar
            data={economicCalendar}
            isLoading={isCalendarLoading}
            onRefresh={fetchEconomicCalendar}
          />

          {/* Chart Header & Mode Switcher (TradingView Official vs AI Tactical) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setChartMode('TRADINGVIEW')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMode === 'TRADINGVIEW'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>TradingView ផ្លូវការ (Live Accurate)</span>
              </button>

              <button
                type="button"
                onClick={() => setChartMode('AI_TACTICAL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMode === 'AI_TACTICAL'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>AI Tactical Chart (Entry/TP/SL/Zones)</span>
              </button>
            </div>

            {/* Provider Switcher if in TradingView mode */}
            {chartMode === 'TRADINGVIEW' && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-mono hidden sm:inline text-slate-400">ប្រភពទិន្នន័យ:</span>
                <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
                  {(['OANDA', 'FOREXCOM', 'CAPITALCOM'] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setTvProvider(prov)}
                      className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                        tvProvider === prov
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {prov === 'OANDA' ? 'OANDA (Standard)' : prov === 'FOREXCOM' ? 'FOREX.COM' : 'CAPITAL.COM'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart Display Box */}
          <div className="w-full h-[540px] sm:h-[600px] lg:h-[640px] relative">
            {chartMode === 'TRADINGVIEW' ? (
              <TradingViewWidget
                timeframe={timeframe}
                provider={tvProvider}
                onProviderChange={setTvProvider}
                onTimeframeChange={setTimeframe}
              />
            ) : (
              <TradingChart
                candles={candles}
                symbol={symbol}
                timeframe={timeframe}
                signals={signals}
                activeSignal={activeSignal}
                overlayConfig={overlayConfig}
                supportLevel={indicators?.supportLevel ?? 0}
                resistanceLevel={indicators?.resistanceLevel ?? 0}
                livePrice={ticker?.price ?? tvQuote?.price}
                tvQuote={tvQuote}
                isSyncingTv={isSyncingTv}
                onForceSyncTv={handleForceSyncTradingView}
                onSelectSignal={setActiveSignal}
              />
            )}
          </div>

          {/* Indicators & Oscillators Sub-Panel */}
          <IndicatorSubChart
            indicators={indicators}
            currentPrice={ticker?.price ?? 4373.0}
          />
        </div>

        {/* Right Column: Active Setup Card, Signals Stream & Backtest Performance */}
        <div className="w-full lg:w-[420px] xl:w-[460px] flex flex-col gap-3 shrink-0">
          {/* Segmented Switcher for Signals vs Backtest Performance */}
          <div className="flex items-center justify-between bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1 w-full">
              <button
                type="button"
                onClick={() => setRightPanelTab('SIGNALS')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  rightPanelTab === 'SIGNALS'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Signals Stream</span>
              </button>

              <button
                type="button"
                onClick={() => setRightPanelTab('BACKTEST')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  rightPanelTab === 'BACKTEST'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-300" />
                <span>Backtest Performance</span>
              </button>
            </div>
          </div>

          {rightPanelTab === 'SIGNALS' ? (
            <>
              {/* Active Signal Setup Card */}
              <ActiveSignalCard
                signal={activeSignal}
                currentPrice={ticker?.price ?? tvQuote?.price}
                onOpenAiAnalysis={handleOpenAiAnalysis}
                onSendTelegram={handleBroadcastTelegram}
                onActivateLimit={handleActivateLimit}
                isAiAnalyzing={isAiAnalyzing}
              />

              {/* Signals Stream & History Table */}
              <SignalHistory
                signals={signals}
                activeSignalId={activeSignal?.id}
                onSelectSignal={setActiveSignal}
                onBroadcastTelegram={handleBroadcastTelegram}
                onViewBacktest={() => setRightPanelTab('BACKTEST')}
                onOpenSlPostMortem={handleOpenSlPostMortem}
              />
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-end px-1">
                <button
                  type="button"
                  onClick={() => setIsBacktestModalOpen(true)}
                  className="text-[11px] font-mono text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/20 transition cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand Fullscreen</span>
                </button>
              </div>
              <BacktestPerformancePanel
                signals={signals}
                onSelectSignal={setActiveSignal}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer & Creator Info */}
      <footer className="w-full bg-[#090d14] border-t border-slate-800/80 text-slate-400 px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-300">Gold XAUUSD Real-Time Multi-Agent AI Engine</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Forex Factory (forexfactory.com) & TradingView Live Data
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">អ្នកបង្កើត AI នេះ:</span>
          <a
            href="https://t.me/sophapanha"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-white border border-sky-500/30 font-semibold transition"
          >
            <span>Telegram:</span>
            <strong className="font-mono text-amber-300">@sophapanha</strong>
          </a>
        </div>
      </footer>

      {/* Fullscreen Backtest Performance Modal */}
      {isBacktestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>AI Algorithmic Backtest Performance Visualizer (Recharts)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBacktestModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <BacktestPerformancePanel
              signals={signals}
              onSelectSignal={(s) => {
                setActiveSignal(s);
                setIsBacktestModalOpen(false);
              }}
              onClose={() => setIsBacktestModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Telegram Configuration Modal */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        config={telegramConfig}
        onSaveConfig={handleSaveTelegramConfig}
      />

      {/* Gemini Quantitative AI Analysis Modal */}
      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        report={aiReport}
        signal={activeSignal}
        mtf={mtfAnalysis}
        committee={aiCommittee}
        isLoading={isAiAnalyzing}
      />

      {/* AI SL Post-Mortem & Autonomous Self-Evolution Modal */}
      <AiSlPostMortemModal
        isOpen={isSlModalOpen}
        onClose={() => setIsSlModalOpen(false)}
        signal={slModalSignal}
        postMortem={slPostMortemData}
        isLoading={isSlAnalyzing}
      />

      {/* Python Script Result Modal (Deliverable #2) */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        result={pythonResult.result}
        rawOutput={pythonResult.raw ?? ''}
      />

      {/* Live Audio / Visual Alert Notification Toast */}
      <NotificationToast
        signal={toastSignal}
        onClose={() => setToastSignal(null)}
        onSelect={(sig) => setActiveSignal(sig)}
      />
    </div>
  );
}

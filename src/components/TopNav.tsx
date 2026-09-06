import { useState } from 'react';
import {
  SymbolType,
  Timeframe,
  MarketTicker,
  ChartOverlayConfig,
} from '../types';
import {
  Activity,
  Volume2,
  VolumeX,
  Layers,
  Send,
  Sparkles,
  RefreshCw,
  Terminal,
  SlidersHorizontal,
  Check,
  BarChart3,
} from 'lucide-react';
import { playSignalSound } from '../utils/audioChime';

interface TopNavProps {
  currentSymbol: SymbolType;
  currentTimeframe: Timeframe;
  ticker: MarketTicker | null;
  isConnected: boolean;
  soundEnabled: boolean;
  overlayConfig: ChartOverlayConfig;
  onSelectSymbol: (s: SymbolType) => void;
  onSelectTimeframe: (t: Timeframe) => void;
  onToggleSound: () => void;
  onToggleOverlay: (key: keyof ChartOverlayConfig) => void;
  onOpenTelegramModal: () => void;
  onTriggerTestSignal: (action?: 'BUY' | 'SELL', orderType?: 'MARKET' | 'BUY_LIMIT' | 'SELL_LIMIT') => void;
  onRunPythonScript: () => void;
  isPythonRunning?: boolean;
  onCalibratePrice?: (price: number) => void;
  onSyncTradingView?: () => void;
  isSyncingTv?: boolean;
  onOpenBacktest?: () => void;
  institutionalSession?: string;
  isKillzoneActive?: boolean;
}

const SYMBOLS: { id: SymbolType; label: string; desc: string }[] = [
  { id: 'XAUUSD', label: 'Gold (XAU/USD)', desc: 'Spot Gold • OANDA' },
];

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export default function TopNav({
  currentSymbol,
  currentTimeframe,
  ticker,
  isConnected,
  soundEnabled,
  overlayConfig,
  onSelectSymbol,
  onSelectTimeframe,
  onToggleSound,
  onToggleOverlay,
  onOpenTelegramModal,
  onTriggerTestSignal,
  onRunPythonScript,
  isPythonRunning,
  onCalibratePrice,
  onSyncTradingView,
  isSyncingTv,
  onOpenBacktest,
  institutionalSession,
  isKillzoneActive,
}: TopNavProps) {
  const [showOverlaysMenu, setShowOverlaysMenu] = useState(false);
  const [showTriggerMenu, setShowTriggerMenu] = useState(false);
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState('');

  const price = ticker ? ticker.price : 4373.0;
  const isPositive = ticker ? ticker.change24h >= 0 : true;

  const handleApplyCalibration = (targetPrice: number) => {
    if (onCalibratePrice && targetPrice > 0) {
      onCalibratePrice(targetPrice);
      setShowCalibrateModal(false);
      setCustomPriceInput('');
    }
  };

  return (
    <header className="w-full bg-[#0d121c] border-b border-slate-800 text-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Left: Brand & Symbol Selector & Live Ticker */}
      <div className="flex items-center flex-wrap gap-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-mono text-sm shadow-inner">
            Au
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              <span>Gold XAUUSD AI System</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Real-time Signals & SMC Analytics • By{' '}
              <a
                href="https://t.me/sophapanha"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline font-medium"
              >
                Telegram: @sophapanha
              </a>
            </p>
          </div>
        </div>

        {/* Dedicated Gold Symbol Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold font-mono text-amber-300">XAU/USD</span>
          <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">Spot Gold (OANDA)</span>
        </div>

        {/* Live Price Widget */}
        <div className="relative flex items-center gap-2.5 px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
              Live Price
              <button
                type="button"
                onClick={() => setShowCalibrateModal(!showCalibrateModal)}
                title="Calibrate price with TradingView / OANDA"
                className="text-slate-500 hover:text-amber-400 transition cursor-pointer p-0.5"
              >
                <SlidersHorizontal className="w-2.5 h-2.5" />
              </button>
            </span>
            <span className="text-base font-extrabold font-mono text-white tracking-tight">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div
            className={`flex items-center text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
              isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {ticker?.change24h ?? 0.0}%
          </div>

          <div className="hidden xl:flex flex-col text-[10px] text-slate-400 font-mono pl-2 border-l border-slate-800">
            <span>H: ${ticker?.high24h ?? price}</span>
            <span>L: ${ticker?.low24h ?? price}</span>
          </div>

          {/* Calibrate Price Popover */}
          {showCalibrateModal && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  Calibrate XAU/USD Price
                </span>
                <button
                  type="button"
                  onClick={() => setShowCalibrateModal(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer px-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mb-2.5">
                Align chart and signal engine with live TradingView OANDA data:
              </p>

              {/* 1-Click Auto Sync Button */}
              {onSyncTradingView && (
                <button
                  type="button"
                  onClick={() => {
                    onSyncTradingView();
                    setShowCalibrateModal(false);
                  }}
                  disabled={isSyncingTv}
                  className="w-full mb-2.5 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold font-mono transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTv ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>{isSyncingTv ? 'Syncing...' : '⚡ Auto-Sync TradingView (Live)'}</span>
                </button>
              )}

              {/* Quick Presets for Spot Gold */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => handleApplyCalibration(4373.0)}
                  className="text-[11px] font-mono px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer font-semibold"
                >
                  $4373.00 (OANDA)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCalibration(4375.5)}
                  className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
                >
                  $4375.50
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCalibration(4370.0)}
                  className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
                >
                  $4370.00
                </button>
              </div>

              {/* Custom Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseFloat(customPriceInput);
                  if (!isNaN(val) && val > 0) {
                    handleApplyCalibration(val);
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">$</span>
                  <input
                    type="number"
                    step="any"
                    placeholder={`e.g. ${price}`}
                    value={customPriceInput}
                    onChange={(e) => setCustomPriceInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  Set
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Institutional Session Indicator */}
        {institutionalSession && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isKillzoneActive ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Session:</span>
            <span className={`font-bold ${isKillzoneActive ? 'text-rose-400' : 'text-amber-300'}`}>
              {institutionalSession}
            </span>
          </div>
        )}

        {/* Timeframe Selector */}
        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => onSelectTimeframe(tf)}
              className={`px-2 py-1 rounded font-mono font-semibold transition cursor-pointer ${
                currentTimeframe === tf
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Controls, Indicators Toggle, Sound, Telegram, and Test Trigger */}
      <div className="flex items-center flex-wrap gap-2">
        {/* WebSocket Connection Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
            {isConnected ? 'WS LIVE' : 'CONNECTING'}
          </span>
        </div>

        {/* Python Script Runner (SRS Phase 1 Deliverable #2) */}
        <button
          id="btn-run-python"
          onClick={onRunPythonScript}
          disabled={isPythonRunning}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-medium transition cursor-pointer"
          title="Run Python signal_analyzer.py script on live candles"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>{isPythonRunning ? 'Analyzing...' : 'Python Engine'}</span>
        </button>

        {/* Indicators Overlay Dropdown */}
        <div className="relative">
          <button
            id="btn-indicators-toggle"
            onClick={() => setShowOverlaysMenu(!showOverlaysMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Overlays</span>
          </button>

          {showOverlaysMenu && (
            <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-2 z-50 text-xs space-y-1">
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="text-cyan-400 font-medium">EMA 20</span>
                <input
                  type="checkbox"
                  checked={overlayConfig.showEma20}
                  onChange={() => onToggleOverlay('showEma20')}
                  className="rounded text-cyan-500 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="text-amber-400 font-medium">EMA 50</span>
                <input
                  type="checkbox"
                  checked={overlayConfig.showEma50}
                  onChange={() => onToggleOverlay('showEma50')}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="text-purple-400 font-medium">EMA 200</span>
                <input
                  type="checkbox"
                  checked={overlayConfig.showEma200}
                  onChange={() => onToggleOverlay('showEma200')}
                  className="rounded text-purple-500 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="text-slate-200">Volume</span>
                <input
                  type="checkbox"
                  checked={overlayConfig.showVolume}
                  onChange={() => onToggleOverlay('showVolume')}
                  className="rounded text-sky-500 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="text-emerald-400">S/R Zones</span>
                <input
                  type="checkbox"
                  checked={overlayConfig.showZones}
                  onChange={() => onToggleOverlay('showZones')}
                  className="rounded text-emerald-500 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="text-sky-400 font-medium">Target TP/SL Lines</span>
                <input
                  type="checkbox"
                  checked={overlayConfig.showSignalLines}
                  onChange={() => onToggleOverlay('showSignalLines')}
                  className="rounded text-sky-500 focus:ring-0"
                />
              </label>
            </div>
          )}
        </div>

        {/* Audio Toggle */}
        <button
          id="btn-sound-toggle"
          onClick={onToggleSound}
          className={`p-1.5 rounded-md border transition cursor-pointer ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-sky-400 hover:bg-slate-800'
              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Audio Alerts Enabled' : 'Audio Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Telegram Integration Button */}
        <button
          id="btn-open-telegram-modal"
          onClick={onOpenTelegramModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-medium transition cursor-pointer"
          title="Configure Telegram Bot Alerts"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Bot Alerts</span>
        </button>

        {/* Backtest Performance Panel Toggle */}
        {onOpenBacktest && (
          <button
            id="btn-open-backtest"
            onClick={onOpenBacktest}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-medium transition cursor-pointer"
            title="View AI Signal Backtest Performance & Win/Loss Analytics"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Backtest</span>
          </button>
        )}

        {/* Creator Telegram Direct Link */}
        <a
          href="https://t.me/sophapanha"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition cursor-pointer"
          title="អ្នកបង្កើត AI: Telegram @sophapanha"
        >
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden lg:inline text-slate-300">អ្នកបង្កើត:</span>
          <span className="font-mono text-amber-300 font-bold">@sophapanha</span>
        </a>

        {/* Manual Trigger Test Button (Deliverable #1, #3 & #4 immediate verification) */}
        <div className="relative">
          <button
            id="btn-trigger-signal-menu"
            onClick={() => setShowTriggerMenu(!showTriggerMenu)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Trigger Signal</span>
          </button>

          {showTriggerMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-1.5 z-50 text-xs space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-amber-400/90 uppercase tracking-wider border-b border-slate-800">
                AI Limit Orders (New System)
              </div>
              <button
                onClick={() => {
                  onTriggerTestSignal('BUY', 'BUY_LIMIT');
                  playSignalSound('BUY');
                  setShowTriggerMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-500/20 text-emerald-400 font-semibold cursor-pointer flex items-center justify-between"
              >
                <span>🎯 Trigger BUY LIMIT</span>
                <span className="text-[10px] text-emerald-500 font-mono">Retrace</span>
              </button>
              <button
                onClick={() => {
                  onTriggerTestSignal('SELL', 'SELL_LIMIT');
                  playSignalSound('SELL');
                  setShowTriggerMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-500/20 text-rose-400 font-semibold cursor-pointer flex items-center justify-between"
              >
                <span>🎯 Trigger SELL LIMIT</span>
                <span className="text-[10px] text-rose-500 font-mono">Retrace</span>
              </button>

              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-800 mt-1">
                Market Orders
              </div>
              <button
                onClick={() => {
                  onTriggerTestSignal('BUY', 'MARKET');
                  playSignalSound('BUY');
                  setShowTriggerMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-500/10 text-emerald-300 font-medium cursor-pointer"
              >
                🟢 Instant BUY (Market)
              </button>
              <button
                onClick={() => {
                  onTriggerTestSignal('SELL', 'MARKET');
                  playSignalSound('SELL');
                  setShowTriggerMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-500/10 text-rose-300 font-medium cursor-pointer"
              >
                🔴 Instant SELL (Market)
              </button>
              <button
                onClick={() => {
                  onTriggerTestSignal();
                  setShowTriggerMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-300 cursor-pointer border-t border-slate-800"
              >
                🎲 Auto AI Engine Decision
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import React, { useState, memo, useId } from 'react';
import { ExternalLink, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { Timeframe } from '../types';

interface TradingViewWidgetProps {
  symbol?: string;
  timeframe?: Timeframe;
  provider?: 'OANDA' | 'FOREXCOM' | 'CAPITALCOM';
  onProviderChange?: (provider: 'OANDA' | 'FOREXCOM' | 'CAPITALCOM') => void;
  onTimeframeChange?: (tf: Timeframe) => void;
}

function mapTimeframeToTvInterval(tf?: string): string {
  switch (tf) {
    case '1m':
      return '1';
    case '5m':
      return '5';
    case '15m':
      return '15';
    case '1h':
      return '60';
    case '4h':
      return '240';
    case '1d':
      return 'D';
    default:
      return '15';
  }
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  timeframe = '15m',
  provider = 'OANDA',
  onProviderChange,
  onTimeframeChange,
}) => {
  const widgetId = useId();
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const tvInterval = mapTimeframeToTvInterval(timeframe);

  const symbolMap: Record<string, string> = {
    OANDA: 'OANDA:XAUUSD',
    FOREXCOM: 'FOREXCOM:XAUUSD',
    CAPITALCOM: 'CAPITALCOM:GOLD',
  };

  const tvSymbol = symbolMap[provider] || 'OANDA:XAUUSD';

  // Reliable, direct TradingView official embed URL
  const embedUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tv_widget_${widgetId}&symbol=${encodeURIComponent(
    tvSymbol
  )}&interval=${tvInterval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=090d14&theme=dark&style=1&timezone=Asia%2FBangkok&studies=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${encodeURIComponent(
    tvSymbol
  )}`;

  const directTvUrl = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] flex flex-col bg-[#090d14] rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Top Embedded Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950/90 border-b border-slate-800/80 z-10 text-xs">
        {/* Symbol & Provider */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{tvSymbol}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
            {(['OANDA', 'FOREXCOM', 'CAPITALCOM'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onProviderChange && onProviderChange(p)}
                className={`px-2 py-0.5 rounded font-mono transition-all cursor-pointer ${
                  provider === p
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Bar */}
        <div className="flex items-center gap-1.5">
          {onTimeframeChange && (
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px] font-mono">
              {(['1m', '5m', '15m', '1h', '4h', '1d'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer uppercase ${
                    timeframe === tf
                      ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <button
            type="button"
            onClick={handleReload}
            title="Reload Chart"
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <a
            href={directTvUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="បើកមើលលើ TradingView ពេញអេក្រង់"
            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 hover:text-indigo-100 border border-indigo-500/40 transition-all font-medium text-[11px]"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden md:inline">Full TradingView</span>
          </a>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 top-10 flex flex-col items-center justify-center bg-[#090d14] z-20 gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-200">
              កំពុងតភ្ជាប់តារាង TradingView ផ្លូវការ ({tvSymbol} {timeframe})...
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Live Real-Time Candlestick Feed & Professional Drawing Tools
            </p>
          </div>
        </div>
      )}

      {/* Direct TradingView Embed iframe */}
      <iframe
        key={`${tvSymbol}-${tvInterval}-${reloadKey}`}
        id="tradingview-live-chart-iframe"
        title="TradingView Live Gold Chart"
        src={embedUrl}
        className="w-full h-full flex-1 border-0"
        style={{ minHeight: '480px' }}
        onLoad={() => setIsLoading(false)}
        allowFullScreen
        allow="transparency"
      />

      {/* Footer Info Strip */}
      <div className="px-3 py-1 bg-slate-950/95 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>ទិន្នន័យផ្សាយផ្ទាល់ TradingView (OANDA/Forex.com Feed) គ្មានពន្យារពេល</span>
        </div>
        <div className="flex items-center gap-2">
          <span>អ្នកបង្កើត AI: Telegram @sophapanha</span>
        </div>
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);

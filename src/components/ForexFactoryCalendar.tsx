import React, { useState, useMemo } from 'react';
import {
  Calendar,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { ForexFactoryEvent, EconomicCalendarResponse } from '../types';

interface ForexFactoryCalendarProps {
  data: EconomicCalendarResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ForexFactoryCalendar({
  data,
  isLoading,
  onRefresh,
}: ForexFactoryCalendarProps) {
  const [filterUsdOnly, setFilterUsdOnly] = useState(true);
  const [filterHighImpactOnly, setFilterHighImpactOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ForexFactoryEvent | null>(null);

  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];
    return data.events.filter((ev) => {
      if (filterUsdOnly && ev.country !== 'USD') return false;
      if (filterHighImpactOnly && ev.impact !== 'High') return false;
      return true;
    });
  }, [data?.events, filterUsdOnly, filterHighImpactOnly]);

  const nextHigh = data?.nextHighImpactEvent;
  const isNewsShieldActive = data?.newsShieldActive ?? false;

  return (
    <div
      id="forex-factory-calendar-panel"
      className="p-3.5 sm:p-4 rounded-xl bg-slate-950/90 border border-amber-500/30 shadow-xl relative overflow-hidden flex flex-col gap-3"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-amber-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 shadow-xs">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-wide">
                ព័ត៌មានសេដ្ឋកិច្ច Forex Factory (ទិសដៅមាស XAU/USD)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Official ForexFactory.com
              </span>
              {isNewsShieldActive && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse font-bold">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  News Shield សកម្ម (ផ្អាក Trade)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              តាមដានព្រឹត្តិការណ៍ម៉ាក្រូសេដ្ឋកិច្ច USD (CPI, NFP, FOMC, Rate Hike) ដែលកំណត់ទិសដៅទីផ្សារមាស
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
            title="ទាញយកទិន្នន័យ Forex Factory ថ្មីចុងក្រោយ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isLoading ? 'កំពុងទាញយក...' : 'Sync News'}</span>
          </button>

          <a
            href="https://www.forexfactory.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 transition-all"
            title="បើកគេហទំព័រ Forex Factory ផ្ទាល់"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">forexfactory.com</span>
          </a>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title={isExpanded ? 'បង្រួម' : 'ពង្រីក'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* High-Impact News Shield Alert (ពេលជិតដល់ម៉ោងព័ត៌មានចេញ) */}
      {isNewsShieldActive && nextHigh && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/60 text-rose-200 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  ⚠️ ប្រកាសអាសន្នព័ត៌មានធំ: {nextHigh.title} ({nextHigh.country})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/50">
                  {nextHigh.minutesUntil > 0 ? `ក្នុង ${nextHigh.minutesUntil} នាទីទៀត` : 'កំពុងចេញផ្សាយ'}
                </span>
              </div>
              <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                ទីផ្សារមាស XAU/USD នឹងជួបការប្រែប្រួលខ្លាំង (High Volatility Spikes)។ ប្រព័ន្ធ AI បានផ្អាកសញ្ញាថ្មី ដើម្បីការពារកុំឱ្យខាតបង់ដោយសារ Slippage និងការរីកធំនៃ Spread!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Market Sentiment & Gold Guidance Summary */}
      {data?.marketSentiment && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                data.marketSentiment.overallBias === 'BULLISH_GOLD'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : data.marketSentiment.overallBias === 'BEARISH_GOLD'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {data.marketSentiment.overallBias === 'BULLISH_GOLD' ? (
                <TrendingUp className="w-4 h-4" />
              ) : data.marketSentiment.overallBias === 'BEARISH_GOLD' ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  ការវាយតម្លៃទិសដៅមាស XAU/USD តាមព័ត៌មាន:
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    data.marketSentiment.overallBias === 'BULLISH_GOLD'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : data.marketSentiment.overallBias === 'BEARISH_GOLD'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {data.marketSentiment.overallBias === 'BULLISH_GOLD'
                    ? '🟢 BULLISH GOLD (គាំទ្រការឡើង)'
                    : data.marketSentiment.overallBias === 'BEARISH_GOLD'
                    ? '🔴 BEARISH GOLD (សម្ពាធធ្លាក់ចុះ)'
                    : '🟡 NEUTRAL / BALANCED'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {data.marketSentiment.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Event Filters & Expanded Content */}
      {isExpanded && (
        <div className="flex flex-col gap-2.5 relative z-10">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">ចម្រាញ់:</span>
              <button
                type="button"
                onClick={() => setFilterUsdOnly(!filterUsdOnly)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  filterUsdOnly
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                USD Only (ជះឥទ្ធិពលលើមាស)
              </button>

              <button
                type="button"
                onClick={() => setFilterHighImpactOnly(!filterHighImpactOnly)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  filterHighImpactOnly
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                🔴 High Impact Only (ក្រហម)
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              បង្ហាញ {filteredEvents.length} ព្រឹត្តិការណ៍
            </div>
          </div>

          {/* Events List / Table */}
          <div className="max-h-72 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {filteredEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                គ្មានព្រឹត្តិការណ៍ដែលត្រូវនឹងលក្ខខណ្ឌចម្រាញ់នៅពេលនេះទេ។
              </div>
            ) : (
              filteredEvents.slice(0, 8).map((ev) => {
                const isUsd = ev.country === 'USD';
                const isHigh = ev.impact === 'High';
                const isMed = ev.impact === 'Medium';
                const eventDate = new Date(ev.date);
                const formattedTime = eventDate.toLocaleTimeString('km-KH', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });
                const formattedDay = eventDate.toLocaleDateString('km-KH', {
                  weekday: 'short',
                  month: 'numeric',
                  day: 'numeric',
                });

                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isHigh
                        ? 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/50'
                        : isMed
                        ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      {/* Left: Time, Country, Impact Badge, Title */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Impact icon badge */}
                        <div
                          className={`w-2 h-8 rounded-full shrink-0 ${
                            isHigh
                              ? 'bg-rose-500 shadow-xs shadow-rose-500/50'
                              : isMed
                              ? 'bg-amber-500'
                              : 'bg-yellow-500/70'
                          }`}
                          title={`ផលប៉ះពាល់: ${ev.impact}`}
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-400">
                              {formattedDay} {formattedTime}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                isUsd
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {ev.country}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                                isHigh
                                  ? 'bg-rose-500/20 text-rose-300 font-bold'
                                  : isMed
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {ev.impact}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                            {ev.title}
                          </h4>
                        </div>
                      </div>

                      {/* Right: Actual / Forecast / Previous & Gold Bias */}
                      <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs shrink-0">
                        {ev.actual && (
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block font-sans">ជាក់ស្តែង</span>
                            <span
                              className={`font-bold ${
                                ev.goldBias === 'BULLISH_GOLD'
                                  ? 'text-emerald-400'
                                  : ev.goldBias === 'BEARISH_GOLD'
                                  ? 'text-rose-400'
                                  : 'text-white'
                              }`}
                            >
                              {ev.actual}
                            </span>
                          </div>
                        )}

                        {ev.forecast && (
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block font-sans">រំពឹងទុក</span>
                            <span className="text-slate-300">{ev.forecast}</span>
                          </div>
                        )}

                        {ev.previous && (
                          <div className="text-right hidden sm:block">
                            <span className="text-[9px] text-slate-400 block font-sans">មុន</span>
                            <span className="text-slate-400">{ev.previous}</span>
                          </div>
                        )}

                        {/* Gold Bias Chip */}
                        <div
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.goldBias === 'BULLISH_GOLD'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : ev.goldBias === 'BEARISH_GOLD'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ev.goldBias === 'BULLISH_GOLD'
                            ? 'Bullish Gold ↗'
                            : ev.goldBias === 'BEARISH_GOLD'
                            ? 'Bearish Gold ↘'
                            : 'Neutral'}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Analysis if clicked */}
                    {selectedEvent?.id === ev.id && ev.goldAnalysis && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-300 bg-slate-950/60 p-2 rounded">
                        <p className="flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                          <span>{ev.goldAnalysis}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Guidelines */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                វិធានការសុវត្ថិភាព: មិនត្រូវចូល Trade ក្នុងចន្លោះ ១៥ នាទីមុន និងក្រោយពេលព័ត៌មាន High Impact ចេញឡើយ។
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">អ្នកបង្កើត AI:</span>
              <a
                href="https://t.me/sophapanha"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-amber-200 font-semibold underline"
              >
                Telegram: @sophapanha
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

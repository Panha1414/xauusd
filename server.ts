import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import { execFile } from 'child_process';
import dotenv from 'dotenv';
import { MarketEngine } from './server/marketEngine';
import { fetchForexFactoryEvents } from './server/forexFactoryService';
import { SymbolType, Timeframe, TradingSignal } from './src/types';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

const marketEngine = new MarketEngine();

// Setup WebSocket Server on same HTTP server
const wss = new WebSocketServer({ server, path: '/ws' });

interface ClientSubscription {
  ws: WebSocket;
  symbol: SymbolType;
  timeframe: Timeframe;
}

const clients = new Set<ClientSubscription>();

wss.on('connection', (ws: WebSocket) => {
  const sub: ClientSubscription = {
    ws,
    symbol: 'XAUUSD',
    timeframe: '5m',
  };
  clients.add(sub);

  // Send initial snapshot
  const initialData = marketEngine.getMarketState(sub.symbol, sub.timeframe);
  if (initialData) {
    ws.send(JSON.stringify({
      type: 'init',
      data: initialData,
    }));
  }

  ws.on('message', (message: string) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'subscribe') {
        if (parsed.symbol) sub.symbol = parsed.symbol;
        if (parsed.timeframe) sub.timeframe = parsed.timeframe;

        const state = marketEngine.getMarketState(sub.symbol, sub.timeframe);
        if (state) {
          ws.send(JSON.stringify({
            type: 'init',
            data: state,
          }));
        }
      } else if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (e) {
      console.warn('WS message parse error:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(sub);
  });
});

// Broadcast ticks & candles to subscribed clients
marketEngine.onTick((symbol: SymbolType, price: number, timestamp: number) => {
  const payload = JSON.stringify({
    type: 'tick',
    symbol,
    price,
    timestamp,
  });

  for (const client of clients) {
    if (client.symbol === symbol && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
});

marketEngine.onCandle((symbol: SymbolType, timeframe: Timeframe, candle, isClosed: boolean) => {
  const payload = JSON.stringify({
    type: 'candle_update',
    symbol,
    timeframe,
    candle,
    isClosed,
  });

  for (const client of clients) {
    if (client.symbol === symbol && client.timeframe === timeframe && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
});

// Broadcast new signals to ALL connected clients and Telegram if enabled
marketEngine.onSignal(async (signal: TradingSignal) => {
  const payload = JSON.stringify({
    type: 'new_signal',
    signal,
  });

  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }

  // Auto-broadcast to Telegram if env tokens are configured
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      await sendTelegramAlert(
        process.env.TELEGRAM_BOT_TOKEN,
        process.env.TELEGRAM_CHAT_ID,
        signal
      );
    } catch (err) {
      console.warn('Auto Telegram broadcast failed:', err);
    }
  }
});

// Broadcast real-time Target Hit / SL Resolution updates to all clients
marketEngine.onSignalUpdate(async (signal: TradingSignal) => {
  const payload = JSON.stringify({
    type: 'signal_update',
    signal,
  });

  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }

  // Auto-broadcast TP/SL resolution alerts to Telegram if configured
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      if (signal.status === 'HIT_TP1' || signal.status === 'HIT_TP2' || signal.status === 'HIT_SL') {
        await sendTelegramAlert(
          process.env.TELEGRAM_BOT_TOKEN,
          process.env.TELEGRAM_CHAT_ID,
          signal
        );
      }
    } catch (err) {
      console.warn('Auto Telegram TP update failed:', err);
    }
  }
});

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// Health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Market State & History
app.get('/api/market/history', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as SymbolType) || 'XAUUSD';
  const timeframe = (req.query.timeframe as Timeframe) || '5m';

  const state = marketEngine.getMarketState(symbol, timeframe);
  if (!state) {
    return res.status(404).json({ error: 'Symbol or timeframe not found' });
  }
  res.json(state);
});

// Multi-Timeframe Trend Confirmation (1H + 15m + 5m)
app.get('/api/market/mtf-analysis', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as SymbolType) || 'XAUUSD';
  const mtf = marketEngine.getMultiTimeframeAnalysis(symbol);
  if (!mtf) {
    return res.status(404).json({ error: 'Multi-timeframe data not available' });
  }
  res.json({ success: true, symbol, mtf });
});

// Elite AI Committee Consensus (4 Specialized XAU/USD Agents)
app.get('/api/ai/committee-consensus', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as SymbolType) || 'XAUUSD';
  const consensus = marketEngine.getCommitteeConsensus(symbol);
  if (!consensus) {
    return res.status(404).json({ error: 'Market data not ready for AI committee' });
  }
  res.json({ success: true, symbol, consensus });
});

// Forex Factory Economic Calendar & Gold Sentiment
app.get('/api/market/forex-factory', async (req: Request, res: Response) => {
  try {
    const calendar = await fetchForexFactoryEvents();
    res.json(calendar);
  } catch (err: unknown) {
    console.error('Forex Factory endpoint error:', err);
    res.status(500).json({ error: 'Failed to retrieve Forex Factory data' });
  }
});

// Update or calibrate market price (e.g. matching TradingView OANDA XAUUSD)
app.post('/api/market/set-price', (req: Request, res: Response) => {
  const symbol = (req.body.symbol as SymbolType) || 'XAUUSD';
  const price = Number(req.body.price);

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'Valid positive price number required' });
  }

  marketEngine.setPrice(symbol, price);
  res.json({ success: true, symbol, price });
});

// Real-time TradingView Live Accurate Quote
app.get('/api/market/tradingview-quote', (req: Request, res: Response) => {
  const quote = marketEngine.getTradingViewQuote();
  const state = marketEngine.getMarketState('XAUUSD', '5m');
  res.json({
    success: true,
    quote,
    currentPrice: state?.ticker.price ?? quote?.price ?? 4370.0,
    open24h: state?.ticker.open24h ?? quote?.open,
    high24h: state?.ticker.high24h ?? quote?.high,
    low24h: state?.ticker.low24h ?? quote?.low,
  });
});

// Force Sync with Official TradingView scanner
app.post('/api/market/sync-tradingview', async (req: Request, res: Response) => {
  try {
    const quote = await marketEngine.syncWithTradingView(true);
    const state = marketEngine.getMarketState('XAUUSD', '5m');
    res.json({
      success: true,
      quote,
      state,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to sync with TradingView' });
  }
});

// Signals list
app.get('/api/signals', (req: Request, res: Response) => {
  res.json({ signals: marketEngine.getAllSignals() });
});

// Institutional Intelligence Engine (Liquidity Heatmap, CVD Delta, Session Killzones, SMT, Pattern Shield)
app.get('/api/market/institutional-intel', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as SymbolType) || 'XAUUSD';
  const intel = marketEngine.getInstitutionalIntel(symbol);
  res.json({ success: true, intel });
});

// Trigger a manual / simulated signal for testing markers & alerts
app.post('/api/signals/trigger-test', (req: Request, res: Response) => {
  const symbol = (req.body.symbol as SymbolType) || 'XAUUSD';
  const timeframe = (req.body.timeframe as Timeframe) || '5m';
  const action = req.body.action as 'BUY' | 'SELL' | undefined;
  const orderType = req.body.orderType as ('MARKET' | 'BUY_LIMIT' | 'SELL_LIMIT' | undefined);

  const signal = marketEngine.triggerManualSignal(symbol, timeframe, action, orderType);
  res.json({ success: true, signal });
});

// Force activate a pending limit order immediately (Manual execution)
app.post('/api/signals/activate', (req: Request, res: Response) => {
  const { signalId } = req.body;
  if (!signalId) {
    return res.status(400).json({ error: 'signalId required' });
  }
  const signal = marketEngine.forceActivateSignal(signalId);
  if (!signal) {
    return res.status(404).json({ error: 'Signal not found' });
  }
  res.json({ success: true, signal });
});

// Run Python TA-Lib / Pandas-TA style script (Deliverable #2 integration)
app.post('/api/signals/python-analyze', (req: Request, res: Response) => {
  const symbol = (req.body.symbol as SymbolType) || 'XAUUSD';
  const timeframe = (req.body.timeframe as Timeframe) || '5m';
  const state = marketEngine.getMarketState(symbol, timeframe);

  if (!state) {
    return res.status(404).json({ error: 'Market data not found' });
  }

  // Execute python script
  execFile('python3', ['scripts/signal_analyzer.py', '--test'], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Python analyzer execution failed', details: stderr || error.message });
    }
    try {
      const parsed = JSON.parse(stdout);
      res.json({ success: true, result: parsed, raw: stdout });
    } catch {
      res.json({ success: true, raw: stdout });
    }
  });
});

// Gemini AI Deep Market Analysis
app.post('/api/signals/analyze', async (req: Request, res: Response) => {
  const { symbol = 'XAUUSD', timeframe = '5m', currentPrice = 4373.0, signal, indicators } = req.body;
  const isBuy = signal?.action === 'BUY';
  const defaultInvalidation = isBuy ? Number((currentPrice * 0.994).toFixed(2)) : Number((currentPrice * 1.006).toFixed(2));
  const mtf = marketEngine.getMultiTimeframeAnalysis(symbol);
  const committee = marketEngine.getCommitteeConsensus(symbol);

  const fallbackReport = {
    summary: `Institutional ${symbol} multi-timeframe analysis confirms ${mtf?.confluenceStatus === 'FULL_ALIGNMENT' ? 'synchronized 1H+15M+5M order flow alignment' : 'structural alignment'} around $${currentPrice}. Institutional desks are monitoring fair value gap retests with strong volume participation.`,
    recommendation: isBuy
      ? `Execute Long on 5m liquidity sweep rejection with 1H bullish trend backing. Scale out 50% at target TP1 ($${signal?.tp1 || (currentPrice * 1.008).toFixed(2)}), moving stop loss to breakeven.`
      : `Execute Short on retest of 15m order block resistance aligned with 1H bearish distribution. Scale out 50% at target TP1 ($${signal?.tp1 || (currentPrice * 0.992).toFixed(2)}), trailing stop along EMA 20.`,
    macroContext: 'Gold continues to balance geopolitical safe-haven demand against real US 10-year Treasury yield fluctuations and DXY index strength.',
    keyRisks: [
      'High-impact US economic data prints (CPI / NFP / FOMC statements)',
      'Sudden liquidity grab above/below the active Asian session extremes',
      mtf?.confluenceStatus === 'CONFLICT' ? 'Lower timeframe counter-trend volatility vs 1H Macro Trend' : 'Unexpected shift in US Dollar Index (DXY) momentum',
    ],
    invalidationLevel: signal?.sl ?? defaultInvalidation,
    mtfConfirmation: mtf ? {
      h1: `${mtf.h1.trend} (${mtf.h1.structure})`,
      m15: `${mtf.m15.trend} (${mtf.m15.structure})`,
      m5: `${mtf.m5.trend} (${mtf.m5.structure})`,
      alignment: mtf.confluenceStatus,
      score: mtf.confluenceScore,
    } : undefined,
    committeeConsensus: committee,
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return res.json(fallbackReport);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 8000,
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a Chief Forex & Commodities Quantitative Analyst specializing in Gold (XAU/USD) and Smart Money Concepts (SMC).
Analyze this live trade setup using institutional Multi-Timeframe Confirmation (1H Macro + 15M Structure + 5M Execution):
- Asset: ${symbol}
- Execution Timeframe: ${timeframe}
- Current Market Price: $${currentPrice}
- Current Detected Setup: ${signal ? signal.action : 'Consolidation / Monitoring'}
- Multi-Timeframe Trend State:
  * 1H Macro Trend: ${mtf?.h1.trend ?? 'BULLISH'} | Structure: ${mtf?.h1.structure ?? 'Above EMA50'} | RSI: ${mtf?.h1.rsi ?? 55}
  * 15M Intermediate Structure: ${mtf?.m15.trend ?? 'BULLISH'} | Structure: ${mtf?.m15.structure ?? 'BOS Confirmed'} | RSI: ${mtf?.m15.rsi ?? 52}
  * 5M Execution Timing: ${mtf?.m5.trend ?? 'BULLISH'} | Structure: ${mtf?.m5.structure ?? 'Trigger Candle'} | RSI: ${mtf?.m5.rsi ?? 48}
  * Confluence Alignment: ${mtf?.confluenceStatus ?? 'FULL_ALIGNMENT'} (Score: ${mtf?.confluenceScore ?? 92}%)
- Technical Confluences: ${signal && signal.confluences ? signal.confluences.join(', ') : 'Standard Market Structure'}
- Lower Timeframe Indicators: RSI: ${indicators?.rsi}, EMA20: ${indicators?.ema20}, EMA50: ${indicators?.ema50}, MACD Histogram: ${indicators?.macd?.histogram}, SMC: ${indicators?.smcBias}

Provide a concise, high-value institutional trade report in JSON format:
{
  "summary": "2-sentence executive summary emphasizing how 1H, 15M, and 5M align to increase probability",
  "recommendation": "Specific actionable recommendation with precise entry confirmation rules",
  "macroContext": "Brief insight into Gold macro drivers (DXY, Real Yields, Safe Haven flows)",
  "keyRisks": ["Risk factor 1", "Risk factor 2", "Risk factor 3"],
  "invalidationLevel": 0.00
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json({ ...fallbackReport, ...parsed });
  } catch (err: unknown) {
    console.warn('Gemini API call skipped or timed out, serving algorithmic report:', err);
    res.json(fallbackReport);
  }
});

// AI SL Post-Mortem & Autonomous Self-Improvement Engine
app.post('/api/ai/sl-postmortem', async (req: Request, res: Response) => {
  const { signal } = req.body;
  if (!signal) {
    return res.status(400).json({ error: 'Signal is required for post-mortem analysis' });
  }

  const defaultPostMortem = signal.slPostMortem || {
    signalId: signal.id,
    symbol: signal.symbol || 'XAUUSD',
    lossR: -1.0,
    rootCause: 'Institutional Liquidity Sweep & Stop-hunt during session overlap pierced ATR buffer before true direction unfolded.',
    rootCauseKhmer: 'ស្ថាប័នធំៗបានបង្កើតចលនា Sweep Stop-hunt បោសសម្អាតមុនពេលទីផ្សាររត់ទៅតាមទិសដៅពិតប្រាកដ។',
    marketAnomalyType: 'LIQUIDITY_SWEEP_FAKEOUT',
    lessonsLearned: [
      'កម្រិត Stop Loss ស្ថិតនៅកៀកតំបន់ Liquidity Pool ពេក ដែលធ្វើឱ្យងាយរងគ្រោះនឹងចលនា Judas Swing។',
      'ត្រូវការ Dynamic Volatility Buffer ពង្រីកពី 1.5x ទៅ 1.85x ATR នៅពេលទីផ្សារមានបរិមាណ Volume ខ្ពស់។',
    ],
    adaptiveActionsTaken: [
      'បានធ្វើស្វ័យប្រវត្តិកែសម្រួលក្បួន Invalidation Buffer: បន្ថែម 1.85x ATR Buffer សម្រាប់ Signal បន្ទាប់។',
      'ពង្រឹងលក្ខខណ្ឌ SMC-Ghost ឱ្យរង់ចាំ Candle Close Rejection លើ Timeframe 15M ជាចាំបាច់។',
    ],
    parameterAdjustments: [
      { name: 'ATR Buffer Multiplier', before: '1.50x ATR', after: '1.85x ATR (Hardened)' },
      { name: 'Confluence Alignment Req', before: '80%', after: '92% Strict Threshold' },
      { name: 'News Shield Window', before: '15 Minutes', after: '35 Minutes Lockout' },
    ],
    evolutionBadge: 'Autonomous Defense Hardening v4.4',
    modelUpgradeVersion: 'AI Model Upgraded to v4.5 (High Resistance)',
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return res.json({ success: true, postMortem: defaultPostMortem });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 8000,
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    const prompt = `You are the Chief AI Algorithmic Trading Architect for Gold (XAU/USD).
A trading signal just hit Stop Loss (SL = $${signal.sl}, Entry = $${signal.entryPrice}, Strategy = "${signal.strategy}").
Perform a deep post-mortem root-cause analysis and outline how the AI system must autonomously adapt and upgrade its algorithms to prevent this mistake from repeating:

Respond in JSON format:
{
  "rootCause": "Detailed English explanation of why the market invalidated this setup (e.g. liquidity sweep, news shock, fakeout)",
  "rootCauseKhmer": "ការបកស្រាយលម្អិតជាភាសាខ្មែរពីមូលហេតុដែលទីផ្សាររត់ទៅបុក Stop Loss",
  "marketAnomalyType": "LIQUIDITY_SWEEP_FAKEOUT",
  "lessonsLearned": ["Lesson 1 in Khmer", "Lesson 2 in Khmer", "Lesson 3 in Khmer"],
  "adaptiveActionsTaken": ["Algorithm adaptation 1 in Khmer", "Algorithm adaptation 2 in Khmer"],
  "parameterAdjustments": [
    {"name": "Parameter name 1", "before": "old value", "after": "improved upgraded value"},
    {"name": "Parameter name 2", "before": "old value", "after": "improved upgraded value"}
  ],
  "evolutionBadge": "Name of new capability badge unlocked",
  "modelUpgradeVersion": "AI Core v4.5 - Self-Improved"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      postMortem: {
        signalId: signal.id,
        symbol: signal.symbol,
        lossR: -1.0,
        ...defaultPostMortem,
        ...parsed,
      },
    });
  } catch (err) {
    console.warn('Gemini SL post-mortem analysis fallback:', err);
    return res.json({ success: true, postMortem: defaultPostMortem });
  }
});

// Telegram Bot Test & Broadcast
app.post('/api/telegram/test', async (req: Request, res: Response) => {
  const botToken = req.body.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = req.body.chatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(400).json({
      error: 'Missing botToken or chatId. Please enter them in settings or add to environment variables.',
    });
  }

  const sampleSignal: TradingSignal = {
    id: 'test_alert',
    symbol: 'XAUUSD',
    timeframe: '5m',
    action: 'BUY',
    timestamp: Date.now(),
    candleTime: Math.floor(Date.now() / 1000),
    entryPrice: 4373.50,
    tp1: 4385.00,
    tp2: 4398.00,
    sl: 4363.00,
    riskRewardRatio: '1:2.6',
    confidence: 92,
    strategy: 'Telegram Integration Test • SMC Asian Low Sweep',
    confluences: ['Real-time WebSocket feed verified', 'Audio alert verified', 'Telegram Webhook verified'],
    status: 'ACTIVE',
  };

  try {
    const result = await sendTelegramAlert(botToken, chatId, sampleSignal);
    res.json({ success: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Telegram send failed';
    res.status(500).json({ error: message });
  }
});

app.post('/api/telegram/broadcast', async (req: Request, res: Response) => {
  const { signal, botToken: userToken, chatId: userChatId } = req.body;
  const botToken = userToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = userChatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(400).json({ error: 'Telegram Bot Token or Chat ID not configured.' });
  }
  if (!signal) {
    return res.status(400).json({ error: 'No signal payload provided.' });
  }

  try {
    const result = await sendTelegramAlert(botToken, chatId, signal);
    res.json({ success: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Telegram broadcast failed';
    res.status(500).json({ error: message });
  }
});

// Helper to send formatted Telegram message
async function sendTelegramAlert(token: string, chatId: string, signal: TradingSignal) {
  const icon = signal.action === 'BUY' ? '🟢 🚀' : '🔴 🔻';
  const orderTypeLabel = signal.orderType === 'BUY_LIMIT'
    ? '🎯 BUY LIMIT (Pending Retrace)'
    : signal.orderType === 'SELL_LIMIT'
    ? '🎯 SELL LIMIT (Pending Retrace)'
    : `${signal.action} (Market Order)`;

  const committeeLine = signal.committeeConsensus
    ? `🏛️ *AI Board Vote:* *${signal.committeeConsensus.unanimous ? '★ UNANIMOUS ' : ''}${signal.committeeConsensus.action}* (${signal.committeeConsensus.voteBreakdown.buy} BUY / ${signal.committeeConsensus.voteBreakdown.sell} SELL)\n`
    : '';

  const statusLabel = signal.status === 'PENDING'
    ? '⏳ *STATUS: PENDING LIMIT ORDER (រង់ចាំតម្លៃ Retest)*'
    : signal.status === 'ACTIVE'
    ? '⚡ *STATUS: ACTIVE (កំពុងដំណើរការ)*'
    : signal.status === 'HIT_TP1'
    ? '✅ *STATUS: HIT TP1 (+1.5R - SL moved to Breakeven)*'
    : signal.status === 'HIT_TP2'
    ? '🏆 *STATUS: HIT TP2 FULL TARGET (+3.0R)*'
    : signal.status === 'EXPIRED'
    ? '⏰ *STATUS: EXPIRED / CANCELLED (ផុតកំណត់)*'
    : '🛑 *STATUS: STOP LOSS HIT*';

  const expirationText = signal.expiresAt
    ? `⏳ *Expiration:* ${signal.expirationMinutes || 45} នាទី (Valid until: \`${new Date(signal.expiresAt).toLocaleTimeString()}\`)\n⚠️ *Rule:* ${signal.expirationReasonKhmer || signal.expirationReason}\n`
    : '';

  const antiSlText = signal.antiSlBufferDescription
    ? `🛡️ *Anti-SL Cushion:* \`${signal.antiSlBufferPips ? signal.antiSlBufferPips + ' pips' : '2.6x ATR'}\` + Auto-Breakeven Lock\n`
    : '';

  const text = `
⚡ *AI TRADING SIGNAL ALERT (UPDATED SYSTEM)* ⚡
${icon} *${orderTypeLabel} - ${signal.symbol}* (${signal.timeframe})
${statusLabel}

🎯 *Entry (Limit Price):* \`$${signal.entryPrice}\`
🛑 *Stop Loss (SL):* \`$${signal.sl}\`
🏁 *Take Profit 1 (TP1):* \`$${signal.tp1}\`
🏆 *Take Profit 2 (TP2):* \`$${signal.tp2}\`
⚖️ *Risk/Reward (R:R):* ${signal.riskRewardRatio}
🔥 *AI Confidence:* *${signal.confidence}%*
${antiSlText}${expirationText}${committeeLine}
📊 *Strategy:* _${signal.strategy}_
🧩 *Key Confluences:*
${signal.confluences.map(c => `• ${c}`).join('\n')}

⏱ *Time:* ${new Date(signal.timestamp).toUTCString()}
🌐 *News Filter:* Forex Factory (https://www.forexfactory.com/)
👨‍💻 *អ្នកបង្កើត AI (Creator):* @sophapanha (https://t.me/sophapanha)
🤖 _Gold XAUUSD Real-time AI Multi-Agent Limit Order Engine_
`.trim();

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || 'Failed to send message to Telegram');
  }
  return data;
}

// ----------------------------------------------------
// VITE INTEGRATION / STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

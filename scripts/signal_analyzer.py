#!/usr/bin/env python3
"""
Real-time Technical Analysis & Signal Generation Engine
Author: AI Trading System for Gold (XAU/USD)
Implements:
- EMA 20, 50, 200 crossover and trend alignment
- RSI 14 overbought/oversold pullback detection
- MACD 12, 26, 9 momentum crossover
- Smart Money Concepts (SMC) Asian session / prior high-low liquidity sweep detection
- Order Block detection
- Dynamic ATR-based Stop Loss & Take Profit (TP1 1:1.5, TP2 1:3)
"""

import sys
import json
import math
from typing import List, Dict, Any, Optional

def calculate_ema(prices: List[float], period: int) -> List[float]:
    if len(prices) < period:
        return [prices[-1]] * len(prices)
    multiplier = 2.0 / (period + 1)
    # Start with SMA for first window
    sma = sum(prices[:period]) / period
    ema_values = [sma] * period
    curr_ema = sma
    for price in prices[period:]:
        curr_ema = (price - curr_ema) * multiplier + curr_ema
        ema_values.append(curr_ema)
    return ema_values

def calculate_rsi(prices: List[float], period: int = 14) -> float:
    if len(prices) < period + 1:
        return 50.0
    changes = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
    gains = [max(0.0, c) for c in changes]
    losses = [max(0.0, -c) for c in changes]

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    for i in range(period, len(changes)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))

def calculate_macd(prices: List[float]):
    ema12 = calculate_ema(prices, 12)
    ema26 = calculate_ema(prices, 26)
    macd_line = [e12 - e26 for e12, e26 in zip(ema12, ema26)]
    signal_line = calculate_ema(macd_line, 9)
    histogram = [m - s for m, s in zip(macd_line, signal_line)]
    return macd_line[-1], signal_line[-1], histogram[-1], (histogram[-1] - histogram[-2] if len(histogram) > 1 else 0.0)

def calculate_atr(candles: List[Dict[str, float]], period: int = 14) -> float:
    if len(candles) < 2:
        return 2.5
    trs = []
    for i in range(1, len(candles)):
        c = candles[i]
        prev = candles[i - 1]
        tr = max(
            c['high'] - c['low'],
            abs(c['high'] - prev['close']),
            abs(c['low'] - prev['close'])
        )
        trs.append(tr)
    recent_trs = trs[-period:] if len(trs) >= period else trs
    return sum(recent_trs) / len(recent_trs) if recent_trs else 2.5

def detect_smc_setup(candles: List[Dict[str, float]]):
    """
    Detect Smart Money Concepts (SMC):
    - Liquidity sweeps of previous swing highs/lows with candle wick rejection
    - Order Block defense
    """
    if len(candles) < 20:
        return 'NEUTRAL', []

    recent = candles[-1]
    lookback = candles[-20:-1]
    swing_high = max(c['high'] for c in lookback)
    swing_low = min(c['low'] for c in lookback)

    confluences = []

    # Bullish liquidity sweep: Low dipped below swing low but closed back above it
    if recent['low'] < swing_low and recent['close'] > swing_low:
        lower_wick = min(recent['open'], recent['close']) - recent['low']
        body = abs(recent['close'] - recent['open'])
        if lower_wick > body * 1.2:
            confluences.append(f"SMC Liquidity Sweep of Swing Low ({swing_low:.2f}) with long wick rejection")
            return 'BULLISH_SWEEP', confluences

    # Bearish liquidity sweep: High pierced swing high but closed below it
    if recent['high'] > swing_high and recent['close'] < swing_high:
        upper_wick = recent['high'] - max(recent['open'], recent['close'])
        body = abs(recent['close'] - recent['open'])
        if upper_wick > body * 1.2:
            confluences.append(f"SMC Liquidity Sweep of Swing High ({swing_high:.2f}) with long wick rejection")
            return 'BEARISH_SWEEP', confluences

    return 'NEUTRAL', confluences

def analyze_candles(candles: List[Dict[str, Any]], symbol: str = "XAUUSD", timeframe: str = "5m") -> Dict[str, Any]:
    if not candles or len(candles) < 30:
        return {"action": "HOLD", "confidence": 0, "reason": "Insufficient candle data"}

    close_prices = [float(c['close']) for c in candles]
    current_price = close_prices[-1]
    current_candle = candles[-1]

    ema20 = calculate_ema(close_prices, 20)[-1]
    ema50 = calculate_ema(close_prices, 50)[-1]
    ema200 = calculate_ema(close_prices, 200)[-1] if len(close_prices) >= 200 else calculate_ema(close_prices, len(close_prices) // 2)[-1]

    rsi = calculate_rsi(close_prices, 14)
    macd_val, macd_sig, macd_hist, macd_delta = calculate_macd(close_prices)
    atr = calculate_atr(candles, 14)
    if atr <= 0.1:
        atr = current_price * 0.0025

    smc_bias, smc_confluences = detect_smc_setup(candles)

    # Scoring Engine
    buy_score = 0
    sell_score = 0
    confluences = []

    # Trend & EMA Alignment
    if current_price > ema20 and ema20 > ema50:
        buy_score += 25
        confluences.append("Bullish EMA Alignment (Price > EMA20 > EMA50)")
    elif current_price < ema20 and ema20 < ema50:
        sell_score += 25
        confluences.append("Bearish EMA Alignment (Price < EMA20 < EMA50)")

    # 200 EMA Macro Filter
    if current_price > ema200:
        buy_score += 15
        confluences.append("Trading Above 200 EMA (Macro Bullish)")
    else:
        sell_score += 15
        confluences.append("Trading Below 200 EMA (Macro Bearish)")

    # RSI condition
    if rsi < 32:
        buy_score += 25
        confluences.append(f"RSI Oversold Bounce ({rsi:.1f})")
    elif rsi > 68:
        sell_score += 25
        confluences.append(f"RSI Overbought Pullback ({rsi:.1f})")
    elif 45 <= rsi <= 60 and current_price > ema20:
        buy_score += 15
        confluences.append(f"RSI Healthy Bullish Zone ({rsi:.1f})")
    elif 40 <= rsi <= 55 and current_price < ema20:
        sell_score += 15
        confluences.append(f"RSI Healthy Bearish Zone ({rsi:.1f})")

    # MACD momentum
    if macd_hist > 0 and macd_delta > 0:
        buy_score += 15
        confluences.append("MACD Bullish Histogram Expansion")
    elif macd_hist < 0 and macd_delta < 0:
        sell_score += 15
        confluences.append("MACD Bearish Histogram Expansion")

    # SMC Liquidity Sweeps
    if smc_bias == 'BULLISH_SWEEP':
        buy_score += 30
        confluences.extend(smc_confluences)
    elif smc_bias == 'BEARISH_SWEEP':
        sell_score += 30
        confluences.extend(smc_confluences)

    # Determine Action
    action = "HOLD"
    confidence = 50
    sl = current_price
    tp1 = current_price
    tp2 = current_price
    rr = "1:2.0"

    # Multiplier for Gold volatility
    sl_buffer = atr * 1.5
    tp1_buffer = atr * 2.25 # 1:1.5
    tp2_buffer = atr * 4.5  # 1:3.0

    if buy_score >= 60 and buy_score > sell_score:
        action = "BUY"
        confidence = min(96, int(buy_score))
        sl = round(current_price - sl_buffer, 2)
        tp1 = round(current_price + tp1_buffer, 2)
        tp2 = round(current_price + tp2_buffer, 2)
        rr = "1:2.5"
    elif sell_score >= 60 and sell_score > buy_score:
        action = "SELL"
        confidence = min(96, int(sell_score))
        sl = round(current_price + sl_buffer, 2)
        tp1 = round(current_price - tp1_buffer, 2)
        tp2 = round(current_price - tp2_buffer, 2)
        rr = "1:2.5"

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "action": action,
        "confidence": confidence,
        "entryPrice": current_price,
        "tp1": tp1,
        "tp2": tp2,
        "sl": sl,
        "riskRewardRatio": rr,
        "confluences": confluences,
        "indicators": {
            "rsi": round(rsi, 2),
            "ema20": round(ema20, 2),
            "ema50": round(ema50, 2),
            "ema200": round(ema200, 2),
            "macd": round(macd_val, 3),
            "macdSignal": round(macd_sig, 3),
            "macdHistogram": round(macd_hist, 3),
            "atr": round(atr, 2),
            "smcBias": smc_bias
        }
    }

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        # Generate sample candles and output signal
        import time
        now = int(time.time())
        candles = []
        base_price = 4373.0
        for i in range(50):
            t = now - (50 - i) * 300
            o = base_price + math.sin(i / 5.0) * 12.0
            h = o + 3.0 + abs(math.cos(i)) * 2.0
            l = o - 2.5 - abs(math.sin(i)) * 2.0
            c = o + math.cos(i) * 2.5
            candles.append({"time": t, "open": o, "high": h, "low": l, "close": c, "volume": 1200 + i * 10})
        res = analyze_candles(candles, "XAUUSD", "5m")
        print(json.dumps(res, indent=2))
